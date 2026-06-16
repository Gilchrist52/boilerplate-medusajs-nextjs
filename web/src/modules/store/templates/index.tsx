import { Suspense } from "react"
import { Heading } from "@medusajs/ui"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const isFrench = ["fr", "be", "ch", "lu", "mc", "ca"].includes(countryCode.toLowerCase())

  return (
    <div className="py-12">
      {/* Page Header */}
      <div className="content-container mb-12">
        <div className="text-center space-y-4">
          <Heading level="h1" className="text-4xl lg:text-5xl font-extrabold text-gray-900">
            {isFrench ? "Notre collection de drones" : "Our drone collection"}
          </Heading>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isFrench
              ? "Découvrez notre sélection de drones professionnels et de loisirs, disponibles à l'achat ou à la location."
              : "Discover our selection of professional and recreational drones, available for purchase or rental."}
          </p>
        </div>
      </div>

      <div
        className="flex flex-col lg:flex-row lg:items-start gap-8 content-container"
        data-testid="category-container"
      >
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <RefinementList sortBy={sort} />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
