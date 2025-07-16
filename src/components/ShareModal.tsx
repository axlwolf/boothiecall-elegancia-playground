import React, { useState } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  ExternalLink,
  X,
  Check,
  MessageCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useShare } from '@/hooks/useShare';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  title?: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  title = 'BoothieCall Photo',
  description = 'Check out my photo from BoothieCall!'
}) => {
  const [copySuccess, setCopySuccess] = useState<string>('');
  const { shareImage, downloadImage, copyImageToClipboard, isSharing } = useShare();

  const handleNativeShare = async () => {
    const result = await shareImage({
      title,
      text: description,
      imageDataUrl,
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`
    });

    if (result.success) {
      if (result.method === 'social-modal' && result.platforms) {
        // Handle social media platforms
        return;
      }
      
      setCopySuccess(result.message || 'Shared successfully!');
      setTimeout(() => setCopySuccess(''), 3000);
      
      if (result.method === 'native') {
        onClose();
      }
    }
  };

  const handleDownload = () => {
    downloadImage(imageDataUrl, `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`);
    setCopySuccess('Image downloaded!');
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleCopyImage = async () => {
    const result = await copyImageToClipboard(imageDataUrl);
    setCopySuccess(result.message);
    setTimeout(() => setCopySuccess(''), 3000);
  };

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-blue-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(window.location.href)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(description)}`
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500',
      url: `https://wa.me/?text=${encodeURIComponent(`${description} ${window.location.href}`)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-400',
      url: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(description)}`
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-gold-300 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="text-center">
            <img
              src={imageDataUrl}
              alt="Photo to share"
              className="max-w-full max-h-48 mx-auto rounded-lg"
            />
          </div>

          {/* Success Message */}
          {copySuccess && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 text-green-300">
              <Check className="w-4 h-4" />
              <span className="text-sm font-montserrat">{copySuccess}</span>
            </div>
          )}

          {/* Primary Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="btn-elegancia w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share Photo'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={handleCopyImage}
                variant="outline"
                className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* Social Media Platforms */}
          <div className="space-y-3">
            <h4 className="font-montserrat font-semibold text-sm text-muted-foreground">
              Share on Social Media
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <Button
                  key={platform.name}
                  onClick={() => handleSocialShare(platform.name, platform.url)}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-800 p-3 h-auto flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="text-xs font-montserrat">{platform.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Alternative Methods */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-montserrat font-semibold text-sm text-muted-foreground mb-3">
              Other Options
            </h4>
            
            <div className="space-y-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopySuccess('Link copied to clipboard!');
                  setTimeout(() => setCopySuccess(''), 3000);
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy Page Link
              </Button>
              
              <Button
                onClick={() => {
                  const shareText = `${description}\n\n${window.location.href}`;
                  navigator.clipboard.writeText(shareText);
                  setCopySuccess('Share text copied!');
                  setTimeout(() => setCopySuccess(''), 3000);
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Copy Share Text
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;