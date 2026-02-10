exports.calculateBilling = ({
  product,
  durationValue,
  durationUnit,
  priceOverride,
  customer,
}) => {
  const baseUnitDays =
    product.billingInterval.unit === 'months'
      ? product.billingInterval.value * 30
      : product.billingInterval.value;

  const totalDays =
    durationUnit === 'months' ? durationValue * 30 : durationValue;

  const factor = totalDays / baseUnitDays;

  const baseAmount = priceOverride ?? product.customerPrice * factor;

  const extraCharge = customer.defaultExtraCharge || 0;
  const discount = customer.defaultDiscount || 0;

  const netAmount = baseAmount + extraCharge - discount;
  const cost = product.operatorCost * factor;

  return {
    baseAmount,
    extraCharge,
    discount,
    netAmount,
    costOfGoodsSold: cost,
    profit: netAmount - cost,
  };
};
