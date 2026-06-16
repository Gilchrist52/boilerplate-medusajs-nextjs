"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSwitcher from "../language-switcher"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const SideMenu = ({
  regions,
  countryCode,
}: {
  regions: HttpTypes.StoreRegion[] | null
  countryCode: string
}) => {
  const toggleState = useToggleState()
  const isFrench = countryCode.toLowerCase() === "fr"
  const sideMenuItems = [
    { label: isFrench ? "Accueil" : "Home", href: "/" },
    { label: isFrench ? "Catalogue" : "Store", href: "/store" },
    { label: isFrench ? "Compte" : "Account", href: "/account" },
    { label: isFrench ? "Panier" : "Cart", href: "/cart" },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all ease-out duration-200 hover:border-gray-300 hover:text-gray-950 focus:outline-none"
                >
                  {isFrench ? "Menu" : "Menu"}
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="flex flex-col absolute w-full pr-4 sm:pr-0 sm:w-1/3 2xl:w-1/4 sm:min-w-min h-[calc(100vh-1rem)] z-30 inset-x-0 text-sm text-ui-fg-on-color m-2 backdrop-blur-2xl">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full rounded-3xl border border-white/10 bg-[rgba(3,7,18,0.78)] justify-between p-6"
                  >
                    <div className="flex justify-end" id="xmark">
                      <button data-testid="close-menu-button" onClick={close}>
                        <XMark />
                      </button>
                    </div>
                    <div className="mb-8">
                      <LanguageSwitcher countryCode={countryCode} compact />
                    </div>
                    <ul className="flex flex-col gap-6 items-start justify-start">
                      {sideMenuItems.map(({ label, href }) => {
                        return (
                          <li key={label}>
                            <LocalizedClientLink
                              href={href}
                              className="text-3xl leading-10 hover:text-ui-fg-disabled"
                              onClick={close}
                              data-testid={`${label.toLowerCase()}-link`}
                            >
                              {label}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      <div
                        className="flex justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={toggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            toggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="flex justify-between txt-compact-small">
                        © {new Date().getFullYear()} Le Drone Hub.{" "}
                        {isFrench ? "Tous droits réservés." : "All rights reserved."}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
