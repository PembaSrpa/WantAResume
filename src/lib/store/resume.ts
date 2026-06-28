// New file — not ported from Reactive Resume. Written per the original task specification:
// a standalone Zustand store (no monorepo equivalent exists) that persists resume `data`
// and `template` selection to localStorage under the key "resume-builder".
//
// Section/item mutators (added after initial scaffold) operate on data.sections and, for
// section ordering, on data.layout.pages[0].main/sidebar. KNOWN LIMITATION: the editor UI has
// no way to move a section between main and sidebar -- SectionAccordion presents one flat,
// reorderable list of all built-in section types regardless of which column they're actually
// in. reorderSections (below) respects each section's CURRENT main/sidebar placement and only
// reorders within it; it does not (and structurally cannot, without a real UI for it) let the
// accordion's reorder action move a section between columns.
//
// BUG FIX (see reorderSections below): this used to write the accordion's entire flat list
// directly into pages[0].main on every reorder, while never touching pages[0].sidebar. That
// corrupted layout the moment any section was ever reordered: every sidebar-type section
// (skills, languages, certifications, awards, interests, publications) ended up duplicated
// into both main and sidebar at once (confirmed via real generated PDF output -- duplicate
// content, plus a React "duplicate key" warning from the renderer), and "summary" (which lives
// in main but isn't part of the accordion's managed list) got silently dropped from main
// entirely on first reorder, since the accordion's list never includes it.

import type { ResumeData, SectionType, SectionData } from "../schema/data";
import type { Template } from "../schema/templates";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultResumeData } from "../schema/defaults";

type ResumeStore = {
	data: ResumeData;
	template: Template;
	setData: (data: ResumeData) => void;
	updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
	setTemplate: (template: Template) => void;
	resetToDefault: () => void;

	// Section-level mutators (operate on data.sections)
	updateSection: <T extends SectionType>(
		sectionType: T,
		updates: Partial<Omit<SectionData<T>, "items">>,
	) => void;
	reorderSections: (newOrder: string[]) => void;

	// Item-level mutators (operate on data.sections[type].items)
	upsertSectionItem: <T extends SectionType>(
		sectionType: T,
		item: SectionData<T>["items"][number],
	) => void;
	removeSectionItem: (sectionType: SectionType, itemId: string) => void;
	reorderSectionItems: (sectionType: SectionType, fromIndex: number, toIndex: number) => void;
};

const defaultTemplate: Template = "onyx";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
	const next = items.slice();
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

export const useResumeStore = create<ResumeStore>()(
	persist(
		(set) => ({
			data: defaultResumeData(),
			template: defaultTemplate,

			setData: (data) => set({ data }),

			updateField: (key, value) =>
				set((state) => ({
					data: {
						...state.data,
						[key]: value,
					},
				})),

			setTemplate: (template) => set({ template }),

			resetToDefault: () =>
				set({
					data: defaultResumeData(),
					template: defaultTemplate,
				}),

			updateSection: (sectionType, updates) =>
				set((state) => ({
					data: {
						...state.data,
						sections: {
							...state.data.sections,
							[sectionType]: {
								...state.data.sections[sectionType],
								...updates,
							},
						},
					},
				})),

			reorderSections: (newOrder) =>
				set((state) => {
					const pages = state.data.metadata.layout.pages;
					const [firstPage, ...restPages] = pages;

					const sidebarSet = new Set(firstPage.sidebar);
					const newOrderSet = new Set(newOrder);

					// Split the accordion's flat list back into main/sidebar by each
					// section's CURRENT placement -- the accordion shows one merged
					// list for convenience, but that's a UI affordance only; there's
					// no control anywhere for actually moving a section between
					// columns, so a reorder action should only ever change order
					// *within* a column, never membership.
					const newMain: string[] = [];
					const newSidebar: string[] = [];
					for (const id of newOrder) {
						if (sidebarSet.has(id)) newSidebar.push(id);
						else newMain.push(id);
					}

					// Anything reorderSections' caller doesn't manage -- "summary",
					// custom-section UUIDs, or any id missing from newOrder -- stays
					// in its exact original slot instead of being dropped. Only ids
					// that are actually part of newOrder get replaced, in sequence.
					const rebuild = (original: string[], replacements: string[]) => {
						const queue = [...replacements];
						const result = original.map((id) => {
							if (!newOrderSet.has(id)) return id;
							const next = queue.shift();
							return next ?? id;
						});
						return [...result, ...queue];
					};

					return {
						data: {
							...state.data,
							metadata: {
								...state.data.metadata,
								layout: {
									...state.data.metadata.layout,
									pages: [
										{
											...firstPage,
											main: rebuild(firstPage.main, newMain),
											sidebar: rebuild(firstPage.sidebar, newSidebar),
										},
										...restPages,
									],
								},
							},
						},
					};
				}),

			upsertSectionItem: (sectionType, item) =>
				set((state) => {
					const section = state.data.sections[sectionType];
					const exists = section.items.some((existing) => existing.id === item.id);
					const items = exists
						? section.items.map((existing) => (existing.id === item.id ? item : existing))
						: [...section.items, item];
					return {
						data: {
							...state.data,
							sections: {
								...state.data.sections,
								[sectionType]: { ...section, items },
							},
						},
					};
				}),

			removeSectionItem: (sectionType, itemId) =>
				set((state) => {
					const section = state.data.sections[sectionType];
					return {
						data: {
							...state.data,
							sections: {
								...state.data.sections,
								[sectionType]: {
									...section,
									items: section.items.filter((item) => item.id !== itemId),
								},
							},
						},
					};
				}),

			reorderSectionItems: (sectionType, fromIndex, toIndex) =>
				set((state) => {
					const section = state.data.sections[sectionType];
					// section.items is always internally consistent at runtime (we never
					// mix item types across sections); TS can't prove that through the
					// generic SectionType param here, hence the narrow assertion.
					const items = moveItem(section.items as unknown[], fromIndex, toIndex) as typeof section.items;
					return {
						data: {
							...state.data,
							sections: {
								...state.data.sections,
								[sectionType]: {
									...section,
									items,
								},
							},
						},
					};
				}),
		}),
		{
			name: "resume-builder",
			version: 1,
			migrate: (persistedState, version) => {
				const state = persistedState as { data?: ResumeData; template?: Template } | null;
				const firstPage = state?.data?.metadata?.layout?.pages?.[0];

				if (version < 1 && firstPage) {
					// One-time cleanup for data corrupted by the pre-fix
					// reorderSections, which wrote every section type into
					// pages[0].main on any reorder while leaving pages[0].sidebar
					// untouched -- duplicating every sidebar-type section into
					// both arrays. sidebar was never mutated by that bug, so it's
					// reliable ground truth: anything also present there gets
					// removed from main.
					const [page, ...restPages] = state!.data!.metadata.layout.pages;
					const sidebarSet = new Set(page.sidebar);
					const cleanedMain = page.main.filter((id) => !sidebarSet.has(id));

					return {
						...state,
						data: {
							...state!.data!,
							metadata: {
								...state!.data!.metadata,
								layout: {
									...state!.data!.metadata.layout,
									pages: [{ ...page, main: cleanedMain }, ...restPages],
								},
							},
						},
					};
				}

				return state;
			},
			partialize: (state) => ({
				data: state.data,
				template: state.template,
			}),
		},
	),
);
