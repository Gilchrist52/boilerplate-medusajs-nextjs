import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav({ countryCode }: { countryCode: string }) {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const isFrench = countryCode.toLowerCase() === "fr"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
        <nav className="content-container flex h-20 items-center justify-between gap-4 text-small-regular">
          <div className="flex flex-1 basis-0 items-center gap-4">
            <div className="h-full flex items-center">
              <SideMenu regions={regions} countryCode={countryCode} />
            </div>
            <div className="hidden lg:flex">
              <LanguageSwitcher countryCode={countryCode} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="group flex flex-col items-center leading-none"
              data-testid="nav-store-link"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-gray-400">
                {isFrench ? "Marketplace" : "Marketplace"}
              </span>
              <span className="text-lg font-extrabold uppercase tracking-[0.25em] text-gray-950 transition-colors group-hover:text-blue-600">
                Le Drone Hub
              </span>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-4 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-5 h-full">
              <LocalizedClientLink
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
                href="/store"
              >
                {isFrench ? "Catalogue" : "Store"}
              </LocalizedClientLink>
              <LocalizedClientLink
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
                href="/account"
                data-testid="nav-account-link"
              >
                {isFrench ? "Compte" : "Account"}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {isFrench ? "Panier" : "Cart"} (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
