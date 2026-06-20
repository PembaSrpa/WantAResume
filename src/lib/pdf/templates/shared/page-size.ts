// Ported from Reactive Resume (packages/pdf/src/templates/shared/page-size.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

import type { Style } from "@react-pdf/types";
import type { ResumeData } from "../../../schema/data";

const A4_PAGE_SIZE = {
	width: 595.28,
	height: 841.89,
} as const;

export const getTemplatePageSize = (format: ResumeData["metadata"]["page"]["format"]) => {
	if (format === "free-form") return { width: A4_PAGE_SIZE.width };
	if (format === "letter") return "LETTER";

	return "A4";
};

export const getTemplatePageMinHeightStyle = (format: ResumeData["metadata"]["page"]["format"]): Style | undefined => {
	if (format !== "free-form") return undefined;

	return { minHeight: A4_PAGE_SIZE.height };
};
