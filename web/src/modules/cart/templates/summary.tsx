"use client"

import { Button, Heading } from "@medusajs/ui"
import { useParams } from "next/navigation"

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

  // Calculate custom totals that account for rental items
  const calculateCustomTotals = () => {
    let itemSubtotal = 0
    const items = cart.items || []
    
    items.forEach((item) => {
      const metadata = item.metadata as any || {}
      if (metadata.type === "rental") {
        // Use the total rental price from metadata (already in dollars/euros, convert to cents)
        itemSubtotal += Math.round((metadata.total_rental_price || 0) * 100) * (item.quantity || 1)
      } else {
        // Use Medusa's calculated subtotal for regular items (already in cents)
        itemSubtotal += (item.subtotal || 0)
      }
    })

    const shippingSubtotal = cart.shipping_total || 0
    const taxTotal = cart.tax_total || 0
    const discountSubtotal = Math.abs(cart.discount_total || 0)
    const total = itemSubtotal + shippingSubtotal + taxTotal - discountSubtotal

    return {
      total,
      item_subtotal: itemSubtotal,
      shipping_subtotal: shippingSubtotal,
      tax_total: taxTotal,
      discount_subtotal: discountSubtotal,
      currency_code: cart.currency_code || "eur"
    }
  }

  const customTotals = calculateCustomTotals()

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        {isFrench ? "Resume" : "Summary"}
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={customTotals as any} />
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
