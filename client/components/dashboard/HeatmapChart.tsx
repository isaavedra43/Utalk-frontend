import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeatmapChartProps {
  data: number[]; // 24 hours of data
  title: string;
}

export function HeatmapChart({ data, title }: HeatmapChartProps) {
  const getIntensityColor = (value: number) => {
    if (value >= 60) return "bg-red-500 text-white";
    if (value >= 45) return "bg-orange-500 text-white";
    if (value >= 30) return "bg-yellow-500 text-black";
    if (value >= 15) return "bg-green-500 text-white";
    if (value >= 5) return "bg-blue-500 text-white";
    return "bg-gray-700 text-gray-400";
  };

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, "0");
  };

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          {title}
          <Info
            className="h-4 w-4 text-gray-500 ml-auto cursor-help"
            title="Densidad de mensajes recibidos/enviados por hora"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="grid grid-cols-12 gap-1 mb-4">
          {data.map((value, hour) => (
            <div
              key={hour}
              className={cn(
                "h-8 rounded text-xs flex items-center justify-center font-medium transition-all cursor-pointer hover:scale-110 hover:z-10 relative",
                getIntensityColor(value),
              )}
              title={`${formatHour(hour)}:00 - ${value} mensajes`}
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Time Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Intensidad:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-700 rounded"></div>
              <span className="text-gray-500 mr-2">Baja</span>
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-500 ml-2">Alta</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between pt-2 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500">Pico máximo</p>
              <p className="text-sm font-semibold text-white">
                {maxValue} msg/h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Promedio</p>
              <p className="text-sm font-semibold text-white">
                {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}{" "}
                msg/h
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Mínimo</p>
              <p className="text-sm font-semibold text-white">
                {minValue} msg/h
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
