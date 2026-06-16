import { Text, Badge } from "@medusajs/ui"
import {
  getDroneHubCommercialMode,
  getDroneHubLocalizedContent,
  getDroneHubRentalRate,
  getDroneHubSpecifications,
} from "@lib/util/drone-hub"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  countryCode?: string
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const resolvedCountryCode = countryCode || "fr"
  const localized = getDroneHubLocalizedContent(product, resolvedCountryCode)
  const mode_com = getDroneHubCommercialMode(product)
  const isFrench = resolvedCountryCode.toLowerCase() === "fr"
  const title = localized.title || product.title
  const specifications = getDroneHubSpecifications(product)
  const rentalRate = getDroneHubRentalRate(product, region.currency_code)
  const detailsLabel = isFrench ? "Voir les details" : "View details"
  const bothLabel = isFrench ? "Vente & location" : "Sale & rental"
  const rentalOnlyLabel = isFrench ? "Location uniquement" : "Rental only"
  const fromLabel = isFrench ? "ou a partir de" : "from"

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div
        data-testid="product-wrapper"
        className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="!aspect-square !p-0"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <div className="text-white">
              <Text className="text-sm font-medium opacity-90">{detailsLabel}</Text>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {mode_com === "both" && (
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 text-xs font-medium rounded-lg">
                {bothLabel}
              </Badge>
            )}
            {mode_com === "rental" && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 text-xs font-medium rounded-lg">
                {rentalOnlyLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <Text
            className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
            data-testid="product-title"
          >
            {title}
          </Text>

          {/* Description snippet */}
          {Object.keys(specifications).length > 0 && (
            <Text className="text-sm text-gray-500 mb-4 line-clamp-2">
              {Object.values(specifications).join(" • ")}
            </Text>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>

            {/* Rental price if available */}
            {rentalRate > 0 && (
              <div className="text-right">
                <Text className="text-xs text-gray-400">
                  {fromLabel}
                </Text>
                <Text className="text-sm font-semibold text-orange-600">
                  {region.currency_code === "eur"
                    ? `€${rentalRate}/jour`
                    : `$${rentalRate}/jour`}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
