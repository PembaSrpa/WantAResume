// Ported from Reactive Resume (packages/pdf/src/templates/shared/metrics.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

import type { ResumeData } from "../../../schema/data";

type PageMetricsInput = Pick<ResumeData["metadata"]["page"], "gapX" | "gapY" | "marginX" | "marginY">;

export type TemplateMetrics = {
	page: {
		paddingHorizontal: number;
		paddingVertical: number;
	};
	headerGap: number;
	columnGap: number;
	sectionGap: number;
	itemGapX: number;
	itemGapY: number;
	gapX: (factor: number) => number;
	gapY: (factor: number) => number;
};

export const getTemplateMetrics = ({ gapX, gapY, marginX, marginY }: PageMetricsInput): TemplateMetrics => ({
	page: {
		paddingHorizontal: marginX,
		paddingVertical: marginY,
	},
	headerGap: marginY,
	columnGap: marginX,
	sectionGap: marginY,
	itemGapX: gapX,
	itemGapY: gapY,
	gapX: (factor) => gapX * factor,
	gapY: (factor) => gapY * factor,
});
