type DroneHubLocale = "fr" | "en"
type CommercialMode = "sale" | "rental" | "both"

type ProductMetadata = Record<string, unknown>

type ProductRecord = {
  id: string
  handle: string
  title?: string | null
  description?: string | null
  weight?: number | null
  metadata?: ProductMetadata | null
}

const FRENCH_COUNTRIES = new Set(["fr", "be", "ch", "lu", "mc", "ca"])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const getMetadataRecord = (metadata: unknown): ProductMetadata =>
  isRecord(metadata) ? metadata : {}

const normalizeMode = (value: unknown): CommercialMode => {
  if (value === "sale" || value === "rental" || value === "both") {
    return value
  }

  return "sale"
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const getTranslatedValue = (
  metadata: ProductMetadata,
  field: "title" | "description",
  locale: DroneHubLocale,
  fallback: string
) => {
  const key = `${field}_${locale}`
  const value = metadata[key]

  return typeof value === "string" && value.trim().length > 0 ? value : fallback
}

export const resolveDroneHubLocale = (
  countryCode?: string,
  locale?: string
): DroneHubLocale => {
  if (locale === "fr" || locale === "en") {
    return locale
  }

  return FRENCH_COUNTRIES.has((countryCode || "").toLowerCase()) ? "fr" : "en"
}

export const mapDroneHubProduct = (
  product: ProductRecord,
  locale: DroneHubLocale
) => {
  const metadata = getMetadataRecord(product.metadata)
  const commercialMode = normalizeMode(metadata.mode_commercialisation)
  const titleFr = getTranslatedValue(metadata, "title", "fr", product.title || "")
  const titleEn = getTranslatedValue(metadata, "title", "en", product.title || "")
  const descriptionFr = getTranslatedValue(
    metadata,
    "description",
    "fr",
    product.description || ""
  )
  const descriptionEn = getTranslatedValue(
    metadata,
    "description",
    "en",
    product.description || ""
  )
  const specifications = isRecord(metadata.specifications)
    ? Object.fromEntries(
        Object.entries(metadata.specifications).filter(
          ([key, value]) => typeof key === "string" && typeof value === "string"
        )
      )
    : {}

  return {
    id: product.id,
    handle: product.handle,
    commercial_mode: commercialMode,
    sale_enabled: commercialMode !== "rental",
    rental_enabled: commercialMode !== "sale",
    localized: {
      locale,
      title: locale === "fr" ? titleFr : titleEn,
      description: locale === "fr" ? descriptionFr : descriptionEn,
    },
    translations: {
      fr: {
        title: titleFr,
        description: descriptionFr,
      },
      en: {
        title: titleEn,
        description: descriptionEn,
      },
    },
    rental_rates: {
      eur: toNumber(metadata.tarif_location_journalier_eur),
      usd: toNumber(metadata.tarif_location_journalier_usd),
    },
    specifications,
    weight: product.weight || null,
  }
}

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const getDroneHubRentalCurrency = (
  countryCode?: string,
  currencyCode?: string
) => {
  if (currencyCode === "eur" || currencyCode === "usd") {
    return currencyCode
  }

  return FRENCH_COUNTRIES.has((countryCode || "").toLowerCase()) ? "eur" : "usd"
}

export const calculateDroneHubRentalPricing = ({
  product,
  startDate,
  endDate,
  countryCode,
  currencyCode,
}: {
  product: ProductRecord
  startDate: string
  endDate: string
  countryCode?: string
  currencyCode?: string
}) => {
  const metadata = getMetadataRecord(product.metadata)
  const commercialMode = normalizeMode(metadata.mode_commercialisation)

  if (commercialMode === "sale") {
    throw new Error("This product is not available for rental")
  }

  const start = new Date(`${startDate}T00:00:00.000Z`)
  const end = new Date(`${endDate}T00:00:00.000Z`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid rental dates")
  }

  if (end < start) {
    throw new Error("Rental end date must be on or after the start date")
  }

  const rentalDays = Math.floor((end.getTime() - start.getTime()) / DAY_IN_MS) + 1
  const resolvedCurrencyCode = getDroneHubRentalCurrency(countryCode, currencyCode)
  const dailyPrice =
    resolvedCurrencyCode === "eur"
      ? toNumber(metadata.tarif_location_journalier_eur)
      : toNumber(metadata.tarif_location_journalier_usd)

  if (!dailyPrice) {
    throw new Error("No rental rate is configured for this currency")
  }

  return {
    product_id: product.id,
    currency_code: resolvedCurrencyCode,
    rental_days: rentalDays,
    unit_daily_price: dailyPrice,
    total: dailyPrice * rentalDays,
    start_date: startDate,
    end_date: endDate,
  }
}
