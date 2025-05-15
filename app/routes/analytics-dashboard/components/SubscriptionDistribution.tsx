import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { UniversalChartCard } from '@/components/building-blocks/universal-chart-card/universal-chart-card';

export const subscriptionDistributionQuery = `
  SELECT 
    subscription_tier,
    COUNT(*) as organization_count 
  FROM organizations 
  GROUP BY subscription_tier 
  ORDER BY organization_count DESC
`;

export type SubscriptionData = {
  subscription_tier: string;
  organization_count: number;
};

interface SubscriptionDistributionProps {
  data: SubscriptionData[];
}

export function SubscriptionDistribution({ data }: SubscriptionDistributionProps) {
  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const total = data.reduce((sum, item) => sum + item.organization_count, 0);

  const chartConfig = {
    subscription: {
      label: 'Subscription Distribution',
    },
  };

  return (
    <UniversalChartCard
      title="Subscription Distribution"
      description="Organization distribution across subscription tiers"
      chartConfig={chartConfig}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="organization_count"
            nameKey="subscription_tier"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ subscription_tier, organization_count }) => 
              `${subscription_tier} (${((organization_count / total) * 100).toFixed(1)}%)`
            }
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                stroke={colors[index % colors.length].replace(')', '-stroke)')}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString()} organizations`,
              'Count'
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </UniversalChartCard>
  );
}
