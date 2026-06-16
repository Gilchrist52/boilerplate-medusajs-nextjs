"use client"

import { Button, Heading } from "@medusajs/ui"
import { useParams } from "next/navigation"
import { getDisplayCartTotals } from "@lib/util/cart-totals"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const { countryCode } = useParams()
  const isFrench = String(countryCode || "").toLowerCase() === "fr"
  const customTotals = getDisplayCartTotals(cart)
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
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        {isFrench ? "Resume" : "Summary"}
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={customTotals as any} labels={labels} />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">
          {isFrench ? "Passer au paiement" : "Go to checkout"}
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
