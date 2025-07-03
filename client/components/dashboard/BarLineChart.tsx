import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MessageSquare, DollarSign, Info } from "lucide-react";

interface SalesData {
  teams: string[];
  sales: number[];
  messages: number[];
}

interface BarLineChartProps {
  data: SalesData;
  title: string;
}

export function BarLineChart({ data, title }: BarLineChartProps) {
  const { teams, sales, messages } = data;
  const maxSales = Math.max(...sales);
  const maxMessages = Math.max(...messages);

  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 50;
  const barWidth = 40;
  const spacing =
    (chartWidth - padding * 2 - barWidth * teams.length) / (teams.length - 1);

  // Calculate positions
  const getBarX = (index: number) => padding + index * (barWidth + spacing);
  const getSalesHeight = (value: number) =>
    (value / maxSales) * (chartHeight - padding * 2);
  const getMessageY = (value: number) =>
    chartHeight - padding - (value / maxMessages) * (chartHeight - padding * 2);

  // Generate line path for messages
  const generateMessagePath = () => {
    const points = messages.map((msg, index) => {
      const x = getBarX(index) + barWidth / 2;
      const y = getMessageY(msg);
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            {title}
            <Info
              className="h-4 w-4 text-gray-500 cursor-help"
              title="Barras: número de ventas, Línea: número de mensajes"
            />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Ventas
            </Badge>
            <Badge className="bg-green-600 text-white text-xs flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Mensajes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <div className="relative">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="overflow-visible"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Grid lines for sales (left axis) */}
            {[0, 1, 2, 3, 4].map((i) => {
              const value = (maxSales / 4) * (4 - i);
              const y = padding + ((chartHeight - padding * 2) / 4) * i;
              return (
                <g key={`sales-grid-${i}`}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-blue-400 text-xs font-medium"
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Grid lines for messages (right axis) */}
            {[0, 1, 2, 3, 4].map((i) => {
              const value = (maxMessages / 4) * (4 - i);
              const y = padding + ((chartHeight - padding * 2) / 4) * i;
              return (
                <text
                  key={`msg-grid-${i}`}
                  x={chartWidth - padding + 10}
                  y={y + 4}
                  textAnchor="start"
                  className="fill-green-400 text-xs font-medium"
                >
                  {Math.round(value)}
                </text>
              );
            })}

            {/* Sales bars */}
            {sales.map((sale, index) => {
              const barHeight = getSalesHeight(sale);
              const x = getBarX(index);
              const y = chartHeight - padding - barHeight;

              return (
                <g key={`bar-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="rgb(96 165 250)"
                    opacity="0.8"
                    className="hover:opacity-100 transition-opacity cursor-pointer"
                    rx="2"
                  >
                    <title>{`${teams[index]}: ${sale} ventas`}</title>
                  </rect>
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="fill-white text-xs font-semibold"
                  >
                    {sale}
                  </text>
                </g>
              );
            })}

            {/* Messages line */}
            <path
              d={generateMessagePath()}
              fill="none"
              stroke="rgb(74 222 128)"
              strokeWidth="3"
              className="drop-shadow-sm"
            />

            {/* Message points */}
            {messages.map((msg, index) => {
              const x = getBarX(index) + barWidth / 2;
              const y = getMessageY(msg);

              return (
                <g key={`point-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="rgb(74 222 128)"
                    className="hover:r-7 transition-all cursor-pointer drop-shadow-md"
                  >
                    <title>{`${teams[index]}: ${msg} mensajes`}</title>
                  </circle>
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="fill-green-400 text-xs font-semibold"
                  >
                    {msg}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {teams.map((team, index) => (
              <text
                key={`label-${index}`}
                x={getBarX(index) + barWidth / 2}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="fill-gray-400 text-xs font-medium"
              >
                {team.replace("Ventas ", "")}
              </text>
            ))}

            {/* Axis labels */}
            <text
              x={padding - 35}
              y={chartHeight / 2}
              textAnchor="middle"
              className="fill-blue-400 text-xs font-semibold"
              transform={`rotate(-90 ${padding - 35} ${chartHeight / 2})`}
            >
              Ventas
            </text>
            <text
              x={chartWidth - padding + 35}
              y={chartHeight / 2}
              textAnchor="middle"
              className="fill-green-400 text-xs font-semibold"
              transform={`rotate(90 ${chartWidth - padding + 35} ${chartHeight / 2})`}
            >
              Mensajes
            </text>
          </svg>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Total Ventas
              </span>
            </div>
            <p className="text-xl font-bold text-white">
              {sales.reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-xs text-gray-400">
              Promedio:{" "}
              {Math.round(
                sales.reduce((sum, val) => sum + val, 0) / sales.length,
              )}{" "}
              por equipo
            </p>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Total Mensajes
              </span>
            </div>
            <p className="text-xl font-bold text-white">
              {messages.reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-xs text-gray-400">
              Promedio:{" "}
              {Math.round(
                messages.reduce((sum, val) => sum + val, 0) / messages.length,
              )}{" "}
              por equipo
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
