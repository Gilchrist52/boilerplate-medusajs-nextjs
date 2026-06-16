import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { calculateDroneHubRentalPricing } from "../../../../lib/drone-hub"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, string>
  const productId = String(body.product_id || "").trim()
  const startDate = String(body.start_date || "").trim()
  const endDate = String(body.end_date || "").trim()
  const countryCode = String(body.country_code || "").trim()
  const currencyCode = String(body.currency_code || "").trim().toLowerCase()

  if (!productId || !startDate || !endDate) {
    return res.status(400).json({
      message: "product_id, start_date and end_date are required",
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "description", "weight", "metadata"],
    filters: {
      id: [productId],
    },
  })

  const product = data[0]

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    })
  }

  try {
    const pricing = calculateDroneHubRentalPricing({
      product,
      startDate,
      endDate,
      countryCode,
      currencyCode,
    })

    return res.json({
      rental_pricing: pricing,
    })
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Unable to calculate rental pricing",
    })
  }
}
