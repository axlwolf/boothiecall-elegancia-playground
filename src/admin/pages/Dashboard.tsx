import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { analyticsService } from '../services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '../types/Asset';
import { User } from '../types/User';
import { DailySessionsChart } from '../components/DailySessionsChart';
import { PopularFiltersChart } from '../components/PopularFiltersChart';
import { LayoutUsageChart } from '../components/LayoutUsageChart';
import { Folder, Users, Palette, Filter, FileText, UserPlus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDesigns, setTotalDesigns] = useState(0);
  const [totalFilters, setTotalFilters] = useState(0);
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [dailySessions, setDailySessions] = useState([]);
  const [popularFilters, setPopularFilters] = useState([]);
  const [layoutUsage, setLayoutUsage] = useState([]);

  useEffect(() => {
    analyticsService.getTotalAssets().then(setTotalAssets);
    analyticsService.getTotalUsers().then(setTotalUsers);
    analyticsService.getTotalDesigns().then(setTotalDesigns);
    analyticsService.getTotalFilters().then(setTotalFilters);
    analyticsService.getRecentAssets().then(setRecentAssets);
    analyticsService.getRecentUsers().then(setRecentUsers);
    analyticsService.getDailySessions().then(setDailySessions);
    analyticsService.getPopularFilters().then(setPopularFilters);
    analyticsService.getLayoutUsage().then(setLayoutUsage);
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome to the admin dashboard. Here's a quick overview of your system." />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-500">{totalAssets}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-500">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-500">{totalDesigns}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Filters</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gold-500">{totalFilters}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <DailySessionsChart data={dailySessions} />
        </div>
        <PopularFiltersChart data={popularFilters} />
        <LayoutUsageChart data={layoutUsage} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-gold-500">Recent Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentAssets.length > 0 ? (
                recentAssets.map(asset => (
                  <li key={asset.id} className="flex items-center space-x-2">
                    <img src={asset.url} alt={asset.fileName} className="h-8 w-8 object-cover rounded-md" />
                    <p className="text-sm">{asset.fileName} ({asset.type})</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent assets.</p>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-gold-500">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.isArray(recentUsers) && recentUsers.length > 0 ? (
                recentUsers.map(user => (
                  <li key={user.id} className="flex items-center space-x-2">
                    <p className="text-sm">{user.email} ({user.role})</p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent users.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
