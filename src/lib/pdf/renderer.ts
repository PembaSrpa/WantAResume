// Ported from Reactive Resume (packages/pdf/src/renderer.ts)
// Original project: https://github.com/AmruthPillai/Reactive-Resume — MIT License
// Copyright (c) 2026 Amruth Pillai
//
// NOTE: the original file re-exports from the subpath import alias "#react-pdf-renderer",
// which is defined in packages/pdf/package.json's "imports" field to map directly to
// "@react-pdf/renderer" (no transformation). Since this project has no monorepo-level
// import alias machinery, we import directly from "@react-pdf/renderer" instead.

export {
	Document,
	Font,
	Image,
	Link,
	Page,
	pdf,
	renderToBuffer,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
