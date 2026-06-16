"use server"

import { sdk } from "@lib/config"
import { DroneHubProductProjection } from "types/drone-hub"
import { getAuthHeaders, getCacheOptions } from "./cookies"

const getDroneHubLocale = (countryCode?: string) => {
  const frenchCountries = new Set(["fr", "be", "ch", "lu", "mc", "ca"])
  return frenchCountries.has((countryCode || "").toLowerCase()) ? "fr" : "en"
}

export const listDroneHubProducts = async ({
  ids,
  handles,
  countryCode,
}: {
  ids?: string[]
  handles?: string[]
  countryCode?: string
}) => {
  if ((!ids || !ids.length) && (!handles || !handles.length)) {
    return []
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("drone-hub-products")),
  }

  return sdk.client
    .fetch<{ products: DroneHubProductProjection[] }>(`/store/drone-hub/products`, {
      method: "GET",
      query: {
        ids: ids?.join(","),
        handles: handles?.join(","),
        country_code: countryCode,
        locale: getDroneHubLocale(countryCode),
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ products }) => products)
    .catch(() => [])
}

export const retrieveDroneHubProduct = async ({
  id,
  handle,
  countryCode,
}: {
  id?: string
  handle?: string
  countryCode?: string
}) => {
  const products = await listDroneHubProducts({
    ids: id ? [id] : undefined,
    handles: handle ? [handle] : undefined,
    countryCode,
  })

  return products[0] || null
}
