// Ported from Reactive Resume (packages/pdf/src/templates/shared/split-row.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

export const hasSplitRowText = (value: string | undefined): value is string => {
	return typeof value === "string" && value.trim().length > 0;
};

type SplitRowContent = { top: string; bottom: string };

export const promoteSplitRowRight = ({ top, bottom }: SplitRowContent): SplitRowContent => {
	if (hasSplitRowText(top)) return { top, bottom: hasSplitRowText(bottom) ? bottom : "" };

	return { top: hasSplitRowText(bottom) ? bottom : "", bottom: "" };
};
