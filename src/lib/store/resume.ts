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

// Matches editor/page.tsx's EditorTab/BottomNavTab vocabulary exactly. Kept
// as a separate type here (not imported from the UI layer) since the store
// shouldn't depend on UI code -- the UI layer's EditorTab is structurally
// identical and TypeScript will accept either at call sites.
export type EditorResetTab = "basics" | "sections" | "design";

// The 11 section types managed by the config-driven generic item editor
// (SectionAccordion.tsx's GenericSectionBody + sectionFieldConfig.ts).
// "experience" is excluded: its roles[] sub-array is structurally unique
// and stays on a hand-written path (ExperienceSectionBody / Experience
// ItemModal), using upsertSectionItem directly with its own real
// ExperienceItem type -- no genericity needed there.
export type GenericSectionType = Exclude<SectionType, "experience">;

// Shape produced by the generic item field system (see itemFields.tsx's
// GenericItem). Duplicated here rather than imported, matching
// EditorResetTab above: the store shouldn't depend on UI code, even for a
// type-only import -- keeps this file's public contract self-contained and
// independently readable.
type GenericSectionItem = Record<string, unknown> & { id: string; hidden: boolean };

type ResumeStore = {
	data: ResumeData;
	template: Template;
	setData: (data: ResumeData) => void;
	updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
	setTemplate: (template: Template) => void;
	resetToDefault: () => void;

	// Resets only the fields owned by one editor tab back to real schema
	// defaults, leaving the other two tabs' data completely untouched.
	// "basics" -> data.basics, data.picture
	// "sections" -> data.sections, data.summary, data.customSections
	// "design" -> data.metadata.design, data.metadata.typography, data.metadata.page
	resetTab: (tab: EditorResetTab) => void;

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

	// Config-driven counterpart to upsertSectionItem, for the 11
	// GenericSectionType section types only. The item shape here isn't a
	// single literal SectionItem<T> the way upsertSectionItem's is -- it's
	// assembled dynamically per section type from GENERIC_SECTION_FIELDS
	// (sectionFieldConfig.ts's Record<GenericSectionType, FieldConfig[]>,
	// a required/exhaustive record, so a missing or mistyped section entry
	// fails to compile there). This method is the one sanctioned place that
	// trusts that config's contract at runtime, replacing what used to be
	// an unchecked `as never` cast at each of its two call sites in
	// SectionAccordion.tsx.
	upsertGenericSectionItem: (sectionType: GenericSectionType, item: GenericSectionItem) => void;
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

			resetTab: (tab) =>
				set((state) => {
					// Fresh call every time -- defaultResumeData() deep-clones, so
					// this never risks sharing mutable references with a previous
					// reset or with the live store state.
					const fresh = defaultResumeData();

					if (tab === "basics") {
						return {
							data: {
								...state.data,
								basics: fresh.basics,
								picture: fresh.picture,
							},
						};
					}

					if (tab === "sections") {
						return {
							data: {
								...state.data,
								sections: fresh.sections,
								summary: fresh.summary,
								customSections: fresh.customSections,
							},
						};
					}

					// tab === "design"
					return {
						data: {
							...state.data,
							metadata: {
								...state.data.metadata,
								design: fresh.metadata.design,
								typography: fresh.metadata.typography,
								page: fresh.metadata.page,
							},
						},
					};
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

			upsertGenericSectionItem: (sectionType, item) =>
				set((state) => {
					// The one sanctioned assertion for this method (see its doc
					// comment on the store type above). Reading through this typed
					// view, rather than casting `item` itself at each call site,
					// keeps section.items.some/.map well-behaved on a single
					// concrete element type instead of the awkward union of all
					// 11 sections' distinct item types that indexing with a plain
					// GenericSectionType union would otherwise produce.
					const sections = state.data.sections as unknown as Record<
						GenericSectionType,
						SectionData<GenericSectionType> & { items: GenericSectionItem[] }
					>;
					const section = sections[sectionType];
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
			version: 2,
			migrate: (persistedState, version) => {
				let state = persistedState as { data?: ResumeData; template?: Template } | null;
				let firstPage = state?.data?.metadata?.layout?.pages?.[0];

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

					state = {
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
					firstPage = state.data!.metadata.layout.pages[0];
				}

				if (version < 2 && firstPage) {
					// One-time fix for resumes saved before Summary was wired into
					// the layout system: "summary" was never added to pages[0].main
					// (or sidebar) for these older saves, so it has nowhere to render
					// -- content typed into the Summary form is saved but never shown
					// on the PDF, regardless of template or the section's own hidden
					// flag. Restore it to the front of main, matching where fresh
					// resumes place it by default (see schema/default.ts).
					const [page, ...restPages] = state!.data!.metadata.layout.pages;
					const alreadyPlaced = page.main.includes("summary") || page.sidebar.includes("summary");

					if (!alreadyPlaced) {
						state = {
							...state,
							data: {
								...state!.data!,
								metadata: {
									...state!.data!.metadata,
									layout: {
										...state!.data!.metadata.layout,
										pages: [{ ...page, main: ["summary", ...page.main] }, ...restPages],
									},
								},
							},
						};
					}
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
