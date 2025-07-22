// Sync status component for BoothieCall Elegancia Playground
// Shows real-time synchronization status and conflicts

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  X,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSync } from '@/hooks/usePersistence';
import { SyncConflict } from '@/types/persistence';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ 
  className = '', 
  showDetails = false,
  compact = false 
}) => {
  const { syncStatus, loading, forceSync, refreshSyncStatus } = useSync();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  useEffect(() => {
    if (syncStatus?.conflicts) {
      setConflicts(syncStatus.conflicts);
    }
  }, [syncStatus]);

  const getSyncStatusIcon = () => {
    if (loading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (!syncStatus?.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (conflicts.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (syncStatus?.pendingChanges > 0) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (loading) return 'Syncing...';
    if (!syncStatus?.isOnline) return 'Offline';
    if (conflicts.length > 0) return `${conflicts.length} conflicts`;
    if (syncStatus?.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Synced';
  };

  const getSyncStatusColor = () => {
    if (loading) return 'bg-blue-500';
    if (!syncStatus?.isOnline) return 'bg-red-500';
    if (conflicts.length > 0) return 'bg-yellow-500';
    if (syncStatus?.pendingChanges > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
      await refreshSyncStatus();
    } catch (error) {
      console.error('Failed to force sync:', error);
    }
  };

  const formatLastSync = (lastSync: string) => {
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getSyncStatusIcon()}
        <span className="text-sm text-muted-foreground">
          {getSyncStatusText()}
        </span>
        {syncStatus?.pendingChanges > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            disabled={loading}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {getSyncStatusIcon()}
        <Badge 
          variant="secondary" 
          className={`${getSyncStatusColor()} text-white border-0`}
        >
          {getSyncStatusText()}
        </Badge>
      </div>

      {showDetails && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sync Status Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection</span>
                <div className="flex items-center space-x-2">
                  {syncStatus?.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {syncStatus?.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              {syncStatus?.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Sync</span>
                  <span className="text-sm text-muted-foreground">
                    {formatLastSync(syncStatus.lastSync)}
                  </span>
                </div>
              )}

              {/* Pending Changes */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Changes</span>
                <Badge variant="outline">
                  {syncStatus?.pendingChanges || 0}
                </Badge>
              </div>

              {/* Conflicts */}
              {conflicts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">
                      Conflicts
                    </span>
                    <Badge variant="destructive">
                      {conflicts.length}
                    </Badge>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {conflicts.map((conflict, index) => (
                      <Card key={index} className="p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {conflict.entity}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conflict.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conflict.timestamp).toLocaleString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForceSync}
                  disabled={loading || !syncStatus?.isOnline}
                  className="flex-1"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Force Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSyncStatus}
                  disabled={loading}
                  className="flex-1"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Actions */}
      {syncStatus?.pendingChanges > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSync}
          disabled={loading || !syncStatus?.isOnline}
          title="Force sync pending changes"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};

// Minimal sync indicator for use in headers or status bars
export const SyncIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { syncStatus, loading } = useSync();

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        loading ? 'bg-blue-500 animate-pulse' :
        !syncStatus?.isOnline ? 'bg-red-500' :
        syncStatus?.conflicts?.length > 0 ? 'bg-yellow-500' :
        syncStatus?.pendingChanges > 0 ? 'bg-blue-500' :
        'bg-green-500'
      }`} />
    </div>
  );
};

export default SyncStatus;
