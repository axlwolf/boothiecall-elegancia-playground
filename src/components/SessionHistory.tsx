import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Share2, 
  Eye, 
  Calendar,
  Camera,
  Filter,
  Clock,
  BarChart3,
  X,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HybridStorageService } from '@/lib/hybridStorage';
import { PhotoSession, SessionSummary, SessionStats } from '@/types/session';

interface SessionHistoryProps {
  onClose: () => void;
  onReplaySession?: (session: PhotoSession) => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onClose, onReplaySession }) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [selectedSession, setSelectedSession] = useState<PhotoSession | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  
  const sessionStorage = HybridStorageService.getInstance();

  const loadData = useCallback(async () => {
    setSessions(await sessionStorage.getSessionSummaries());
    setStats(await sessionStorage.getSessionStats());
  }, [sessionStorage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewSession = useCallback(async (sessionId: string) => {
    const session = await sessionStorage.getSession(sessionId);
    if (session) {
      setSelectedSession(session);
      setIsViewDialogOpen(true);
    }
  }, [sessionStorage]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (await sessionStorage.deleteSession(sessionId)) {
      await loadData();
    }
  }, [sessionStorage, loadData]);

  const handleClearAll = useCallback(async () => {
    if (confirm('Are you sure you want to delete all photo sessions? This action cannot be undone.')) {
      await sessionStorage.clearAllSessions();
      await loadData();
    }
  }, [sessionStorage, loadData]);

  const handleCopyLink = useCallback((session: PhotoSession) => {
    // For now, just copy the data URL to clipboard
    navigator.clipboard.writeText(session.finalImageUrl).then(() => {
      alert('Image data copied to clipboard!');
    }).catch(() => {
      alert('Unable to copy. Please download the image instead.');
    });
  }, []);

  const handleShareSession = useCallback(async (session: PhotoSession) => {
    if (navigator.share) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(session.finalImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `boothie-call-${session.id}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'BoothieCall Photo',
          text: `Check out my photo from BoothieCall! Created with ${session.layout.name} layout.`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy link
        handleCopyLink(session);
      }
    } else {
      handleCopyLink(session);
    }
  }, [handleCopyLink]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow">
              Photo Sessions
            </h1>
            <p className="text-lg text-muted-foreground font-montserrat">
              Your BoothieCall photo history and statistics
            </p>
          </div>
        </div>
        
        {sessions.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            size="sm"
            className="border-red-400/30 text-red-300 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gold-400/20 mb-8">
          <TabsTrigger value="history" className="data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {sessions.length === 0 ? (
            <Card className="card-elegancia">
              <CardContent className="pt-12 pb-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-cinzel font-semibold mb-2">No Photo Sessions Yet</h3>
                <p className="text-muted-foreground font-montserrat mb-6">
                  Start creating some amazing photos to see them here!
                </p>
                <Button
                  onClick={onClose}
                  className="btn-elegancia"
                >
                  Create Your First Photo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="card-elegancia group hover:bg-gray-800/50 transition-colors">
                  <CardContent className="p-4">
                    {/* Thumbnail */}
                    <div className="aspect-[3/4] mb-4 bg-gradient-card rounded-lg overflow-hidden">
                      <img
                        src={session.thumbnailUrl}
                        alt={`${session.layoutName} session`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Session Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {session.layoutName}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.photoCount} photos
                        </Badge>
                      </div>
                      
                      <h3 className="font-montserrat font-semibold text-sm">
                        {session.templateName}
                      </h3>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(session.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewSession(session.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const fullSession = sessionStorage.getSession(session.id);
                          if (fullSession) handleShareSession(fullSession);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        onClick={() => handleDeleteSession(session.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-400/30 text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="card-elegancia">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-montserrat text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-cinzel font-bold text-gold-300">{stats.totalSessions}</p>
                    </div>
                    <Camera className="w-8 h-8 text-gold-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elegancia">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-montserrat text-muted-foreground">Total Photos</p>
                      <p className="text-2xl font-cinzel font-bold text-gold-300">{stats.totalPhotos}</p>
                    </div>
                    <History className="w-8 h-8 text-gold-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elegancia">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-montserrat text-muted-foreground">Avg Duration</p>
                      <p className="text-2xl font-cinzel font-bold text-gold-300">
                        {formatDuration(stats.averageSessionDuration)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-gold-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elegancia">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-montserrat text-muted-foreground">Favorite Layout</p>
                      <p className="text-lg font-cinzel font-bold text-gold-300">{stats.favoriteLayout}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-gold-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && stats.mostUsedFilters.length > 0 && (
            <Card className="card-elegancia">
              <CardHeader>
                <CardTitle className="font-cinzel flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Most Used Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.mostUsedFilters.map((filter, index) => (
                    <div key={filter.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-montserrat font-medium">{filter.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {filter.count} uses
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-gold-300">
              Session Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Layout:</p>
                  <p className="font-semibold">{selectedSession.layout.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Template:</p>
                  <p className="font-semibold">{selectedSession.template.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date:</p>
                  <p className="font-semibold">{formatDate(selectedSession.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration:</p>
                  <p className="font-semibold">{formatDuration(selectedSession.metadata.duration)}</p>
                </div>
              </div>

              {/* Final Image */}
              <div className="text-center">
                <img
                  src={selectedSession.finalImageUrl}
                  alt="Final photo strip"
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handleDownloadSession(selectedSession)}
                  className="btn-elegancia"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  onClick={() => handleShareSession(selectedSession)}
                  variant="outline"
                  className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                {onReplaySession && (
                  <Button
                    onClick={() => {
                      onReplaySession(selectedSession);
                      setIsViewDialogOpen(false);
                      onClose();
                    }}
                    variant="outline"
                    className="border-green-400/30 text-green-300 hover:bg-green-400/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Recreate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionHistory;