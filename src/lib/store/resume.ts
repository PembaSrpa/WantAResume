// New file — not ported from Reactive Resume. Written per the original task specification:
// a standalone Zustand store (no monorepo equivalent exists) that persists resume `data`
// and `template` selection to localStorage under the key "resume-builder".

import type { ResumeData } from "../schema/data";
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
};

const defaultTemplate: Template = "onyx";

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
