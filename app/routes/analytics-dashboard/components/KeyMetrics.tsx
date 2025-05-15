import { Building, Package, ShoppingCart, Users } from 'lucide-react';
import { QuickInfoCard } from '@/components/building-blocks/quick-info-card/quick-info-card';

export const keyMetricsQuery = `
  SELECT 
    COUNT(DISTINCT o.organization_id) as total_organizations,
    COUNT(DISTINCT u.user_id) as total_users,
    COUNT(DISTINCT p.product_id) as total_products,
    COUNT(DISTINCT s.sale_id) as total_sales 
  FROM organizations o 
  LEFT JOIN users u ON o.organization_id = u.organization_id 
  LEFT JOIN products p ON o.organization_id = p.organization_id 
  LEFT JOIN sales s ON o.organization_id = s.organization_id
`;

export type KeyMetricsData = {
  total_organizations: number;
  total_users: number;
  total_products: number;
  total_sales: number;
};

interface KeyMetricsProps {
  data: KeyMetricsData[];
}

export function KeyMetrics({ data }: KeyMetricsProps) {
  const metrics = data[0];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickInfoCard
        title="Organizations"
        description="Total registered organizations"
        icon={<Building className="h-5 w-5 text-blue-500" />}
      >
        <div className="text-3xl font-bold">{metrics.total_organizations.toLocaleString()}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Users"
        description="Total registered users"
        icon={<Users className="h-5 w-5 text-green-500" />}
      >
        <div className="text-3xl font-bold">{metrics.total_users.toLocaleString()}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Products"
        description="Total active products"
        icon={<Package className="h-5 w-5 text-purple-500" />}
      >
        <div className="text-3xl font-bold">{metrics.total_products.toLocaleString()}</div>
      </QuickInfoCard>

      <QuickInfoCard
        title="Sales"
        description="Total completed sales"
        icon={<ShoppingCart className="h-5 w-5 text-orange-500" />}
      >
        <div className="text-3xl font-bold">{metrics.total_sales.toLocaleString()}</div>
      </QuickInfoCard>
    </div>
  );
}
