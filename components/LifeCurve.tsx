'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { LifeEvent } from '@/types';

interface LifeCurveProps {
  events: LifeEvent[];
  characterName: string;
}

export default function LifeCurve({ events, characterName }: LifeCurveProps) {
  // Transform events into chart data
  const chartData = events
    .filter(e => e.emotional_rating && e.age)
    .map(event => ({
      age: event.age,
      rating: event.emotional_rating,
      event: event.event_title,
      year: event.year
    }))
    .sort((a, b) => a.age! - b.age!);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No life events recorded yet</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.event}</p>
          <p className="text-sm text-gray-600 mt-1">
            Age {data.age} {data.year && `(${data.year})`}
          </p>
          <p className="text-sm font-medium mt-2 text-blue-600">
            Impact: {data.rating}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {characterName}'s Life Journey
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Emotional impact of life events over time
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="age" 
            label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[0, 10]}
            label={{ value: 'Emotional Impact', angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="rating" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fill="url(#colorRating)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Highest Point</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {Math.max(...chartData.map(d => d.rating || 0))}/10
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Life Events</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {chartData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
