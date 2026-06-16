import { HttpTypes } from "@medusajs/types"
import { Heading, Text, Badge } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

const ProductInfo = ({ product, countryCode }: ProductInfoProps) => {
  const metadata = product.metadata as any || {}
  
  // Détermine la langue à partir du countryCode
  const isFrench = ["fr", "be", "ch", "lu", "mc", "ca"].includes(countryCode.toLowerCase())
  const lang = isFrench ? "fr" : "en"

  // Récupère le titre et la description traduits, ou les valeurs par défaut
  const title = metadata[`title_${lang}`] || product.title
  const description = metadata[`description_${lang}`] || product.description
  const mode_com = metadata.mode_commercialisation

  return (
    <div id="product-info" className="space-y-6">
      {/* Category & Mode Badge */}
      <div className="flex flex-wrap gap-3 items-center">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        {mode_com && (
          <Badge className={
            mode_com === "both"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
              : "bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
          }>
            {mode_com === "both" && (isFrench ? "Vente & Location" : "Sale & Rental")}
            {mode_com === "sale" && (isFrench ? "Vente uniquement" : "Sale only")}
            {mode_com === "rental" && (isFrench ? "Location uniquement" : "Rental only")}
          </Badge>
        )}
      </div>

      <Heading
        level="h1"
        className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight"
        data-testid="product-title"
      >
        {title}
      </Heading>

      <Text
        className="text-lg text-gray-600 leading-relaxed"
        data-testid="product-description"
      >
        {description}
      </Text>

      {/* Spécifications */}
      {metadata.specifications && (
        <div className="mt-8">
          <Heading level="h3" className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
            {isFrench ? "Spécifications techniques" : "Technical specifications"}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(metadata.specifications as Record<string, string>).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
                </span>
                <span className="block text-lg font-semibold text-gray-900 mt-1">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
