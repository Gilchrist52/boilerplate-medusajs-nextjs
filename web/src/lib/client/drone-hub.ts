import { sdk } from "@lib/config"
import { DroneHubRentalPricing } from "types/drone-hub"

export const calculateRentalPricing = async ({
  productId,
  startDate,
  endDate,
  countryCode,
  currencyCode,
}: {
  productId: string
  startDate: string
  endDate: string
  countryCode: string
  currencyCode: string
}) => {
  return sdk.client
    .fetch<{ rental_pricing: DroneHubRentalPricing }>(
      "/store/drone-hub/rental-pricing",
      {
        method: "POST",
        body: {
          product_id: productId,
          start_date: startDate,
          end_date: endDate,
          country_code: countryCode,
          currency_code: currencyCode,
        },
      }
    )
    .then(({ rental_pricing }) => rental_pricing)
}
