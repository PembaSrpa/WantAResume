// New file — not ported from Reactive Resume. Written per the original task specification:
// a standalone Zustand store (no monorepo equivalent exists) that persists resume `data`
// and `template` selection to localStorage under the key "resume-builder".
//
// Section/item mutators (added after initial scaffold) operate on data.sections and, for
// section ordering, on data.layout.pages[0].main only. KNOWN LIMITATION: the editor UI has
// no concept yet of multiple pages or main/sidebar column placement — everything is assumed
// to live in pages[0].main. reorderSections and this store will need real rework if/when
// multi-page layout or sidebar placement becomes an actual editor feature.

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
					return {
						data: {
							...state.data,
							metadata: {
								...state.data.metadata,
								layout: {
									...state.data.metadata.layout,
									pages: [{ ...firstPage, main: newOrder }, ...restPages],
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
			partialize: (state) => ({
				data: state.data,
				template: state.template,
			}),
		},
	),
);
