/**
 * PWA Install Prompt Component
 * Shows installation prompts and instructions for different platforms
 */

import React, { useState } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  onClose?: () => void;
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onClose,
  className = ''
}) => {
  const { canInstall, isInstalling, install, isMobile, isIOS, getInstallInstructions } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (!canInstall && !isIOS) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    const success = await install();
    if (success && onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowInstructions(false);
    if (onClose) {
      onClose();
    }
  };

  if (showInstructions && isIOS) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${className}`}>
        <div className="bg-gray-900 border border-gold/20 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Install BoothieCall</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              To install this app on your iPhone/iPad:
            </p>

            <div className="space-y-3">
              {getInstallInstructions().map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-black text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-300 text-sm flex-1">{instruction}</p>
                  {index === 0 && (
                    <Share size={20} className="text-blue-400 flex-shrink-0" />
                  )}
                  {index === 1 && (
                    <Plus size={20} className="text-green-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Smartphone size={16} className="text-gold" />
                <span className="text-sm font-medium text-white">Benefits of Installing:</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Works offline</li>
                <li>• Faster loading</li>
                <li>• Full screen experience</li>
                <li>• Home screen access</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-6 bg-gold text-black py-2 px-4 rounded-lg font-medium hover:bg-gold/90 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gold/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <Download size={20} className="text-black" />
          </div>
          <div>
            <h3 className="text-white font-medium">Install BoothieCall</h3>
            <p className="text-gray-400 text-sm">
              {isMobile ? 'Add to home screen for better experience' : 'Install as desktop app'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-gold text-black px-4 py-2 rounded-lg font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Mini PWA Install Button - compact version for headers/toolbars
 */
export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canInstall, isInstalling, install, isIOS } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  if (!canInstall && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowPrompt(true);
      return;
    }

    await install();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isInstalling}
        className={`inline-flex items-center space-x-2 bg-gold text-black px-3 py-2 rounded-lg font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Install BoothieCall App"
      >
        <Download size={16} />
        <span className="hidden sm:inline">
          {isInstalling ? 'Installing...' : 'Install'}
        </span>
      </button>

      {showPrompt && (
        <PWAInstallPrompt onClose={() => setShowPrompt(false)} />
      )}
    </>
  );
};

/**
 * PWA Status Indicator - shows installation status
 */
export const PWAStatusIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canInstall, isInstalled, isMobile } = usePWAInstall();

  if (!canInstall && !isInstalled) {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-1 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isInstalled ? 'bg-green-400' : 'bg-gold'}`} />
      <span className="text-gray-400">
        {isInstalled ? 'Installed' : 'Installable'}
      </span>
    </div>
  );
};
