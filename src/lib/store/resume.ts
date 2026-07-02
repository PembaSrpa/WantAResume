import type { ResumeData, SectionType, SectionData, CustomSection } from "../schema/data"
import type { Template } from "../schema/templates"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"
import { defaultResumeData } from "../schema/defaults"
export type EditorResetTab = "basics" | "sections" | "design"
export type GenericSectionType = Exclude<SectionType, "experience">
type GenericSectionItem = Record<string, unknown> & {
  id: string
  hidden: boolean
}
type ResumeStore = {
  data: ResumeData
  template: Template
  setData: (data: ResumeData) => void
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void
  setTemplate: (template: Template) => void
  resetToDefault: () => void
  resetTab: (tab: EditorResetTab) => void
  updateSection: <T extends SectionType>(
    sectionType: T,
    updates: Partial<Omit<SectionData<T>, "items">>
  ) => void
  reorderSections: (newOrder: string[]) => void
  upsertSectionItem: <T extends SectionType>(
    sectionType: T,
    item: SectionData<T>["items"][number]
  ) => void
  upsertGenericSectionItem: (sectionType: GenericSectionType, item: GenericSectionItem) => void
  removeSectionItem: (sectionType: SectionType, itemId: string) => void
  reorderSectionItems: (sectionType: SectionType, fromIndex: number, toIndex: number) => void
  addCustomSection: (type: GenericSectionType, placement: "main" | "sidebar") => string
  removeCustomSection: (id: string) => void
  updateCustomSection: (
    id: string,
    updates: Partial<Pick<CustomSection, "title" | "icon" | "columns" | "hidden" | "type">>
  ) => void
  upsertCustomSectionItem: (id: string, item: GenericSectionItem) => void
  removeCustomSectionItem: (id: string, itemId: string) => void
  reorderCustomSectionItems: (id: string, fromIndex: number, toIndex: number) => void
}
const defaultTemplate: Template = "onyx"
function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = items.slice()
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}
export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: defaultResumeData(),
      template: defaultTemplate,
      setData: (data) => set({ data }),
      updateField: (key, value) =>
        set((state) => ({
          data: {
            ...state.data,
            [key]: value,
          },
        })),
      setTemplate: (template) => set({ template }),
      resetToDefault: () =>
        set({
          data: defaultResumeData(),
          template: defaultTemplate,
        }),
      resetTab: (tab) =>
        set((state) => {
          const fresh = defaultResumeData()
          if (tab === "basics") {
            return {
              data: {
                ...state.data,
                basics: fresh.basics,
                picture: fresh.picture,
              },
            }
          }
          if (tab === "sections") {
            return {
              data: {
                ...state.data,
                sections: fresh.sections,
                summary: fresh.summary,
                customSections: fresh.customSections,
              },
            }
          }
          return {
            data: {
              ...state.data,
              metadata: {
                ...state.data.metadata,
                design: fresh.metadata.design,
                typography: fresh.metadata.typography,
                page: fresh.metadata.page,
              },
            },
          }
        }),
      updateSection: (sectionType, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            sections: {
              ...state.data.sections,
              [sectionType]: {
                ...state.data.sections[sectionType],
                ...updates,
              },
            },
          },
        })),
      reorderSections: (newOrder) =>
        set((state) => {
          const pages = state.data.metadata.layout.pages
          const [firstPage, ...restPages] = pages
          const sidebarSet = new Set(firstPage.sidebar)
          const newOrderSet = new Set(newOrder)
          const newMain: string[] = []
          const newSidebar: string[] = []
          for (const id of newOrder) {
            if (sidebarSet.has(id)) newSidebar.push(id)
            else newMain.push(id)
          }
          const rebuild = (original: string[], replacements: string[]) => {
            const queue = [...replacements]
            const result = original.map((id) => {
              if (!newOrderSet.has(id)) return id
              const next = queue.shift()
              return next ?? id
            })
            return [...result, ...queue]
          }
          return {
            data: {
              ...state.data,
              metadata: {
                ...state.data.metadata,
                layout: {
                  ...state.data.metadata.layout,
                  pages: [
                    {
                      ...firstPage,
                      main: rebuild(firstPage.main, newMain),
                      sidebar: rebuild(firstPage.sidebar, newSidebar),
                    },
                    ...restPages,
                  ],
                },
              },
            },
          }
        }),
      upsertSectionItem: (sectionType, item) =>
        set((state) => {
          const section = state.data.sections[sectionType]
          const exists = section.items.some((existing) => existing.id === item.id)
          const items = exists
            ? section.items.map((existing) => (existing.id === item.id ? item : existing))
            : [...section.items, item]
          return {
            data: {
              ...state.data,
              sections: {
                ...state.data.sections,
                [sectionType]: { ...section, items },
              },
            },
          }
        }),
      upsertGenericSectionItem: (sectionType, item) =>
        set((state) => {
          const sections = state.data.sections as unknown as Record<
            GenericSectionType,
            SectionData<GenericSectionType> & {
              items: GenericSectionItem[]
            }
          >
          const section = sections[sectionType]
          const exists = section.items.some((existing) => existing.id === item.id)
          const items = exists
            ? section.items.map((existing) => (existing.id === item.id ? item : existing))
            : [...section.items, item]
          return {
            data: {
              ...state.data,
              sections: {
                ...state.data.sections,
                [sectionType]: { ...section, items },
              },
            },
          }
        }),
      removeSectionItem: (sectionType, itemId) =>
        set((state) => {
          const section = state.data.sections[sectionType]
          return {
            data: {
              ...state.data,
              sections: {
                ...state.data.sections,
                [sectionType]: {
                  ...section,
                  items: section.items.filter((item) => item.id !== itemId),
                },
              },
            },
          }
        }),
      reorderSectionItems: (sectionType, fromIndex, toIndex) =>
        set((state) => {
          const section = state.data.sections[sectionType]
          const items = moveItem(
            section.items as unknown[],
            fromIndex,
            toIndex
          ) as typeof section.items
          return {
            data: {
              ...state.data,
              sections: {
                ...state.data.sections,
                [sectionType]: {
                  ...section,
                  items,
                },
              },
            },
          }
        }),
      addCustomSection: (type, placement) => {
        const id = uuidv4()
        set((state) => {
          const newSection: CustomSection = {
            id,
            title: "",
            icon: "",
            columns: 1,
            hidden: false,
            type,
            items: [],
          }
          const [firstPage, ...restPages] = state.data.metadata.layout.pages
          const nextPage =
            placement === "sidebar"
              ? { ...firstPage, sidebar: [...firstPage.sidebar, id] }
              : { ...firstPage, main: [...firstPage.main, id] }
          return {
            data: {
              ...state.data,
              customSections: [...state.data.customSections, newSection],
              metadata: {
                ...state.data.metadata,
                layout: {
                  ...state.data.metadata.layout,
                  pages: [nextPage, ...restPages],
                },
              },
            },
          }
        })
        return id
      },
      removeCustomSection: (id) =>
        set((state) => {
          const [firstPage, ...restPages] = state.data.metadata.layout.pages
          return {
            data: {
              ...state.data,
              customSections: state.data.customSections.filter((section) => section.id !== id),
              metadata: {
                ...state.data.metadata,
                layout: {
                  ...state.data.metadata.layout,
                  pages: [
                    {
                      ...firstPage,
                      main: firstPage.main.filter((sectionId) => sectionId !== id),
                      sidebar: firstPage.sidebar.filter((sectionId) => sectionId !== id),
                    },
                    ...restPages,
                  ],
                },
              },
            },
          }
        }),
      updateCustomSection: (id, updates) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) => {
              if (section.id !== id) return section
              const typeChanged = updates.type !== undefined && updates.type !== section.type
              return {
                ...section,
                ...updates,
                items: typeChanged ? [] : section.items,
              }
            }),
          },
        })),
      upsertCustomSectionItem: (id, item) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) => {
              if (section.id !== id) return section
              const items = section.items as unknown as GenericSectionItem[]
              const exists = items.some((existing) => existing.id === item.id)
              const nextItems = exists
                ? items.map((existing) => (existing.id === item.id ? item : existing))
                : [...items, item]
              return { ...section, items: nextItems as unknown as CustomSection["items"] }
            }),
          },
        })),
      removeCustomSectionItem: (id, itemId) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) =>
              section.id === id
                ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
                : section
            ),
          },
        })),
      reorderCustomSectionItems: (id, fromIndex, toIndex) =>
        set((state) => ({
          data: {
            ...state.data,
            customSections: state.data.customSections.map((section) =>
              section.id === id
                ? { ...section, items: moveItem(section.items, fromIndex, toIndex) }
                : section
            ),
          },
        })),
    }),
    {
      name: "resume-builder",
      version: 2,
      migrate: (persistedState, version) => {
        let state = persistedState as {
          data?: ResumeData
          template?: Template
        } | null
        let firstPage = state?.data?.metadata?.layout?.pages?.[0]
        if (version < 1 && firstPage) {
          const [page, ...restPages] = state!.data!.metadata.layout.pages
          const sidebarSet = new Set(page.sidebar)
          const cleanedMain = page.main.filter((id) => !sidebarSet.has(id))
          state = {
            ...state,
            data: {
              ...state!.data!,
              metadata: {
                ...state!.data!.metadata,
                layout: {
                  ...state!.data!.metadata.layout,
                  pages: [{ ...page, main: cleanedMain }, ...restPages],
                },
              },
            },
          }
          firstPage = state.data!.metadata.layout.pages[0]
        }
        if (version < 2 && firstPage) {
          const [page, ...restPages] = state!.data!.metadata.layout.pages
          const alreadyPlaced = page.main.includes("summary") || page.sidebar.includes("summary")
          if (!alreadyPlaced) {
            state = {
              ...state,
              data: {
                ...state!.data!,
                metadata: {
                  ...state!.data!.metadata,
                  layout: {
                    ...state!.data!.metadata.layout,
                    pages: [{ ...page, main: ["summary", ...page.main] }, ...restPages],
                  },
                },
              },
            }
          }
        }
        return state
      },
      partialize: (state) => ({
        data: state.data,
        template: state.template,
      }),
    }
  )
)
