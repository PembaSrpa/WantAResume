import type { FieldConfig } from "./itemFields"
import type { GenericSectionType } from "@/lib/store/resume"
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
export const GENERIC_TYPE_LABELS: Record<GenericSectionType, string> = {
  profiles: "Profiles",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  languages: "Languages",
  interests: "Interests",
  awards: "Awards",
  certifications: "Certifications",
  publications: "Publications",
  volunteer: "Volunteer",
  references: "References",
}
export const GENERIC_SECTION_FIELDS: Record<GenericSectionType, FieldConfig[]> = {
  profiles: [
    { kind: "text", key: "network", label: "Network", placeholder: "LinkedIn" },
    { kind: "text", key: "username", label: "Username", placeholder: "janedoe" },
    { kind: "website", key: "website", urlLabel: "Profile URL" },
    { kind: "icon", key: "icon", label: "Icon" },
    { kind: "icon-color", key: "iconColor", label: "Icon color" },
  ],
  education: [
    { kind: "text", key: "school", label: "School", placeholder: "Stanford University" },
    { kind: "text", key: "degree", label: "Degree", placeholder: "Bachelor of Science" },
    { kind: "text", key: "area", label: "Area of study", placeholder: "Computer Science" },
    { kind: "text", key: "grade", label: "Grade", placeholder: "3.8 GPA" },
    { kind: "text", key: "location", label: "Location", placeholder: "Stanford, CA" },
    { kind: "text", key: "period", label: "Period", placeholder: "e.g. 2018 — 2022" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "Relevant coursework, honors, activities...",
    },
  ],
  projects: [
    { kind: "text", key: "name", label: "Name", placeholder: "Personal Finance Tracker" },
    { kind: "text", key: "period", label: "Period", placeholder: "e.g. 2023 — Present" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "What the project does and your role in it...",
    },
  ],
  skills: [
    { kind: "text", key: "name", label: "Name", placeholder: "TypeScript" },
    { kind: "text", key: "proficiency", label: "Proficiency", placeholder: "e.g. Advanced" },
    { kind: "level", key: "level", label: "Level" },
    { kind: "tags", key: "keywords", label: "Keywords" },
    { kind: "icon", key: "icon", label: "Icon" },
    { kind: "icon-color", key: "iconColor", label: "Icon color" },
  ],
  languages: [
    { kind: "text", key: "language", label: "Language", placeholder: "Spanish" },
    { kind: "text", key: "fluency", label: "Fluency", placeholder: "e.g. Native, B2" },
    { kind: "level", key: "level", label: "Level" },
  ],
  interests: [
    { kind: "text", key: "name", label: "Name", placeholder: "Photography" },
    { kind: "tags", key: "keywords", label: "Keywords" },
    { kind: "icon", key: "icon", label: "Icon" },
    { kind: "icon-color", key: "iconColor", label: "Icon color" },
  ],
  awards: [
    { kind: "text", key: "title", label: "Title", placeholder: "Employee of the Year" },
    { kind: "text", key: "awarder", label: "Awarder", placeholder: "Acme Inc." },
    { kind: "text", key: "date", label: "Date", placeholder: "March 2024" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "Why you received this award...",
    },
  ],
  certifications: [
    {
      kind: "text",
      key: "title",
      label: "Title",
      placeholder: "AWS Certified Solutions Architect",
    },
    { kind: "text", key: "issuer", label: "Issuer", placeholder: "Amazon Web Services" },
    { kind: "text", key: "date", label: "Date", placeholder: "June 2024" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "What the certification covers...",
    },
  ],
  publications: [
    { kind: "text", key: "title", label: "Title", placeholder: "Scaling Distributed Systems" },
    { kind: "text", key: "publisher", label: "Publisher", placeholder: "ACM Journal" },
    { kind: "text", key: "date", label: "Date", placeholder: "January 2024" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "A short summary of the publication...",
    },
  ],
  volunteer: [
    { kind: "text", key: "organization", label: "Organization", placeholder: "Local Food Bank" },
    { kind: "text", key: "location", label: "Location", placeholder: "Austin, TX" },
    { kind: "text", key: "period", label: "Period", placeholder: "e.g. 2021 — Present" },
    { kind: "website", key: "website" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "What you did and the impact you made...",
    },
  ],
  references: [
    { kind: "text", key: "name", label: "Name", placeholder: "John Smith" },
    {
      kind: "text",
      key: "position",
      label: "Position",
      placeholder: "Engineering Director, Acme Inc.",
    },
    { kind: "website", key: "website" },
    { kind: "text", key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567" },
    {
      kind: "textarea-rich",
      key: "description",
      label: "Description",
      placeholder: "How you know this person...",
    },
  ],
}
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
