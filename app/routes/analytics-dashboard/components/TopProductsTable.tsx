import { UniversalTableCard } from '@/components/building-blocks/universal-table-card/universal-table-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const topProductsQuery = `
  SELECT 
    p.product_name,
    SUM(si.quantity) as total_quantity_sold,
    SUM(si.total_price) as total_revenue 
  FROM products p 
  JOIN sale_items si ON p.product_id = si.product_id 
  JOIN sales s ON si.sale_id = s.sale_id 
  WHERE s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY p.product_name 
  ORDER BY total_revenue DESC 
  LIMIT 10
`;

export type TopProductData = {
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
};

interface TopProductsTableProps {
  data: TopProductData[];
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <UniversalTableCard
      title="Top Products"
      description="Best performing products by revenue in the last 30 days"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-right">Quantity Sold</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.product_name}>
              <TableCell>{product.product_name}</TableCell>
              <TableCell className="text-right">{product.total_quantity_sold.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                }).format(product.total_revenue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </UniversalTableCard>
  );
}
