import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PopularFilter } from '../types/Analytics';

interface PopularFiltersChartProps {
  data: PopularFilter[];
}

export const PopularFiltersChart: React.FC<PopularFiltersChartProps> = ({ data }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-gold-500">Popular Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="name" stroke="#d8ae48" />
            <YAxis stroke="#d8ae48" />
            <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#d8ae48' }} itemStyle={{ color: '#fff' }} />
            <Bar dataKey="usageCount" fill="#d8ae48" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
