// Wrapper around Reactive Resume's defaultResumeData const (packages/schema/src/resume/default.ts)
// Exposed as a function so each call returns a fresh, independent object — important for
// "reset to default" actions where mutating the result must not leak across resets.
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai

import { defaultResumeData as defaultResumeDataConst } from "./default";
import type { ResumeData } from "./data";

export function defaultResumeData(): ResumeData {
	return structuredClone(defaultResumeDataConst);
}
