import { HttpTypes } from "@medusajs/types"

const toCents = (amount: number) => Math.round(amount * 100)

export const isRentalLineItem = (item: HttpTypes.StoreCartLineItem) => {
  const metadata = (item.metadata as Record<string, any> | undefined) || {}
  return metadata.type === "rental"
}

export const getDisplayLineItemSubtotal = (item: HttpTypes.StoreCartLineItem) => {
  const metadata = (item.metadata as Record<string, any> | undefined) || {}

  if (isRentalLineItem(item)) {
    if (typeof item.subtotal === "number" && item.subtotal > 0) {
      return item.subtotal
    }

    return toCents(Number(metadata.total_rental_price || 0)) * (item.quantity || 1)
  }

  return item.subtotal || 0
}

export const getDisplayRentalUnitDailyPrice = (
  item: HttpTypes.StoreCartLineItem
) => {
  const metadata = (item.metadata as Record<string, any> | undefined) || {}

  if (typeof metadata.rental_unit_daily_price === "number") {
    return toCents(metadata.rental_unit_daily_price)
  }

  if (typeof metadata.rental_unit_daily_price === "string") {
    return toCents(Number(metadata.rental_unit_daily_price || 0))
  }

  const rentalDays = Math.max(Number(metadata.rental_days || 1), 1)
  const subtotal = getDisplayLineItemSubtotal(item)
  const quantity = Math.max(Number(item.quantity || 1), 1)

  return Math.round(subtotal / quantity / rentalDays)
}

export const getDisplayCartTotals = (cart: HttpTypes.StoreCart) => {
  const itemSubtotal = (cart.items || []).reduce((sum, item) => {
    return sum + getDisplayLineItemSubtotal(item)
  }, 0)

  const shippingSubtotal = cart.shipping_total || 0
  const taxTotal = cart.tax_total || 0
  const discountSubtotal = Math.abs(cart.discount_total || 0)

  return {
    total: itemSubtotal + shippingSubtotal + taxTotal - discountSubtotal,
    item_subtotal: itemSubtotal,
    shipping_subtotal: shippingSubtotal,
    tax_total: taxTotal,
    discount_subtotal: discountSubtotal,
    currency_code: cart.currency_code || "eur",
  }
}
