import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { QuickInfoCard } from '@/components/building-blocks/quick-info-card/quick-info-card';

export const revenueMetricsQuery = `
  SELECT 
    SUM(total_revenue) as total_revenue,
    SUM(total_cost) as total_cost,
    SUM(gross_profit) as total_gross_profit,
    SUM(net_profit) as total_net_profit 
  FROM revenue 
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
`;

export type RevenueMetricsData = {
  total_revenue: number;
  total_cost: number;
  total_gross_profit: number;
  total_net_profit: number;
};

interface RevenueMetricsProps {
  data: RevenueMetricsData[];
}

export function RevenueMetrics({ data }: RevenueMetricsProps) {
  const metrics = data[0];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickInfoCard
        title="Total Revenue"
        description="Last 30 days"
        icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
      >
        <div className="text-3xl font-bold">{formatCurrency(metrics.total_revenue)}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Total Cost"
        description="Last 30 days"
        icon={<TrendingDown className="h-5 w-5 text-red-500" />}
      >
        <div className="text-3xl font-bold">{formatCurrency(metrics.total_cost)}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Gross Profit"
        description="Last 30 days"
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
      >
        <div className="text-3xl font-bold">{formatCurrency(metrics.total_gross_profit)}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Net Profit"
        description="Last 30 days"
        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
      >
        <div className="text-3xl font-bold">{formatCurrency(metrics.total_net_profit)}</div>
      </QuickInfoCard>
    </div>
  );
}
