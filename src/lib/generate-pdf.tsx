// New file — not ported from Reactive Resume. Written per the original task specification.
//
// NOTE ON FILE EXTENSION: the task document specified this file as `generate-pdf.ts`, but
// it contains JSX (`<ResumeDocument ... />`), which requires the `.tsx` extension to compile
// under TypeScript's JSX handling. Written here as `generate-pdf.tsx` accordingly. Task B's
// dynamic import path should be updated to reference `.tsx` (or omit the extension entirely,
// which works the same in both cases under standard bundler resolution).
//
// Called only in the browser via dynamic import from Task B's UI layer. No Next.js code here.

import { pdf } from "@react-pdf/renderer";
import { ResumeDocument } from "./pdf/document";
import type { SectionTitleResolver } from "./pdf/section-title";
import type { ResumeData } from "./schema/data";
import type { Template } from "./schema/templates";

// BUG FIX: every section's `title` field defaults to "" in the schema
// (see schema/default.ts). SectionShell passes that same empty string as
// both the primary title check AND the `legacyFallback` argument to
// getResumeSectionTitle/resolveSectionTitle. Because resolveSectionTitle
// checks `legacyFallback !== undefined` (true for ""), it returns the
// empty string immediately -- before ever reaching its own sensible
// `defaultEnglishTitle` fallback ("Education", "Experience", etc.).
//
// This app has no real i18n system for resume content (only the editor
// chrome has English/German strings), so there's no translated resolver
// to wire up -- this resolver simply supplies the English default the
// resolution chain already knows how to produce, just via the `resolver`
// argument instead of `legacyFallback`, since the resolver check runs
// first and isn't subject to the same empty-string short-circuit.
export const englishSectionTitleResolver: SectionTitleResolver = (input) =>
	input.defaultEnglishTitle ?? input.sectionId;

export async function generatePdfBlob(data: ResumeData, template: Template): Promise<Blob> {
	const element = (
		<ResumeDocument data={data} template={template} resolveSectionTitle={englishSectionTitleResolver} />
	);
	return await pdf(element).toBlob();
}
