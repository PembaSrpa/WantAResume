"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "motion/react"
import { Scales } from "@/components/Scales"
import { useResumeStore } from "@/lib/store/resume"
import { templateSchema, type Template } from "@/lib/schema/templates"
const TEMPLATES: Template[] = templateSchema.options
function templateLabel(name: Template) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
export default function HomePage() {
  const router = useRouter()
  const setTemplate = useResumeStore((state) => state.setTemplate)
  function handleSelect(template: Template) {
    setTemplate(template)
    router.push("/editor")
  }
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      <Scales variant="spacious" />
      <div className="mx-auto max-w-6xl px-8 py-16 md:px-16">
        <h1 className="mb-10 text-center text-2xl text-neutral-100">Choose a template</h1>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {TEMPLATES.map((name, index) => (
            <motion.button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center gap-3 text-left"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 transition-colors group-hover:border-orange-700">
                <Image
                  src={`/templates/jpg/${name}.jpg`}
                  alt=""
                  fill
                  aria-hidden="true"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="scale-110 object-cover object-top blur-xl opacity-60"
                />
                <Image
                  src={`/templates/jpg/${name}.jpg`}
                  alt={`${templateLabel(name)} resume template preview`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-contain object-top"
                />
              </div>
              <span className="text-sm text-neutral-300">{templateLabel(name)}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
