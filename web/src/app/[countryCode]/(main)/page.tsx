import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Le Drone Hub",
  description:
    "Achetez ou louez les meilleurs drones du marché.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const categories = await listCategories()

  if (!categories || !region) {
    return null
  }

  const isFrench = countryCode.toLowerCase() === "fr"

  return (
    <>
      <Hero countryCode={countryCode} />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          {categories.map((category) => (
            <li key={category.id} className="content-container py-12 small:py-24">
              <div className="flex justify-between mb-8">
                <div>
                  <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-gray-400">
                    {isFrench ? "Categorie" : "Category"}
                  </p>
                  <h2 className="txt-xlarge font-bold">{category.name}</h2>
                </div>
              </div>
              <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
                {category.products?.map((product) => (
                  <li key={product.id}>
                    <ProductPreview
                      product={product as any}
                      region={region}
                      countryCode={countryCode}
                      isFeatured
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
