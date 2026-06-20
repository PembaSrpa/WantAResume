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
import type { ResumeData } from "./schema/data";
import type { Template } from "./schema/templates";

export async function generatePdfBlob(data: ResumeData, template: Template): Promise<Blob> {
	const element = <ResumeDocument data={data} template={template} />;
	return await pdf(element).toBlob();
}
