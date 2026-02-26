import { formatCurrency } from '../../lib/format';

export const PriceTag = ({ amount, currency }: { amount: number; currency: string }) => {
  return <span className="font-semibold text-brand-700">{formatCurrency(amount, currency)}</span>;
};
