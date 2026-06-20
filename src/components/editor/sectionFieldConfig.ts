import type { FieldConfig } from "./GenericItemModal"
import type {
  SectionType,
  ProfileItem,
  EducationItem,
  ProjectItem,
  SkillItem,
  LanguageItem,
  InterestItem,
  AwardItem,
  CertificationItem,
  PublicationItem,
  VolunteerItem,
  ReferenceItem,
} from "@/lib/schema/data"

// Real field shapes per src/lib/schema/data.ts — not the Task B doc's table,
// which was found to diverge in several places (see SectionAccordion notes).
// Experience is intentionally excluded: its roles[] sub-modal doesn't fit
// this generic shape and stays hand-written in SectionItemModal.tsx.

export const GENERIC_SECTION_FIELDS: Partial<Record<SectionType, FieldConfig[]>> = {
  profiles: [
    { kind: "text", key: "network", label: "Network" },
    { kind: "text", key: "username", label: "Username" },
    { kind: "website", key: "website", urlLabel: "Profile URL" },
  ],
  education: [
    { kind: "text", key: "school", label: "School" },
    { kind: "text", key: "degree", label: "Degree" },
    { kind: "text", key: "area", label: "Area of study" },
    { kind: "text", key: "grade", label: "Grade" },
    { kind: "text", key: "location", label: "Location" },
    { kind: "text", key: "period", label: "Period", placeholder: "e.g. 2018 — 2022" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  projects: [
    { kind: "text", key: "name", label: "Name" },
    { kind: "text", key: "period", label: "Period" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  skills: [
    { kind: "text", key: "name", label: "Name" },
    { kind: "text", key: "proficiency", label: "Proficiency", placeholder: "e.g. Advanced" },
    { kind: "level", key: "level", label: "Level" },
    { kind: "tags", key: "keywords", label: "Keywords" },
  ],
  languages: [
    { kind: "text", key: "language", label: "Language" },
    { kind: "text", key: "fluency", label: "Fluency", placeholder: "e.g. Native, B2" },
    { kind: "level", key: "level", label: "Level" },
  ],
  interests: [
    { kind: "text", key: "name", label: "Name" },
    { kind: "tags", key: "keywords", label: "Keywords" },
  ],
  awards: [
    { kind: "text", key: "title", label: "Title" },
    { kind: "text", key: "awarder", label: "Awarder" },
    { kind: "text", key: "date", label: "Date" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  certifications: [
    { kind: "text", key: "title", label: "Title" },
    { kind: "text", key: "issuer", label: "Issuer" },
    { kind: "text", key: "date", label: "Date" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  publications: [
    { kind: "text", key: "title", label: "Title" },
    { kind: "text", key: "publisher", label: "Publisher" },
    { kind: "text", key: "date", label: "Date" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  volunteer: [
    { kind: "text", key: "organization", label: "Organization" },
    { kind: "text", key: "location", label: "Location" },
    { kind: "text", key: "period", label: "Period" },
    { kind: "website", key: "website" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
  references: [
    { kind: "text", key: "name", label: "Name" },
    { kind: "text", key: "position", label: "Position" },
    { kind: "website", key: "website" },
    { kind: "text", key: "phone", label: "Phone" },
    { kind: "textarea-rich", key: "description", label: "Description" },
  ],
}

// What shows in the collapsed item row, per section type. Falls back to a
// generic "Untitled" if the relevant field is empty.
export function sectionItemSummary(sectionType: SectionType, item: unknown): string {
  switch (sectionType) {
    case "profiles": {
      const i = item as ProfileItem
      return i.network || i.username || "Untitled"
    }
    case "education": {
      const i = item as EducationItem
      return i.school || i.degree || "Untitled"
    }
    case "projects": {
      const i = item as ProjectItem
      return i.name || "Untitled"
    }
    case "skills": {
      const i = item as SkillItem
      return i.name || "Untitled"
    }
    case "languages": {
      const i = item as LanguageItem
      return i.language || "Untitled"
    }
    case "interests": {
      const i = item as InterestItem
      return i.name || "Untitled"
    }
    case "awards": {
      const i = item as AwardItem
      return i.title || "Untitled"
    }
    case "certifications": {
      const i = item as CertificationItem
      return i.title || "Untitled"
    }
    case "publications": {
      const i = item as PublicationItem
      return i.title || "Untitled"
    }
    case "volunteer": {
      const i = item as VolunteerItem
      return i.organization || "Untitled"
    }
    case "references": {
      const i = item as ReferenceItem
      return i.name || "Untitled"
    }
    default:
      return "Untitled"
  }
}
