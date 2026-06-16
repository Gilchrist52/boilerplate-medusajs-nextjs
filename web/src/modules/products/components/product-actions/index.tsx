"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, RadioGroup, Label, Text } from "@medusajs/ui"
import { EllipseMiniSolid } from "@medusajs/icons"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { clx } from "@medusajs/ui"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [mode, setMode] = useState<"sale" | "rental">("sale")
  const [rentalStart, setRentalStart] = useState<string>("")
  const [rentalEnd, setRentalEnd] = useState<string>("")
  const countryCode = useParams().countryCode as string
  const metadata = product.metadata as any || {}

  // Détermine la langue
  const isFrench = ["fr", "be", "ch", "lu", "mc", "ca"].includes(countryCode.toLowerCase())
  const lang = isFrench ? "fr" : "en"

  // Calcul du prix de location par jour
  const dailyRentalPrice = useMemo(() => {
    if (region.currency_code === "eur") {
      return metadata.tarif_location_journalier_eur || 0
    } else {
      return metadata.tarif_location_journalier_usd || 0
    }
  }, [metadata, region.currency_code])

  // Calcul du nombre de jours de location
  const rentalDays = useMemo(() => {
    if (!rentalStart || !rentalEnd) return 0
    const start = new Date(rentalStart)
    const end = new Date(rentalEnd)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 pour inclure le jour de départ et de retour
    return diffDays
  }, [rentalStart, rentalEnd])

  // Prix total de la location
  const totalRentalPrice = dailyRentalPrice * rentalDays

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // Vérifie si le mode est disponible
  const isModeAvailable = (m: "sale" | "rental") => {
    if (m === "sale") {
      return metadata.mode_commercialisation !== "rental"
    } else {
      return metadata.mode_commercialisation !== "sale"
    }
  }

  // Vérifie si la location est valide
  const isRentalValid = mode === "rental" ? (rentalStart && rentalEnd && rentalDays > 0) : true

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    const cartMetadata: Record<string, any> = {
      type: mode,
    }

    if (mode === "rental") {
      cartMetadata.rental_start = rentalStart
      cartMetadata.rental_end = rentalEnd
      cartMetadata.rental_days = rentalDays
      cartMetadata.total_rental_price = totalRentalPrice
    }

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
      metadata: cartMetadata,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-8" ref={actionsRef}>
        {/* Sélecteur de mode - Card style */}
        <div>
          <Heading level="h3" className="text-lg font-bold text-gray-900 mb-4">
            {isFrench ? "Choisissez votre mode" : "Choose your mode"}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isModeAvailable("sale") && (
              <button
                onClick={() => setMode("sale")}
                className={clx(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer",
                  mode === "sale"
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🛒</span>
                  {mode === "sale" && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {isFrench ? "Acheter" : "Buy"}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {isFrench ? "Possédez le produit" : "Own the product"}
                </p>
              </button>
            )}

            {isModeAvailable("rental") && (
              <button
                onClick={() => setMode("rental")}
                className={clx(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer",
                  mode === "rental"
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-orange-200 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📅</span>
                  {mode === "rental" && (
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {isFrench ? "Louer" : "Rent"}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {isFrench ? "Pour une période déterminée" : "For a specific period"}
                </p>
              </button>
            )}
          </div>
        </div>

        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding}
                  />
                </div>
              )
            })}
            <Divider />
          </div>
        )}

        {/* Champs de dates pour la location */}
        {mode === "rental" && (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
            <Heading level="h3" className="text-lg font-bold text-gray-900 mb-4">
              {isFrench ? "Période de location" : "Rental period"}
            </Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isFrench ? "Date de début" : "Start date"}
                </label>
                <input
                  type="date"
                  value={rentalStart}
                  onChange={(e) => {
                    setRentalStart(e.target.value)
                    // If end date is before start date, reset end date
                    if (rentalEnd && new Date(e.target.value) > new Date(rentalEnd)) {
                      setRentalEnd("")
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isFrench ? "Date de fin" : "End date"}
                </label>
                <input
                  type="date"
                  value={rentalEnd}
                  onChange={(e) => setRentalEnd(e.target.value)}
                  min={rentalStart || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Rental details */}
            {rentalDays > 0 && (
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-200">
                  <span className="text-gray-600">
                    {isFrench ? "Durée" : "Duration"}
                  </span>
                  <span className="font-bold text-gray-900">
                    {rentalDays} {rentalDays > 1 ? (isFrench ? "jours" : "days") : (isFrench ? "jour" : "day")}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-200">
                  <span className="text-gray-600">
                    {isFrench ? "Prix par jour" : "Price per day"}
                  </span>
                  <span className="font-semibold text-orange-600">
                    {region.currency_code === "eur" ? "€" : "$"}{dailyRentalPrice}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-orange-600 rounded-xl p-4 text-white">
                  <span className="font-semibold">
                    {isFrench ? "Prix total" : "Total price"}
                  </span>
                  <span className="text-xl font-bold">
                    {region.currency_code === "eur" ? "€" : "$"}{totalRentalPrice}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "sale" && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <ProductPrice product={product} variant={selectedVariant} />
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant ||
            !isRentalValid
          }
          variant="primary"
          className={clx(
            "w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300",
            mode === "rental"
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
          )}
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant && !options
            ? isFrench ? "Sélectionner une variante" : "Select variant"
            : !inStock || !isValidVariant
            ? isFrench ? "Indisponible" : "Out of stock"
            : mode === "rental"
            ? (isFrench ? "Ajouter la location au panier" : "Add rental to cart")
            : isFrench ? "Ajouter au panier" : "Add to cart"}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}