import type { OrderStatus } from "@prisma/client"

export type OrderItemDetails = {
  productName: string
  quantity: number
  price: number
}

type OrderStatusEmail = {
  subject: string
  text: string
  html: string 

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
  }).format(price)
}

function generateEmailHtml(
  title: string,
  message: string,
  items: OrderItemDetails[],
  totalPrice: number,
  orderNumber: string
) {
  const tableRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ks</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join("")

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #d97706; font-size: 24px; margin-bottom: 10px;">Pekařství Bánov</h1>
      <h2 style="font-size: 20px; color: #111;">Objednávka #${orderNumber}</h2>
      
      <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
        ${message}
      </p>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; font-size: 16px;">Rekapitulace objednávky:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Pečivo</th>
              <th style="text-align: center; padding: 8px; border-bottom: 2px solid #ddd;">Počet</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 12px 8px; font-weight: bold;">Celkem k úhradě:</td>
              <td style="text-align: right; padding: 12px 8px; font-weight: bold; color: #d97706;">${formatPrice(totalPrice)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="font-size: 12px; color: #666; margin-top: 30px; text-align: center;">
        Děkujeme, že u nás nakupujete.<br>
        Tým Pekařství Bánov
      </p>
    </div>
  `
}

export function getOrderStatusEmailContent(params: {
  orderNumber: string
  status: OrderStatus
  items: OrderItemDetails[]
  totalPrice: number
}): OrderStatusEmail | null {
  const { orderNumber, status, items, totalPrice } = params
  const subjectPrefix = `Objednávka ${orderNumber}`

  switch (status) {
    case "PENDING":
      return {
        subject: `${subjectPrefix}: Přijata ke zpracování`,
        text: `Dobrý den, děkujeme za vaši objednávku #${orderNumber}. Čeká na potvrzení pekařem.`,
        html: generateEmailHtml(
          "Objednávka přijata",
          "Dobrý den,<br>děkujeme za vaši objednávku. Nyní čeká na potvrzení naším pekařem. Jakmile ji schválíme, dáme vám vědět.",
          items,
          totalPrice,
          orderNumber
        ),
      }

    case "CONFIRMED":
      return {
        subject: `${subjectPrefix}: Potvrzena a pečeme`,
        text: `Dobrý den, vaše objednávka #${orderNumber} byla schválena a začínáme na ní pracovat.`,
        html: generateEmailHtml(
          "Objednávka potvrzena",
          "Dobrý den,<br>máme dobrou zprávu! Vaše objednávka byla schválena a právě začínáme připravovat vaše pečivo.",
          items,
          totalPrice,
          orderNumber
        ),
      }

    case "READY":
      return {
        subject: `${subjectPrefix}: Připraveno k vyzvednutí`,
        text: `Dobrý den, vaše pečivo z objednávky #${orderNumber} je připraveno k vyzvednutí.`,
        html: generateEmailHtml(
          "Pečivo je připraveno",
          "Dobrý den,<br>vaše pečivo je čerstvě upečené a připravené k vyzvednutí (nebo na cestě k vám, dle domluvy).",
          items,
          totalPrice,
          orderNumber
        ),
      }

    case "COMPLETED":
      return {
        subject: `${subjectPrefix}: Dokončeno`,
        text: `Děkujeme za nákup. Objednávka #${orderNumber} byla úspěšně dokončena.`,
        html: generateEmailHtml(
          "Děkujeme za nákup",
          "Dobrý den,<br>objednávka byla úspěšně předána. Doufáme, že vám bude chutnat!",
          items,
          totalPrice,
          orderNumber
        ),
      }

    case "CANCELLED":
      return {
        subject: `${subjectPrefix}: Stornována`,
        text: `Dobrý den, vaše objednávka #${orderNumber} byla bohužel stornována.`,
        html: generateEmailHtml(
          "Objednávka stornována",
          "Dobrý den,<br>je nám líto, ale vaše objednávka musela být stornována. Pokud máte dotazy, kontaktujte nás prosím.",
          items,
          totalPrice,
          orderNumber
        ),
      }

    default:
      return null
  }
}