import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AgentData {
  agent: string;
  data: number[]; // 7 days of data
}

interface LineChartAgentProps {
  data: AgentData[];
  title: string;
}

const agentColors = [
  "stroke-blue-400 fill-blue-400/20",
  "stroke-green-400 fill-green-400/20",
  "stroke-purple-400 fill-purple-400/20",
  "stroke-yellow-400 fill-yellow-400/20",
  "stroke-pink-400 fill-pink-400/20",
];

const agentBadgeColors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-yellow-600",
  "bg-pink-600",
];

export function LineChartAgent({ data, title }: LineChartAgentProps) {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const maxValue = Math.max(...data.flatMap((agent) => agent.data));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  // Calculate chart dimensions
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Helper function to calculate point position
  const getX = (index: number) => padding + (index * innerWidth) / 6;
  const getY = (value: number) =>
    chartHeight - padding - (value / maxValue) * innerHeight;

  // Generate SVG path for each agent
  const generatePath = (values: number[]) => {
    const points = values.map(
      (value, index) => `${getX(index)},${getY(value)}`,
    );
    return `M ${points.join(" L ")}`;
  };

  const tooltipContent = "Número de chats resueltos por día";

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            {title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle
                    className="h-4 w-4 text-gray-400 cursor-help"
                    aria-label={tooltipContent}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Badge className="bg-gray-700 text-gray-300 text-xs">
            Últimos 7 días
          </Badge>
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
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width={innerWidth / 6}
                height={innerHeight / 4}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${innerWidth / 6} 0 L 0 0 0 ${innerHeight / 4}`}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
              </pattern>
            </defs>
            <rect
              x={padding}
              y={padding}
              width={innerWidth}
              height={innerHeight}
              fill="url(#grid)"
            />

            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map((i) => {
              const value = (maxValue / 4) * (4 - i);
              const y = padding + (innerHeight / 4) * i;
              return (
                <text
                  key={i}
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-400 text-xs"
                >
                  {Math.round(value)}
                </text>
              );
            })}

            {/* X-axis labels */}
            {days.map((day, index) => (
              <text
                key={index}
                x={getX(index)}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="fill-gray-400 text-xs"
              >
                {day}
              </text>
            ))}

            {/* Agent lines */}
            {data.map((agent, agentIndex) => (
              <g key={agent.agent}>
                {/* Line */}
                <path
                  d={generatePath(agent.data)}
                  fill="none"
                  stroke={`rgb(${agentIndex === 0 ? "96 165 250" : agentIndex === 1 ? "74 222 128" : agentIndex === 2 ? "168 85 247" : agentIndex === 3 ? "251 191 36" : "244 114 182"})`}
                  strokeWidth="2"
                  className="hover:stroke-width-3 transition-all"
                />

                {/* Data points */}
                {agent.data.map((value, pointIndex) => (
                  <circle
                    key={pointIndex}
                    cx={getX(pointIndex)}
                    cy={getY(value)}
                    r="4"
                    fill={`rgb(${agentIndex === 0 ? "96 165 250" : agentIndex === 1 ? "74 222 128" : agentIndex === 2 ? "168 85 247" : agentIndex === 3 ? "251 191 36" : "244 114 182"})`}
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${agent.agent}: ${value} chats resueltos`}</title>
                  </circle>
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-medium">Agentes:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.map((agent, index) => {
              const totalChats = agent.data.reduce((sum, val) => sum + val, 0);
              const avgChats = Math.round(totalChats / 7);

              return (
                <div
                  key={agent.agent}
                  className="flex items-center justify-between p-2 bg-gray-900/50 rounded hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-3 h-3 rounded-full", {
                        "bg-blue-400": index === 0,
                        "bg-green-400": index === 1,
                        "bg-purple-400": index === 2,
                        "bg-yellow-400": index === 3,
                        "bg-pink-400": index === 4,
                      })}
                    ></div>
                    <span className="text-xs text-gray-300 font-medium">
                      {agent.agent.split(" ")[0]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">
                      {totalChats}
                    </p>
                    <p className="text-xs text-gray-500">~{avgChats}/día</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
