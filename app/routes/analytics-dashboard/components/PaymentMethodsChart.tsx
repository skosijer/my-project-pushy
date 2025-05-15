import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { UniversalChartCard } from '@/components/building-blocks/universal-chart-card/universal-chart-card';

export const paymentMethodsQuery = `
  SELECT 
    payment_method,
    COUNT(*) as transaction_count,
    SUM(total_amount) as total_amount 
  FROM sales 
  WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY payment_method 
  ORDER BY transaction_count DESC
`;

export type PaymentMethodData = {
  payment_method: string;
  transaction_count: number;
  total_amount: number;
};

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const chartConfig = {
    transaction_count: {
      label: 'Transactions',
      color: 'var(--chart-4)',
    },
    total_amount: {
      label: 'Total Amount',
      color: 'var(--chart-5)',
    },
  };

  return (
    <UniversalChartCard
      title="Payment Methods Analysis"
      description="Transaction count and volume by payment method (30 days)"
      chartConfig={chartConfig}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="payment_method" />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => 
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'transaction_count') {
                return [value.toLocaleString(), 'Transactions'];
              }
              return [
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value),
                'Amount'
              ];
            }}
          />
          <Bar
            dataKey="transaction_count"
            fill="var(--chart-4)"
            yAxisId="left"
            name="Transactions"
          />
          <Bar
            dataKey="total_amount"
            fill="var(--chart-5)"
            yAxisId="right"
            name="Amount"
          />
        </BarChart>
      </ResponsiveContainer>
    </UniversalChartCard>
  );
}
