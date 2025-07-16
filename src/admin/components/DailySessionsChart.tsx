import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailySessions } from '../types/Analytics';

interface DailySessionsChartProps {
  data: DailySessions[];
}

export const DailySessionsChart: React.FC<DailySessionsChartProps> = ({ data }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-gold-500">Daily Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="date" stroke="#d8ae48" />
            <YAxis stroke="#d8ae48" />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#d8ae48' }} itemStyle={{ color: '#fff' }} />
            <Line type="monotone" dataKey="count" stroke="#d8ae48" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
