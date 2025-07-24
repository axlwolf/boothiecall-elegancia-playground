/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and optimization controls
 */

import React, { useState } from 'react';
import { 
  usePerformanceMonitoring, 
  useImageCompression, 
  useLazyLoading,
  useMemoryMonitoring,
  useBundleMonitoring
} from '@/hooks/usePerformance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Zap, 
  HardDrive, 
  Image, 
  Loader2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onToggle: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  isVisible, 
  onToggle 
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  // Performance hooks
  const { metrics, optimizePage, generateReport } = usePerformanceMonitoring();
  const { compressionStats, isCompressing } = useImageCompression();
  const { loadingStats } = useLazyLoading();
  const memoryInfo = useMemoryMonitoring();
  const bundleInfo = useBundleMonitoring();

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await optimizePage();
    } finally {
      setIsOptimizing(false);
    }
  };

  const getPerformanceStatus = () => {
    const issues = [];
    
    if (metrics.memoryUsage > 100) issues.push('High memory usage');
    if (metrics.bundleSize > 1024) issues.push('Large bundle size');
    if (metrics.loadTime > 3000) issues.push('Slow load time');
    if (loadingStats.failed > 0) issues.push('Failed resource loads');
    
    if (issues.length === 0) return { status: 'good', message: 'Performance is optimal' };
    if (issues.length <= 2) return { status: 'warning', message: `${issues.length} performance issues` };
    return { status: 'critical', message: `${issues.length} critical issues` };
  };

  const performanceStatus = getPerformanceStatus();

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white"
        size="sm"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-gold" />
          <h3 className="text-lg font-semibold text-white">Performance Monitor</h3>
        </div>
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          ×
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Performance Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              {performanceStatus.status === 'good' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
              {performanceStatus.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
              {performanceStatus.status === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">{performanceStatus.message}</span>
              <Badge 
                variant={performanceStatus.status === 'good' ? 'default' : 'destructive'}
                className={
                  performanceStatus.status === 'good' 
                    ? 'bg-green-600' 
                    : performanceStatus.status === 'warning'
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }
              >
                {performanceStatus.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="text-white">{memoryInfo.used.toFixed(1)} MB</span>
              </div>
              <Progress 
                value={memoryInfo.percentage} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {memoryInfo.percentage.toFixed(1)}% of {memoryInfo.total.toFixed(1)} MB
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Bundle Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Size</span>
                <span className="text-white">{(bundleInfo.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gzipped</span>
                <span className="text-white">{(bundleInfo.gzippedSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Load Time</span>
                <span className="text-white">{bundleInfo.loadTime.toFixed(0)}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Loading */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <Image className="h-4 w-4 mr-2" />
              Resource Loading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">
                  {loadingStats.loaded}/{loadingStats.total}
                </span>
              </div>
              <Progress 
                value={loadingStats.loadingProgress} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Loading: {loadingStats.loading}</span>
                <span>Failed: {loadingStats.failed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Compression */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Image Compression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Processed</span>
                <span className="text-white">{compressionStats.totalSaved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Ratio</span>
                <span className="text-white">
                  {(compressionStats.averageRatio * 100).toFixed(1)}%
                </span>
              </div>
              {isCompressing && (
                <div className="flex items-center text-yellow-400">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span className="text-xs">Compressing...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Core Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Core Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-400">Load Time</div>
                <div className="text-white font-mono">{metrics.loadTime.toFixed(0)}ms</div>
              </div>
              <div>
                <div className="text-gray-400">Render Time</div>
                <div className="text-white font-mono">{metrics.renderTime.toFixed(0)}ms</div>
              </div>
              <div>
                <div className="text-gray-400">Resources</div>
                <div className="text-white font-mono">{metrics.resourceCount}</div>
              </div>
              <div>
                <div className="text-gray-400">Cache Hit</div>
                <div className="text-white font-mono">{(metrics.cacheHitRate * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex-1 bg-gold hover:bg-gold/90 text-black"
            size="sm"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-2" />
                Optimize
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              const report = generateReport();
              console.log('Performance Report:', report);
            }}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            size="sm"
          >
            Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
