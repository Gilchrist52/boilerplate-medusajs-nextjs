import { Heading } from "@medusajs/ui"
import { getDisplayCartTotals } from "@lib/util/cart-totals"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({
  cart,
  countryCode,
}: {
  cart: any
  countryCode: string
}) => {
  const isFrench = countryCode.toLowerCase() === "fr"
  const labels = isFrench
    ? {
        subtotal: "Sous-total (hors livraison et taxes)",
        shipping: "Livraison",
        discount: "Remise",
        taxes: "Taxes",
        total: "Total",
      }
    : {
        subtotal: "Subtotal (excl. shipping and taxes)",
        shipping: "Shipping",
        discount: "Discount",
        taxes: "Taxes",
        total: "Total",
      }

  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0 ">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline"
        >
          {isFrench ? "Dans votre panier" : "In your cart"}
        </Heading>
        <Divider className="my-6" />
        <CartTotals totals={getDisplayCartTotals(cart)} labels={labels} />
        <ItemsPreviewTemplate cart={cart} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
