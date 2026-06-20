// Ported from Reactive Resume (packages/schema/src/resume/level-display-sizes.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai
//
// NOTE: not listed in the original porting table, but required by
// pdf/templates/shared/level-display.tsx. Added to keep that import resolvable.

export type ResolveLevelDisplaySizesOptions = {
	bodyFontSize: number;
	iconFontSize?: number | undefined;
	levelFontSize?: number | undefined;
};

export type LevelDisplaySizes = {
	decorationSize: number;
	levelIconExplicitSize?: number | undefined;
};

export const resolveLevelDisplaySizes = (options: ResolveLevelDisplaySizesOptions): LevelDisplaySizes => {
	const defaultDecorationSize = options.bodyFontSize - 2;
	const legacyLevelIconSize = defaultDecorationSize + 4;

	const decorationSize = options.levelFontSize ?? options.iconFontSize ?? defaultDecorationSize;

	if (options.levelFontSize !== undefined) {
		return { decorationSize, levelIconExplicitSize: options.levelFontSize };
	}

	if (options.iconFontSize !== undefined) {
		return { decorationSize };
	}

	return { decorationSize, levelIconExplicitSize: legacyLevelIconSize };
};
