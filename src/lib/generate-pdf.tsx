import { pdf } from "@react-pdf/renderer"
import { ResumeDocument } from "./pdf/document"
import type { SectionTitleResolver } from "./pdf/section-title"
import type { ResumeData } from "./schema/data"
import type { Template } from "./schema/templates"
export const englishSectionTitleResolver: SectionTitleResolver = (input) =>
  input.defaultEnglishTitle ?? input.sectionId
export async function generatePdfBlob(data: ResumeData, template: Template): Promise<Blob> {
  const element = (
    <ResumeDocument
      data={data}
      template={template}
      resolveSectionTitle={englishSectionTitleResolver}
    />
  )
  return await pdf(element).toBlob()
}
