// Ported from Reactive Resume (packages/pdf/src/templates/shared/safe-text-style.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

import type { Style } from "@react-pdf/types";

export const safeTextStyle = {
	minWidth: 0,
	maxWidth: "100%",
	flexShrink: 1,
	overflow: "hidden",
} satisfies Style;
