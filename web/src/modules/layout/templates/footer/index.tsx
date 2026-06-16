import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default async function Footer({ countryCode }: { countryCode: string }) {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()
  const isFrench = countryCode.toLowerCase() === "fr"

  return (
    <footer className="w-full border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-24">
          <div className="max-w-sm space-y-5">
            <LocalizedClientLink
              href="/"
              className="text-xl font-extrabold uppercase tracking-[0.25em] text-gray-900 hover:text-blue-600"
            >
              Le Drone Hub
            </LocalizedClientLink>
            <Text className="text-sm leading-6 text-gray-500">
              {isFrench
                ? "Marketplace de drones moderne pour l'achat et la location, avec expérience FR/EN et gestion multi-devises."
                : "Modern drone marketplace for purchase and rental, with FR/EN experience and multi-currency support."}
            </Text>
            <LanguageSwitcher countryCode={countryCode} />
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  {isFrench ? "Categories" : "Categories"}
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  {isFrench ? "Collections" : "Collections"}
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                {isFrench ? "Ressources" : "Resources"}
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="https://github.com/medusajs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.medusajs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    {isFrench ? "Documentation" : "Documentation"}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/medusajs/nextjs-starter-medusa"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    {isFrench ? "Code source" : "Source code"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-12 justify-between text-ui-fg-muted gap-4 flex-col small:flex-row">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Le Drone Hub.{" "}
            {isFrench ? "Tous droits réservés." : "All rights reserved."}
          </Text>
          <MedusaCTA isFrench={isFrench} />
        </div>
      </div>
    </footer>
  )
}
