// ============================================================
// Analytics Service
// Main service that orchestrates all analytics calculations
// ============================================================

import { supabase } from '../supabase';
import type { Trade, TradingAccount } from '../../types/database';
import type { AnalyticsFilters, AnalyticsResult, PerformanceBreakdown } from './types';
import { classifyTrades, calculateCoreMetrics } from './metrics';
import { calculateEquityCurve, calculateDrawdown } from './equity';
import { aggregateByTime, calculatePerformanceBreakdown, calculateDurationMetrics } from './aggregation';

/**
 * Fetch trades for analytics with filters applied
 */
export async function fetchAnalyticsTrades(
  userId: string,
  filters: AnalyticsFilters
): Promise<Trade[]> {
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('exit_datetime', { ascending: true });
  
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  
  if (filters.phaseId) {
    query = query.eq('phase_id', filters.phaseId);
  }
  
  if (filters.dateFrom) {
    query = query.gte('exit_datetime', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query = query.lte('exit_datetime', filters.dateTo);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching trades for analytics:', error);
    throw new Error('خطا در دریافت معاملات برای آنالیز');
  }
  
  return data || [];
}

/**
 * Fetch accounts for filter options
 */
export async function fetchAccounts(userId: string): Promise<TradingAccount[]> {
  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  
  if (error) {
    console.error('Error fetching accounts:', error);
    throw new Error('خطا در دریافت حساب‌ها');
  }
  
  return data || [];
}

/**
 * Calculate complete analytics result
 */
export async function calculateAnalytics(
  userId: string,
  filters: AnalyticsFilters
): Promise<AnalyticsResult> {
  // Fetch trades
  const trades = await fetchAnalyticsTrades(userId, filters);
  
  // Classify trades
  const classifiedTrades = classifyTrades(trades);
  
  // Calculate core metrics
  const metrics = calculateCoreMetrics(classifiedTrades);
  
  // Get starting balance from account
  let startingBalance = 0;
  if (filters.accountId) {
    const { data: account } = await supabase
      .from('trading_accounts')
      .select('initial_balance')
      .eq('id', filters.accountId)
      .eq('user_id', userId)
      .single();
    
    startingBalance = account?.initial_balance || 0;
  } else if (trades.length > 0) {
    // For all accounts, sum initial balances
    const accountIds = [...new Set(trades.map(t => t.account_id))];
    const { data: accounts } = await supabase
      .from('trading_accounts')
      .select('id, initial_balance')
      .in('id', accountIds)
      .eq('user_id', userId);
    
    startingBalance = accounts?.reduce((sum, acc) => sum + acc.initial_balance, 0) || 0;
  }
  
  // Calculate equity curve
  const equity = calculateEquityCurve(classifiedTrades, startingBalance);
  
  // Calculate drawdown
  const drawdown = calculateDrawdown(equity);
  
  // Time aggregations
  const dailyPnl = aggregateByTime(classifiedTrades, 'daily');
  const weeklyPnl = aggregateByTime(classifiedTrades, 'weekly');
  const monthlyPnl = aggregateByTime(classifiedTrades, 'monthly');
  
  // Performance breakdowns
  const symbolPerformance = calculatePerformanceBreakdown(
    classifiedTrades,
    t => t.symbol
  );
  
  // Note: Strategy performance requires journal data which needs a separate query
  // For now, we skip strategy breakdown until journal data is fetched
  const strategyPerformance: PerformanceBreakdown[] = [];
  
  const sidePerformance = calculatePerformanceBreakdown(
    classifiedTrades,
    t => t.side,
    key => key === 'buy' ? 'خرید' : 'فروش'
  );
  
  const accountPerformance = calculatePerformanceBreakdown(
    classifiedTrades,
    t => t.account_id
  );
  
  const phasePerformance = calculatePerformanceBreakdown(
    classifiedTrades.filter(t => t.phase_id),
    t => t.phase_id || 'no_phase',
    key => key === 'no_phase' ? 'بدون فاز' : key
  );
  
  // Duration metrics
  const duration = calculateDurationMetrics(classifiedTrades);
  
  // Determine currency
  let currency = 'USD';
  if (filters.accountId) {
    const { data: account } = await supabase
      .from('trading_accounts')
      .select('currency')
      .eq('id', filters.accountId)
      .eq('user_id', userId)
      .single();
    
    currency = account?.currency || 'USD';
  }
  
  return {
    filters,
    trades: classifiedTrades,
    metrics,
    equity,
    drawdown,
    dailyPnl,
    weeklyPnl,
    monthlyPnl,
    symbolPerformance,
    strategyPerformance,
    sidePerformance,
    accountPerformance,
    phasePerformance,
    duration,
    currency,
  };
}
