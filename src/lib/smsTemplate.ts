import { formatPrice } from '../../app/constants/currency'
import { formatDateReadable } from '../../app/constants/dateUtils'
import { DeliveryMethod, getDeliveryTimeDisplay } from '../../app/constants/enums'

interface OrderItem {
  menu_item_name: string
  menu_item_price: number
  quantity: number
}

interface OrderForSMS {
  customer_name: string
  customer_phone: string
  delivery_method: string
  delivery_address: string
  delivery_date: string
  delivery_time: string
  total_amount: number
  order_items: OrderItem[]
}

export function generateSMSTemplate(order: OrderForSMS): string {
  const orderDetails = order.order_items
    .map(item => `${item.quantity}x ${item.menu_item_name} - ${formatPrice(item.menu_item_price)}`)
    .join('\n')

  const deliveryInfo = order.delivery_method === DeliveryMethod.DELIVERY
    ? `Delivery: \u{1F69A}\n\u{1F4CD} ${order.delivery_address}`
    : `Pickup: \u{1F3EA}\n\u{1F4CD} At Ceylon Express`

  return `Hi ${order.customer_name},
Your order has been confirmed.

${deliveryInfo}
\u{1F4C5} ${formatDateReadable(order.delivery_date)}
\u{23F0} ${getDeliveryTimeDisplay(order.delivery_time, true)}

Order:
${orderDetails}

Total: ${formatPrice(order.total_amount)}

Thank you for ordering from Ceylon Express. If you have any questions, just reply to this message \u{1F60A}.`
}

export function getSMSSegmentInfo(message: string): { charCount: number; segments: number } {
  const charCount = message.length
  // GSM 7-bit: 160 chars for 1 segment, 153 per segment for multi-part
  // Unicode: 70 chars for 1 segment, 67 per segment for multi-part
  const hasUnicode = /[^\x00-\x7F]/.test(message)
  const singleLimit = hasUnicode ? 70 : 160
  const multiLimit = hasUnicode ? 67 : 153

  let segments: number
  if (charCount <= singleLimit) {
    segments = 1
  } else {
    segments = Math.ceil(charCount / multiLimit)
  }

  return { charCount, segments }
}
