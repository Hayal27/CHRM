
export function computeTicketPricing(bookingQueue: any, isValidGrossPrice: boolean) {
  const grossPriceValue = bookingQueue.tariff_price ?? bookingQueue.price;
  const grossPriceNum =
    grossPriceValue !== undefined && grossPriceValue !== null
      ? parseFloat(String(grossPriceValue))
      : NaN;

  const service_charge = isValidGrossPrice ? grossPriceNum * 0.025 : 0;
  const transport_bureau_charge = isValidGrossPrice ? grossPriceNum * 0.005 : 0;
  const net_price = isValidGrossPrice ? grossPriceNum - (service_charge + transport_bureau_charge) : 0;

  return { grossPriceNum, service_charge, transport_bureau_charge, net_price };
}
