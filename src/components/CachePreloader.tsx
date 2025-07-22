// Cache preloader component for BoothieCall Elegancia Playground
// Handles preloading of critical assets and templates

import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCache } from '@/hooks/usePersistence';

interface PreloadItem {
  id: string;
  name: string;
  url: string;
  type: 'template' | 'filter' | 'asset' | 'font';
  priority: 'high' | 'medium' | 'low';
  size?: number;
}

interface CachePreloaderProps {
  items?: PreloadItem[];
  autoStart?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const CachePreloader: React.FC<CachePreloaderProps> = ({
  items = [],
  autoStart = false,
  onComplete,
  onError,
  className = ''
}) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState<PreloadItem | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const [totalSize, setTotalSize] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState(0);

  const { cacheAsset, getCacheStats, clearExpired } = useCache();

  // Default preload items for the photobooth app
  const defaultItems: PreloadItem[] = [
    {
      id: 'template-classic',
      name: 'Classic Template',
      url: '/templates/classic.png',
      type: 'template',
      priority: 'high',
      size: 150000
    },
    {
      id: 'template-modern',
      name: 'Modern Template',
      url: '/templates/modern.png',
      type: 'template',
      priority: 'high',
      size: 180000
    },
    {
      id: 'filter-noir',
      name: 'Noir Filter',
      url: '/filters/noir.json',
      type: 'filter',
      priority: 'medium',
      size: 5000
    },
    {
      id: 'filter-vintage',
      name: 'Vintage Filter',
      url: '/filters/vintage.json',
      type: 'filter',
      priority: 'medium',
      size: 5000
    },
    {
      id: 'font-cinzel',
      name: 'Cinzel Font',
      url: '/fonts/cinzel-regular.woff2',
      type: 'font',
      priority: 'high',
      size: 45000
    },
    {
      id: 'logo-boothiecall',
      name: 'BoothieCall Logo',
      url: '/assets/logo.svg',
      type: 'asset',
      priority: 'medium',
      size: 8000
    }
  ];

  const preloadItems = items.length > 0 ? items : defaultItems;

  useEffect(() => {
    // Calculate total size
    const total = preloadItems.reduce((sum, item) => sum + (item.size || 0), 0);
    setTotalSize(total);
  }, [preloadItems]);

  useEffect(() => {
    if (autoStart && !isPreloading) {
      startPreloading();
    }
  }, [autoStart]);

  const preloadSingleItem = async (item: PreloadItem): Promise<void> => {
    try {
      setCurrentItem(item);
      
      // Simulate download progress for items with known size
      if (item.size) {
        const chunks = 10;
        const chunkSize = item.size / chunks;
        
        for (let i = 0; i < chunks; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setDownloadedSize(prev => prev + chunkSize);
        }
      }

      // Cache the item
      const response = await fetch(item.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${item.name}: ${response.statusText}`);
      }

      const blob = await response.blob();
      await cacheAsset(item.url, blob, {
        type: item.type,
        priority: item.priority,
        name: item.name
      });

      setCompletedItems(prev => new Set([...prev, item.id]));
    } catch (error) {
      console.error(`Failed to preload ${item.name}:`, error);
      setFailedItems(prev => new Set([...prev, item.id]));
      
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const startPreloading = useCallback(async () => {
    if (isPreloading) return;

    setIsPreloading(true);
    setProgress(0);
    setDownloadedSize(0);
    setCompletedItems(new Set());
    setFailedItems(new Set());

    try {
      // Clear expired cache first
      await clearExpired();

      // Sort items by priority
      const sortedItems = [...preloadItems].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Preload items sequentially
      for (let i = 0; i < sortedItems.length; i++) {
        await preloadSingleItem(sortedItems[i]);
        setProgress(((i + 1) / sortedItems.length) * 100);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Preloading failed:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsPreloading(false);
      setCurrentItem(null);
    }
  }, [preloadItems, onComplete, onError, cacheAsset, clearExpired]);

  const stopPreloading = () => {
    setIsPreloading(false);
    setCurrentItem(null);
  };

  const getStatusIcon = (itemId: string) => {
    if (completedItems.has(itemId)) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (failedItems.has(itemId)) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (currentItem?.id === itemId) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cache Preloader</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {completedItems.size}/{preloadItems.length}
            </Badge>
            {isPreloading ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopPreloading}
              >
                <X className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startPreloading}
                disabled={completedItems.size === preloadItems.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
          </div>
        </div>
        
        {isPreloading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {currentItem ? `Loading ${currentItem.name}...` : 'Preparing...'}
              </span>
              <span>
                {formatSize(downloadedSize)} / {formatSize(totalSize)}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {preloadItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(item.id)}
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type} • {item.priority} priority
                  {item.size && ` • ${formatSize(item.size)}`}
                </p>
              </div>
            </div>
            
            <Badge
              variant={
                completedItems.has(item.id) ? 'default' :
                failedItems.has(item.id) ? 'destructive' :
                currentItem?.id === item.id ? 'secondary' :
                'outline'
              }
            >
              {completedItems.has(item.id) ? 'Cached' :
               failedItems.has(item.id) ? 'Failed' :
               currentItem?.id === item.id ? 'Loading' :
               'Pending'}
            </Badge>
          </div>
        ))}

        {failedItems.size > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {failedItems.size} item(s) failed to cache. 
              The app will still work but may load slower.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Minimal preloader for use in loading screens
export const MiniCachePreloader: React.FC<{
  onComplete?: () => void;
  className?: string;
}> = ({ onComplete, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          if (onComplete) onComplete();
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (isComplete) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Cache ready</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Preparing cache...</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
};

export default CachePreloader;
