import { LoaderComponent } from "@/components/building-blocks/loader-component/loader-component";
import { ErrorComponent } from "@/components/building-blocks/error-component/error-component";
import { UniversalChartCard } from "@/components/building-blocks/universal-chart-card/universal-chart-card";
import { DataInjectorWrapper } from "@/components/hoc/data-injector/data-injector";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ComponentProps, ReactElement } from "react";
import { Cell, Label, LabelList, Pie, PieChart } from "recharts";
import { cn } from "@/lib/utils";
import { AvailableColors as AvailableColor } from "@/types/colors";

type ChartSharePercentageProps<
  TData extends Record<string, string | number>[]
> = {
  queryId: number;
  chartConfig: ChartConfig;
  className?: string;
  title: string;
  description?: string;
  dataKey: string;
  nameKey: string;
  centerValueRenderer?: (data: TData) => { title: string; subtitle?: string };
  valueFormatter?: (value: number) => string;
  footerRenderer?: (data: TData) => ReactElement | undefined;
  headerRenderer?: (data: TData) => ReactElement | undefined;
  backgroundColor?: AvailableColor;
};

const ChartSharePercentage = <TData extends Record<string, string | number>[]>({
  className,
  title,
  description,
  dataKey,
  nameKey,
  valueFormatter = (value: number) => (value > 5 ? `${value.toFixed(0)}` : ""),
  footerRenderer,
  headerRenderer,
  centerValueRenderer,
  chartConfig,
  queryId,
  backgroundColor,
}: ChartSharePercentageProps<TData>) => {
  const renderComponent = (
    renderDataRepresentation: () => ComponentProps<
      typeof ChartContainer
    >["children"],
    data?: TData
  ) => {
    return (
      <UniversalChartCard
        className={cn(
          className,
          backgroundColor &&
            `bg-gradient-to-r from-background to-${backgroundColor}-500/5 border-${backgroundColor}-500/10`
        )}
        title={title}
        description={description}
        CardFooterComponent={data && footerRenderer?.(data)}
        CardHeaderComponent={data && headerRenderer?.(data)}
        chartConfig={chartConfig}
      >
        {renderDataRepresentation()}
      </UniversalChartCard>
    );
  };

  return (
    <DataInjectorWrapper
      queryId={queryId}
      ErrorComponent={renderComponent(() => (
        <ErrorComponent className="h-full w-full" />
      ))}
      LoaderComponent={renderComponent(() => (
        <LoaderComponent className="h-full w-full" />
      ))}
      renderComponent={(data: TData) => {
        return renderComponent(
          () => (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend
                content={<ChartLegendContent nameKey={nameKey} />}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Pie
                innerRadius={"54%"}
                paddingAngle={2.5}
                minAngle={4}
                cornerRadius={"12%"}
                strokeWidth={2}
                data={data.map((item) => ({
                  ...item,
                  fill: `var(--color-${item[nameKey]})`,
                }))}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`var(--color-${entry[nameKey]})`}
                    style={{
                      filter: `drop-shadow(0px 0px 3px ${`var(--color-${entry[nameKey]})`}`,
                    }}
                    stroke="0"
                  />
                ))}
                <LabelList
                  dataKey={dataKey}
                  className="fill-background"
                  stroke="none"
                  fontSize={11}
                  formatter={valueFormatter}
                />
                {centerValueRenderer && (
                  <Label
                    content={({ viewBox }) => {
                      const { title, subtitle } = centerValueRenderer(data);

                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            className="pointer-events-none"
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-[1.8em] font-bold"
                            >
                              {title}
                            </tspan>
                            {subtitle && (
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground"
                              >
                                {subtitle}
                              </tspan>
                            )}
                          </text>
                        );
                      }
                    }}
                  />
                )}
              </Pie>
            </PieChart>
          ),
          data
        );
      }}
    />
  );
};

export { ChartSharePercentage };
