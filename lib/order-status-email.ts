import type { OrderStatus } from "@prisma/client"

type OrderStatusEmail = {
  subject: string
  text: string
}

export function getOrderStatusEmailContent(params: {
  orderNumber: string
  status: OrderStatus
}): OrderStatusEmail | null {
  const subject = `Změna stavu objednávky ${params.orderNumber}`

  switch (params.status) {
    case "CONFIRMED":
      return {
        subject,
        text: "Dobrý den, vaše objednávka byla schválena a začínáme na ní pracovat.",
      }
    case "READY":
      return {
        subject,
        text: "Dobrý den, vaše pečivo je připraveno k vyzvednutí/rozvozu.",
      }
    case "CANCELLED":
      return {
        subject,
        text: "Dobrý den, vaše objednávka byla stornována.",
      }
    default:
      return null
  }
}
