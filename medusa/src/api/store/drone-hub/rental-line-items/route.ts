import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { calculateDroneHubRentalPricing } from "../../../../lib/drone-hub"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Record<string, string | number>
  const cartId = String(body.cart_id || "").trim()
  const productId = String(body.product_id || "").trim()
  const variantId = String(body.variant_id || "").trim()
  const startDate = String(body.start_date || "").trim()
  const endDate = String(body.end_date || "").trim()
  const countryCode = String(body.country_code || "").trim()
  const currencyCode = String(body.currency_code || "").trim().toLowerCase()
  const quantity = Number(body.quantity || 1)

  if (!cartId || !productId || !variantId || !startDate || !endDate) {
    return res.status(400).json({
      message:
        "cart_id, product_id, variant_id, start_date and end_date are required",
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

    await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: cartId,
        items: [
          {
            variant_id: variantId,
            quantity,
            unit_price: pricing.total,
            metadata: {
              type: "rental",
              rental_start: pricing.start_date,
              rental_end: pricing.end_date,
              rental_days: pricing.rental_days,
              total_rental_price: pricing.total,
              rental_unit_daily_price: pricing.unit_daily_price,
              rental_currency_code: pricing.currency_code,
            },
          },
        ],
      },
    })

    return res.json({
      added: true,
      rental_pricing: pricing,
    })
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Unable to add rental item to cart",
    })
  }
}
