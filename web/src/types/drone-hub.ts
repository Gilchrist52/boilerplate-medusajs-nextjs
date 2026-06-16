export type DroneHubLocale = "fr" | "en"
export type DroneHubCommercialMode = "sale" | "rental" | "both"

export type DroneHubProductProjection = {
  id: string
  handle: string
  commercial_mode: DroneHubCommercialMode
  sale_enabled: boolean
  rental_enabled: boolean
  localized: {
    locale: DroneHubLocale
    title: string
    description: string
  }
  translations: {
    fr: {
      title: string
      description: string
    }
    en: {
      title: string
      description: string
    }
  }
  rental_rates: {
    eur: number
    usd: number
  }
  specifications: Record<string, string>
  weight: number | null
}

export type DroneHubRentalPricing = {
  product_id: string
  currency_code: "eur" | "usd"
  rental_days: number
  unit_daily_price: number
  total: number
  start_date: string
  end_date: string
}
