import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const metadata = product.metadata as any || {}
  const isFrench = ["fr", "be", "ch", "lu", "mc", "ca"].includes(countryCode.toLowerCase())

  return (
    <>
      {/* Breadcrumb/Back hint */}
      <div className="content-container py-6">
        <div className="text-sm text-gray-500">
          Accueil / Boutique / {product.title}
        </div>
      </div>

      <div
        className="content-container flex flex-col lg:flex-row gap-12 py-8"
        data-testid="product-container"
      >
        {/* Left: Image Gallery */}
        <div className="lg:w-1/2 w-full">
          <div className="sticky top-24">
            <ImageGallery images={product?.images || []} />
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:w-1/2 w-full space-y-8">
          {/* Product Info */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <ProductInfo product={product} countryCode={countryCode} />
          </div>

          {/* Product Actions */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

          {/* Product Tabs */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div
        className="content-container my-16 lg:my-24"
        data-testid="related-products-container"
      >
        <div className="mb-12">
          <Heading level="h2" className="text-3xl font-bold text-gray-900">
            {isFrench ? "Vous aimerez aussi" : "You might also like"}
          </Heading>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-4"></div>
        </div>

        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
