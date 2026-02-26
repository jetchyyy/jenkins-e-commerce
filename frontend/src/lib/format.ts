export const formatCurrency = (amountCents: number, currency = 'PHP') => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency
  }).format(amountCents / 100);
};
