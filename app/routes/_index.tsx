import { useLoaderData } from '@remix-run/react';
import { executePostgresQuery } from '@/db/execute-query';
import { WithErrorHandling } from '@/components/hoc/error-handling-wrapper/error-handling-wrapper';
import { KeyMetrics, KeyMetricsData, keyMetricsQuery } from './analytics-dashboard/components/KeyMetrics';
import { RevenueMetrics, RevenueMetricsData, revenueMetricsQuery } from './analytics-dashboard/components/RevenueMetrics';
import { RevenueTrendChart, RevenueTrendData, revenueTrendQuery } from './analytics-dashboard/components/RevenueTrendChart';
import { TopProductsTable, TopProductData, topProductsQuery } from './analytics-dashboard/components/TopProductsTable';
import { SubscriptionDistribution, SubscriptionData, subscriptionDistributionQuery } from './analytics-dashboard/components/SubscriptionDistribution';
import { PaymentMethodsChart, PaymentMethodData, paymentMethodsQuery } from './analytics-dashboard/components/PaymentMethodsChart';

export async function loader() {
  const [
    keyMetrics,
    revenueMetrics,
    revenueTrend,
    topProducts,
    subscriptionDistribution,
    paymentMethods
  ] = await Promise.all([
    executePostgresQuery<KeyMetricsData>(keyMetricsQuery),
    executePostgresQuery<RevenueMetricsData>(revenueMetricsQuery),
    executePostgresQuery<RevenueTrendData>(revenueTrendQuery),
    executePostgresQuery<TopProductData>(topProductsQuery),
    executePostgresQuery<SubscriptionData>(subscriptionDistributionQuery),
    executePostgresQuery<PaymentMethodData>(paymentMethodsQuery)
  ]);

  return {
    keyMetrics,
    revenueMetrics,
    revenueTrend,
    topProducts,
    subscriptionDistribution,
    paymentMethods
  };
}

export default function Index() {
  const {
    keyMetrics,
    revenueMetrics,
    revenueTrend,
    topProducts,
    subscriptionDistribution,
    paymentMethods
  } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
      
      <WithErrorHandling
        queryData={keyMetrics}
        render={(data) => <KeyMetrics data={data} />}
      />

      <WithErrorHandling
        queryData={revenueMetrics}
        render={(data) => <RevenueMetrics data={data} />}
      />

      <WithErrorHandling
        queryData={revenueTrend}
        render={(data) => <RevenueTrendChart data={data} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithErrorHandling
          queryData={topProducts}
          render={(data) => <TopProductsTable data={data} />}
        />

        <WithErrorHandling
          queryData={subscriptionDistribution}
          render={(data) => <SubscriptionDistribution data={data} />}
        />
      </div>

      <WithErrorHandling
        queryData={paymentMethods}
        render={(data) => <PaymentMethodsChart data={data} />}
      />
    </main>
  );
}
