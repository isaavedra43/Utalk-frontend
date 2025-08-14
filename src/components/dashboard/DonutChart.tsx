import React, { memo } from 'react';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
}

export const DonutChart = memo<DonutChartProps>(({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = Math.cos(startRad) * radius;
    const y1 = Math.sin(startRad) * radius;
    const x2 = Math.cos(endRad) * radius;
    const y2 = Math.sin(endRad) * radius;
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <div className="relative">
      <svg width="200" height="200" viewBox="-100 -100 200 200" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = currentAngle;
          const endAngle = currentAngle + (percentage * 360) / 100;
          
          const outerRadius = 80;
          const innerRadius = 50;
          
          const path = createArc(startAngle, endAngle, outerRadius);
          
          currentAngle = endAngle;
          
          return (
            <path
              key={index}
              d={path}
              fill="none"
              stroke={item.color}
              strokeWidth={outerRadius - innerRadius}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      
      {/* Centro del donut */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}%</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
});

DonutChart.displayName = 'DonutChart'; 