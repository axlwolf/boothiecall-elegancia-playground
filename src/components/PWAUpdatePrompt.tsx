/**
 * PWA Update Prompt Component
 * Shows update notifications and allows users to apply updates
 */

import React, { useState } from 'react';
import { RefreshCw, X, Download, AlertCircle } from 'lucide-react';
import { usePWAUpdate } from '../hooks/usePWA';

interface PWAUpdatePromptProps {
  onClose?: () => void;
  className?: string;
  autoShow?: boolean;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  onClose,
  className = '',
  autoShow = true
}) => {
  const { updateAvailable, isApplying, applyUpdate } = usePWAUpdate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!updateAvailable || (isDismissed && !autoShow)) {
    return null;
  }

  const handleUpdate = async () => {
    await applyUpdate();
    if (onClose) {
      onClose();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-gradient-to-r from-blue-900/90 to-purple-900/90 border border-blue-400/30 rounded-lg p-4 backdrop-blur-sm ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <RefreshCw size={20} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-white font-medium">Update Available</h3>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </div>
          <p className="text-blue-100 text-sm mb-3">
            A new version of BoothieCall is ready. Update now for the latest features and improvements.
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdate}
              disabled={isApplying}
              className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Update Now</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="text-blue-200 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-200 hover:text-white transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

/**
 * Mini PWA Update Badge - compact indicator for headers
 */
export const PWAUpdateBadge: React.FC<{ 
  className?: string;
  onClick?: () => void;
}> = ({ className = '', onClick }) => {
  const { updateAvailable, isApplying, applyUpdate } = usePWAUpdate();

  if (!updateAvailable) {
    return null;
  }

  const handleClick = async () => {
    if (onClick) {
      onClick();
    } else {
      await applyUpdate();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isApplying}
      className={`relative inline-flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Update available"
    >
      {isApplying ? (
        <RefreshCw size={12} className="animate-spin" />
      ) : (
        <AlertCircle size={12} />
      )}
      <span>Update</span>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    </button>
  );
};

/**
 * PWA Update Toast - floating notification
 */
export const PWAUpdateToast: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration?: number;
}> = ({ 
  position = 'top-right',
  duration = 0 // 0 means no auto-dismiss
}) => {
  const { updateAvailable, isApplying, applyUpdate } = usePWAUpdate();
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (duration > 0 && updateAvailable) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, updateAvailable]);

  if (!updateAvailable || !isVisible) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const handleUpdate = async () => {
    await applyUpdate();
    setIsVisible(false);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-sm`}>
      <div className="bg-gray-900 border border-blue-400/30 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-white font-medium text-sm mb-1">Update Ready</h4>
            <p className="text-gray-300 text-xs mb-3">
              New version available with improvements
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpdate}
                disabled={isApplying}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isApplying ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * PWA Version Display - shows current version
 */
export const PWAVersionDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { getVersion } = usePWAUpdate();
  const [version, setVersion] = useState<string>('');

  React.useEffect(() => {
    getVersion().then(setVersion);
  }, [getVersion]);

  if (!version || version === 'unknown') {
    return null;
  }

  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      v{version.replace('boothiecall-elegancia-', '')}
    </div>
  );
};
