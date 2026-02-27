import { supabaseAdmin } from '../../config/supabase.js';
import { badRequest } from '../../utils/http.js';

export const getAdminAnalytics = async () => {
  const [
    { data: totals, error: totalsError },
    { data: bestSelling, error: bestSellingError },
    { data: revenueDaily, error: revenueDailyError },
    { data: revenueWeekly, error: revenueWeeklyError },
    { data: revenueMonthly, error: revenueMonthlyError },
    { count: totalUsers, error: totalUsersError },
    { count: customerUsers, error: customerUsersError }
  ] = await Promise.all([
    supabaseAdmin.rpc('admin_totals'),
    supabaseAdmin.rpc('admin_best_selling_books'),
    supabaseAdmin.rpc('admin_revenue_daily'),
    supabaseAdmin.rpc('admin_revenue_weekly'),
    supabaseAdmin.rpc('admin_revenue_monthly'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  ]);

  if (totalsError || bestSellingError || revenueDailyError || revenueWeeklyError || revenueMonthlyError || totalUsersError || customerUsersError) {
    throw badRequest(
      totalsError?.message ??
        bestSellingError?.message ??
        revenueDailyError?.message ??
        revenueWeeklyError?.message ??
        revenueMonthlyError?.message ??
        totalUsersError?.message ??
        customerUsersError?.message ??
        'Analytics failed'
    );
  }

  return {
    totals,
    bestSelling,
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    users: {
      total: totalUsers ?? 0,
      customers: customerUsers ?? 0,
      superadmins: Math.max((totalUsers ?? 0) - (customerUsers ?? 0), 0)
    }
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

export const getAllUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id,email,full_name,role,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  return data;
};
