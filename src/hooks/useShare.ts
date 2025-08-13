import { useState } from 'react';

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  imageDataUrl?: string;
  filename?: string;
}

export const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareImage = async (options: ShareOptions) => {
    setIsSharing(true);
    
    try {
      // Check if Web Share API is supported and the device can share files
      if (navigator.share && navigator.canShare) {
        // Convert data URL to blob for sharing
        if (options.imageDataUrl) {
          const response = await fetch(options.imageDataUrl);
          const blob = await response.blob();
          const file = new File([blob], options.filename || 'boothie-call-photo.png', { 
            type: 'image/png' 
          });
          
          const shareData = {
            title: options.title || 'BoothieCall Photo',
            text: options.text || 'Check out my photo from BoothieCall!',
            files: [file]
          };
          
          // Check if the data can be shared
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            return { success: true, method: 'native' };
          }
        }
        
        // Fallback to sharing without files
        await navigator.share({
          title: options.title || 'BoothieCall Photo',
          text: options.text || 'Check out my photo from BoothieCall!',
          url: options.url || window.location.href
        });
        
        return { success: true, method: 'native-url' };
      }
      
      // Fallback methods for browsers without Web Share API
      return await fallbackShare(options);
      
    } catch (error) {
      console.error('Error sharing:', error);
      return await fallbackShare(options);
    } finally {
      setIsSharing(false);
    }
  };

  const fallbackShare = async (options: ShareOptions) => {
    // Try different fallback methods
    
    // 1. Copy to clipboard
    if (options.imageDataUrl && navigator.clipboard) {
      try {
        // Convert data URL to blob
        const response = await fetch(options.imageDataUrl);
        const blob = await response.blob();
        
        // Create clipboard item
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        return { 
          success: true, 
          method: 'clipboard', 
          message: 'Image copied to clipboard!' 
        };
      } catch (clipboardError) {
        console.warn('Clipboard write failed:', clipboardError);
      }
    }
    
    // 2. Copy text to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        const shareText = `${options.text || 'Check out my photo from BoothieCall!'} ${options.url || window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        return { 
          success: true, 
          method: 'clipboard-text', 
          message: 'Share text copied to clipboard!' 
        };
      } catch (textError) {
        console.warn('Text copy failed:', textError);
      }
    }
    
    // 3. Open share dialog with social media platforms
    return openSocialShare(options);
  };

  const openSocialShare = (options: ShareOptions) => {
    const shareText = encodeURIComponent(options.text || 'Check out my photo from BoothieCall!');
    const shareUrl = encodeURIComponent(options.url || window.location.href);
    
    // Create a share modal with different platform options
    const platforms = [
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        color: '#1DA1F2'
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
        color: '#4267B2'
      },
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
        color: '#25D366'
      },
      {
        name: 'Telegram',
        url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
        color: '#0088cc'
      }
    ];
    
    return { 
      success: true, 
      method: 'social-modal', 
      platforms,
      message: 'Choose a platform to share' 
    };
  };

  const downloadImage = (imageDataUrl: string, filename?: string) => {
    const link = document.createElement('a');
    link.download = filename || `boothie-call-photo-${Date.now()}.png`;
    link.href = imageDataUrl;
    link.click();
    
    return { 
      success: true, 
      method: 'download', 
      message: 'Image downloaded successfully!' 
    };
  };

  const copyImageToClipboard = async (imageDataUrl: string) => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      
      await navigator.clipboard.write([clipboardItem]);
      return { 
        success: true, 
        method: 'clipboard', 
        message: 'Image copied to clipboard!' 
      };
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return { 
        success: false, 
        method: 'clipboard', 
        message: 'Failed to copy image to clipboard' 
      };
    }
  };

  return {
    shareImage,
    downloadImage,
    copyImageToClipboard,
    isSharing
  };
};