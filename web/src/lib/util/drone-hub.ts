import { HttpTypes } from "@medusajs/types"
import { DroneHubProductProjection } from "types/drone-hub"

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const toStringRecord = (value: unknown): Record<string, string> => {
  if (!isObject(value)) {
    return {}
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] =>
      typeof entry[0] === "string" && typeof entry[1] === "string"
  )

  return Object.fromEntries(entries)
}

export const getDroneHubLocale = (countryCode: string) => {
  const frenchCountries = new Set(["fr", "be", "ch", "lu", "mc", "ca"])
  return frenchCountries.has(countryCode.toLowerCase()) ? "fr" : "en"
}

export const getDroneHubProjection = (
  product: HttpTypes.StoreProduct
): DroneHubProductProjection | null => {
  const metadata = (product.metadata as Record<string, unknown> | undefined) || {}
  const projection = metadata.drone_hub

  if (!isObject(projection)) {
    return null
  }

  return projection as DroneHubProductProjection
}

export const getDroneHubCommercialMode = (product: HttpTypes.StoreProduct) => {
  const projection = getDroneHubProjection(product)

  if (projection) {
    return projection.commercial_mode
  }

  const metadata = (product.metadata as Record<string, unknown> | undefined) || {}
  const mode = metadata.mode_commercialisation

  if (mode === "sale" || mode === "rental" || mode === "both") {
    return mode
  }

  return "sale"
}

export const getDroneHubLocalizedContent = (
  product: HttpTypes.StoreProduct,
  countryCode: string
) => {
  const locale = getDroneHubLocale(countryCode)
  const projection = getDroneHubProjection(product)

  if (projection) {
    return projection.translations[locale]
  }

  const metadata = (product.metadata as Record<string, unknown> | undefined) || {}
  const title =
    typeof metadata[`title_${locale}`] === "string"
      ? String(metadata[`title_${locale}`])
      : product.title
  const description =
    typeof metadata[`description_${locale}`] === "string"
      ? String(metadata[`description_${locale}`])
      : product.description || ""

  return {
    title,
    description,
  }
}

export const getDroneHubRentalRate = (
  product: HttpTypes.StoreProduct,
  currencyCode: string
) => {
  const projection = getDroneHubProjection(product)

  if (projection) {
    return currencyCode === "eur"
      ? projection.rental_rates.eur
      : projection.rental_rates.usd
  }

  const metadata = (product.metadata as Record<string, unknown> | undefined) || {}
  const value =
    currencyCode === "eur"
      ? metadata.tarif_location_journalier_eur
      : metadata.tarif_location_journalier_usd

  return typeof value === "number" ? value : Number(value || 0)
}

export const getDroneHubSpecifications = (product: HttpTypes.StoreProduct) => {
  const projection = getDroneHubProjection(product)

  if (projection) {
    return toStringRecord(projection.specifications)
  }

  const metadata = (product.metadata as Record<string, unknown> | undefined) || {}
  return toStringRecord(metadata.specifications)
}
