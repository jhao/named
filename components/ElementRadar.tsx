import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ElementScore } from '../types';

interface Props {
  data: ElementScore[];
}

const ElementRadar: React.FC<Props> = ({ data }) => {
  // Sort data to standard Wuxing order if possible: 金 -> 水 -> 木 -> 火 -> 土
  // This makes the chart easier to read for enthusiasts, though not strictly required.
  const order = ['金', '水', '木', '火', '土'];
  const sortedData = [...data].sort((a, b) => {
    return order.indexOf(a.element) - order.indexOf(b.element);
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sortedData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="element" 
            tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="五行强度"
            dataKey="score"
            stroke="#c04851"
            fill="#c04851"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElementRadar;