import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UniversalChartCard } from '@/components/building-blocks/universal-chart-card/universal-chart-card';

export const revenueTrendQuery = `
  SELECT 
    date,
    total_revenue,
    subscription_revenue,
    product_revenue 
  FROM revenue 
  WHERE date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY date
`;

export type RevenueTrendData = {
  date: string;
  total_revenue: number;
  subscription_revenue: number;
  product_revenue: number;
};

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const chartConfig = {
    total_revenue: {
      label: 'Total Revenue',
      color: 'var(--chart-1)',
    },
    subscription_revenue: {
      label: 'Subscription Revenue',
      color: 'var(--chart-2)',
    },
    product_revenue: {
      label: 'Product Revenue',
      color: 'var(--chart-3)',
    },
  };

  return (
    <UniversalChartCard
      title="Revenue Trend"
      description="Daily revenue breakdown for the last 30 days"
      chartConfig={chartConfig}
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip 
            formatter={(value: number) => 
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(value)
            }
          />
          <Area
            type="monotone"
            dataKey="total_revenue"
            stackId="1"
            stroke="var(--chart-1-stroke)"
            fill="var(--chart-1)"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="subscription_revenue"
            stackId="2"
            stroke="var(--chart-2-stroke)"
            fill="var(--chart-2)"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="product_revenue"
            stackId="3"
            stroke="var(--chart-3-stroke)"
            fill="var(--chart-3)"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </UniversalChartCard>
  );
}
