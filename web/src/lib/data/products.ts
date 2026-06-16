"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { DroneHubProductProjection } from "types/drone-hub"
import { listDroneHubProducts } from "./drone-hub"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

const mergeDroneHubProduct = (
  product: HttpTypes.StoreProduct,
  businessProduct?: DroneHubProductProjection
) => {
  if (!businessProduct) {
    return product
  }

  return {
    ...product,
    title: businessProduct.localized.title || product.title,
    description: businessProduct.localized.description || product.description,
    metadata: {
      ...(product.metadata || {}),
      drone_hub: businessProduct,
      mode_commercialisation: businessProduct.commercial_mode,
      tarif_location_journalier_eur: businessProduct.rental_rates.eur,
      tarif_location_journalier_usd: businessProduct.rental_rates.usd,
      title_fr: businessProduct.translations.fr.title,
      title_en: businessProduct.translations.en.title,
      description_fr: businessProduct.translations.fr.description,
      description_en: businessProduct.translations.en.description,
      specifications: businessProduct.specifications,
    },
  }
}

const enrichProductsWithDroneHubData = async (
  products: HttpTypes.StoreProduct[],
  countryCode?: string
) => {
  const businessProducts = await listDroneHubProducts({
    ids: products.map((product) => product.id),
    countryCode,
  })

  const businessProductsById = new Map(
    businessProducts.map((product) => [product.id, product])
  )

  return products.map((product) =>
    mergeDroneHubProduct(product, businessProductsById.get(product.id))
  )
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(async ({ products, count }) => {
      const enrichedProducts = await enrichProductsWithDroneHubData(
        products,
        countryCode
      )
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products: enrichedProducts,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}
