import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { mapDroneHubProduct, resolveDroneHubLocale } from "../../../../lib/drone-hub"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const idsParam = String(req.query.ids || "")
  const handlesParam = String(req.query.handles || "")
  const locale = resolveDroneHubLocale(
    String(req.query.country_code || ""),
    String(req.query.locale || "")
  )

  const ids = idsParam
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  const handles = handlesParam
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  if (!ids.length && !handles.length) {
    return res.json({
      products: [],
    })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const filters: Record<string, unknown> = {}

  if (ids.length) {
    filters.id = ids
  }

  if (handles.length) {
    filters.handle = handles
  }

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "description", "weight", "metadata"],
    filters,
  })

  return res.json({
    products: data.map((product: any) => mapDroneHubProduct(product, locale)),
  })
}
