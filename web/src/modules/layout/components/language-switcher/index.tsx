"use client"

import { updateRegion } from "@lib/data/cart"
import { clx } from "@medusajs/ui"
import { usePathname } from "next/navigation"
import { useTransition } from "react"

type LanguageSwitcherProps = {
  countryCode: string
  className?: string
  compact?: boolean
}

const LanguageSwitcher = ({
  countryCode,
  className,
  compact = false,
}: LanguageSwitcherProps) => {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const currentPath = pathname.split(`/${countryCode}`)[1] || ""
  const isFrench = countryCode.toLowerCase() === "fr"

  const options = [
    { label: "FR", country: "fr" },
    { label: "EN", country: "us" },
  ]

  const handleSwitch = (nextCountryCode: string) => {
    if (nextCountryCode === countryCode.toLowerCase()) {
      return
    }

    startTransition(() => {
      updateRegion(nextCountryCode, currentPath)
    })
  }

  return (
    <div
      className={clx(
        "inline-flex items-center rounded-full border border-gray-200 bg-white/90 p-1 shadow-sm backdrop-blur",
        className
      )}
    >
      {options.map((option) => {
        const active = option.country === (isFrench ? "fr" : "us")

        return (
          <button
            key={option.country}
            type="button"
            onClick={() => handleSwitch(option.country)}
            disabled={isPending}
            className={clx(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
              compact ? "min-w-10" : "min-w-12",
              active
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
              isPending && "cursor-wait opacity-80"
            )}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitcher
