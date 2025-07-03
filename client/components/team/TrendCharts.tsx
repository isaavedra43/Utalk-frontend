import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  MessageSquare,
  DollarSign,
  Clock,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "../EquipoPerformance";

interface TrendChartsProps {
  seller: Seller;
}

export function TrendCharts({ seller }: TrendChartsProps) {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Chart 1: Line Chart - Chats vs Sales
  const renderChatsVsSalesChart = () => {
    const chartHeight = 150;
    const chartWidth = 300;
    const padding = 30;

    const maxChats = Math.max(...seller.trends.chatsVsSales);
    const innerWidth = chartWidth - padding * 2;
    const innerHeight = chartHeight - padding * 2;

    const getX = (index: number) => padding + (index * innerWidth) / 6;
    const getY = (value: number) =>
      chartHeight - padding - (value / maxChats) * innerHeight;

    const generatePath = (values: number[]) => {
      const points = values.map(
        (value, index) => `${getX(index)},${getY(value)}`,
      );
      return `M ${points.join(" L ")}`;
    };

    // Mock sales data (derived from chats with conversion rate)
    const salesData = seller.trends.chatsVsSales.map((chats) =>
      Math.round(chats * (seller.kpis.conversionRate / 100)),
    );
    const maxSales = Math.max(...salesData);

    return (
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Chats vs Ventas (7 días)
            <Info
              className="h-3 w-3 text-gray-500 cursor-help"
              title="Línea azul: chats atendidos, Línea verde: ventas realizadas"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            width={chartWidth}
            height={chartHeight}
            className="overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding + (innerHeight / 4) * i;
              return (
                <line
                  key={i}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              );
            })}

            {/* Chats line */}
            <path
              d={generatePath(seller.trends.chatsVsSales)}
              fill="none"
              stroke="rgb(96 165 250)"
              strokeWidth="2"
            />

            {/* Sales line */}
            <path
              d={generatePath(
                salesData.map((sale) => (sale / maxSales) * maxChats),
              )}
              fill="none"
              stroke="rgb(74 222 128)"
              strokeWidth="2"
            />

            {/* Data points for chats */}
            {seller.trends.chatsVsSales.map((value, index) => (
              <circle
                key={`chat-${index}`}
                cx={getX(index)}
                cy={getY(value)}
                r="3"
                fill="rgb(96 165 250)"
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>{`${days[index]}: ${value} chats`}</title>
              </circle>
            ))}

            {/* Data points for sales */}
            {salesData.map((value, index) => (
              <circle
                key={`sale-${index}`}
                cx={getX(index)}
                cy={getY((value / maxSales) * maxChats)}
                r="3"
                fill="rgb(74 222 128)"
                className="hover:r-5 transition-all cursor-pointer"
              >
                <title>{`${days[index]}: ${value} ventas`}</title>
              </circle>
            ))}

            {/* X-axis labels */}
            {days.map((day, index) => (
              <text
                key={index}
                x={getX(index)}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                className="fill-gray-400 text-xs"
              >
                {day}
              </text>
            ))}
          </svg>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Chats</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Ventas</span>
              </div>
            </div>
            <Badge className="bg-gray-700 text-gray-300 text-xs">
              Conv: {seller.kpis.conversionRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Chart 2: Bar Chart - Response Time by Day
  const renderResponseTimeChart = () => {
    const chartHeight = 150;
    const chartWidth = 300;
    const padding = 30;
    const barWidth = 25;

    const maxTime = Math.max(...seller.trends.responseTime);
    const innerHeight = chartHeight - padding * 2;
    const spacing = (chartWidth - padding * 2 - barWidth * 7) / 6;

    const getBarX = (index: number) => padding + index * (barWidth + spacing);
    const getBarHeight = (value: number) => (value / maxTime) * innerHeight;

    const getTimeColor = (time: number) => {
      if (time <= 90) return "rgb(74 222 128)"; // Green - good
      if (time <= 150) return "rgb(251 191 36)"; // Yellow - ok
      return "rgb(239 68 68)"; // Red - needs improvement
    };

    return (
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-yellow-400" />
            Tiempo Respuesta por Día
            <Info
              className="h-3 w-3 text-gray-500 cursor-help"
              title="Tiempo medio de respuesta en segundos por día"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg
            width={chartWidth}
            height={chartHeight}
            className="overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map((i) => {
              const value = (maxTime / 4) * (4 - i);
              const y = padding + (innerHeight / 4) * i;
              return (
                <text
                  key={i}
                  x={padding - 5}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-gray-400 text-xs"
                >
                  {Math.round(value)}s
                </text>
              );
            })}

            {/* Bars */}
            {seller.trends.responseTime.map((time, index) => {
              const barHeight = getBarHeight(time);
              const x = getBarX(index);
              const y = chartHeight - padding - barHeight;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={getTimeColor(time)}
                    opacity="0.8"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                    rx="2"
                  >
                    <title>{`${days[index]}: ${time}s`}</title>
                  </rect>
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="fill-white text-xs font-semibold"
                  >
                    {time}s
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {days.map((day, index) => (
              <text
                key={index}
                x={getBarX(index) + barWidth / 2}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                className="fill-gray-400 text-xs"
              >
                {day}
              </text>
            ))}
          </svg>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-gray-400">≤ 90s</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-gray-400">91-150s</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-gray-400">&gt; 150s</span>
              </div>
            </div>
            <Badge className="bg-gray-700 text-gray-300 text-xs">
              Promedio: {seller.kpis.avgResponseTime}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Chart 3: Pie Chart - Channel Distribution
  const renderChannelDistributionChart = () => {
    const centerX = 80;
    const centerY = 80;
    const radius = 60;

    const total = seller.trends.channelDistribution.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );

    const channelColors = {
      WhatsApp: "rgb(74 222 128)",
      SMS: "rgb(168 85 247)",
      Email: "rgb(96 165 250)",
      Facebook: "rgb(59 130 246)",
      Instagram: "rgb(236 72 153)",
    };

    let currentAngle = -90; // Start from top

    const slices = seller.trends.channelDistribution.map((item) => {
      const percentage = (item.percentage / total) * 100;
      const angle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
        "Z",
      ].join(" ");

      return {
        ...item,
        pathData,
        color: channelColors[item.channel as keyof typeof channelColors],
        percentage,
      };
    });

    return (
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
            <PieChart className="h-4 w-4 text-purple-400" />
            Distribución por Canal
            <Info
              className="h-3 w-3 text-gray-500 cursor-help"
              title="Porcentaje de uso por canal de comunicación"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Pie Chart */}
            <svg width="160" height="160" viewBox="0 0 160 160">
              {slices.map((slice, index) => (
                <path
                  key={index}
                  d={slice.pathData}
                  fill={slice.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  opacity="0.9"
                >
                  <title>
                    {slice.channel}: {slice.percentage.toFixed(1)}%
                  </title>
                </path>
              ))}
            </svg>

            {/* Legend */}
            <div className="space-y-2">
              {slices.map((slice, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <div className="text-sm">
                    <span className="text-white font-medium">
                      {slice.channel}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {slice.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="text-gray-500 mb-1">Canal Principal</p>
                <p className="text-white font-semibold">
                  {
                    seller.trends.channelDistribution.reduce((prev, current) =>
                      prev.percentage > current.percentage ? prev : current,
                    ).channel
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Canales</p>
                <p className="text-white font-semibold">
                  {seller.trends.channelDistribution.length}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Diversificación</p>
                <p
                  className={cn(
                    "font-semibold",
                    seller.trends.channelDistribution.length >= 3
                      ? "text-green-400"
                      : "text-yellow-400",
                  )}
                >
                  {seller.trends.channelDistribution.length >= 3
                    ? "Alta"
                    : "Media"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {renderChatsVsSalesChart()}
      {renderResponseTimeChart()}
      {renderChannelDistributionChart()}
    </div>
  );
}
