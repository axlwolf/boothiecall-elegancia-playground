import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { analyticsService } from '../services/analyticsService';
import { DailySessions, PopularFilter, LayoutUsage } from '../types/Analytics';
import { DailySessionsChart } from '../components/DailySessionsChart';
import { PopularFiltersChart } from '../components/PopularFiltersChart';
import { LayoutUsageChart } from '../components/LayoutUsageChart';

const Analytics: React.FC = () => {
  const [dailySessions, setDailySessions] = useState<DailySessions[]>([]);
  const [popularFilters, setPopularFilters] = useState<PopularFilter[]>([]);
  const [layoutUsage, setLayoutUsage] = useState<LayoutUsage[]>([]);

  useEffect(() => {
    analyticsService.getDailySessions().then(setDailySessions);
    analyticsService.getPopularFilters().then(setPopularFilters);
    analyticsService.getLayoutUsage().then(setLayoutUsage);
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" description="View usage statistics and insights." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-1"><DailySessionsChart data={dailySessions} /></div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1"><PopularFiltersChart data={popularFilters} /></div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1"><LayoutUsageChart data={layoutUsage} /></div>
      </div>
    </div>
  );
};

export default Analytics;
