// Ported from Reactive Resume (packages/schema/src/resume/section-icons.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai
//
// NOTE: not listed in the original porting table, but required by pdf/section-icon.ts.
// Added to keep that import resolvable.

import type { CustomSectionType } from "./data";

export const defaultSectionIconNames = {
	summary: "article",
	profiles: "messenger-logo",
	experience: "briefcase",
	education: "graduation-cap",
	projects: "code-simple",
	skills: "compass-tool",
	languages: "translate",
	interests: "football",
	awards: "trophy",
	certifications: "certificate",
	publications: "books",
	volunteer: "hand-heart",
	references: "phone",
	"cover-letter": "envelope-simple",
} as const satisfies Record<CustomSectionType, string>;

export const getDefaultSectionIconName = (sectionType: CustomSectionType): string =>
	defaultSectionIconNames[sectionType];
