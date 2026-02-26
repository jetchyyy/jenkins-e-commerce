import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest } from '../../utils/http.js';

export const getAdminAnalytics = async () => {
  const [
    { data: totals, error: totalsError },
    { data: bestSelling, error: bestSellingError },
    { data: revenueDaily, error: revenueDailyError },
    { data: revenueWeekly, error: revenueWeeklyError },
    { data: revenueMonthly, error: revenueMonthlyError }
  ] = await Promise.all([
    supabaseAdmin.rpc('admin_totals'),
    supabaseAdmin.rpc('admin_best_selling_books'),
    supabaseAdmin.rpc('admin_revenue_daily'),
    supabaseAdmin.rpc('admin_revenue_weekly'),
    supabaseAdmin.rpc('admin_revenue_monthly')
  ]);

  if (totalsError || bestSellingError || revenueDailyError || revenueWeeklyError || revenueMonthlyError) {
    throw badRequest(
      totalsError?.message ??
        bestSellingError?.message ??
        revenueDailyError?.message ??
        revenueWeeklyError?.message ??
        revenueMonthlyError?.message ??
        'Analytics failed'
    );
  }

  return {
    totals,
    bestSelling,
    revenueDaily,
    revenueWeekly,
    revenueMonthly
  };
};

export const getAllOrders = async () => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,status,total_cents,payment_provider,payment_intent_id,created_at,order_items(id,book_id,price_cents)')
    .order('created_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return data;
};
