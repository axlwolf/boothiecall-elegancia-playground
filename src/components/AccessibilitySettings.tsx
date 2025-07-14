import React from 'react';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Keyboard, 
  Volume2, 
  MousePointer,
  Contrast,
  Zap,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibilitySettingsProps {
  trigger?: React.ReactNode;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ trigger }) => {
  const { settings, updateSetting, isKeyboardUser, announceToScreenReader, skipToContent } = useAccessibility();

  const settingsOptions = [
    {
      id: 'reduceMotion',
      label: 'Reduce Motion',
      description: 'Reduces animations and transitions for better focus',
      icon: Zap,
      value: settings.reduceMotion,
      category: 'Visual'
    },
    {
      id: 'highContrast',
      label: 'High Contrast',
      description: 'Increases contrast for better visibility',
      icon: Contrast,
      value: settings.highContrast,
      category: 'Visual'
    },
    {
      id: 'largeText',
      label: 'Large Text',
      description: 'Increases font size throughout the application',
      icon: Type,
      value: settings.largeText,
      category: 'Visual'
    },
    {
      id: 'keyboardNavigation',
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard navigation with visible focus indicators',
      icon: Keyboard,
      value: settings.keyboardNavigation,
      category: 'Navigation'
    },
    {
      id: 'screenReaderMode',
      label: 'Screen Reader Mode',
      description: 'Optimized for screen reader users with enhanced announcements',
      icon: Volume2,
      value: settings.screenReaderMode,
      category: 'Assistive'
    },
    {
      id: 'focusVisible',
      label: 'Visible Focus',
      description: 'Shows clear focus indicators for interactive elements',
      icon: Eye,
      value: settings.focusVisible,
      category: 'Navigation'
    }
  ];

  const handleSettingChange = (settingId: string, value: boolean) => {
    updateSetting(settingId as keyof typeof settings, value);
    announceToScreenReader(
      `${settingsOptions.find(s => s.id === settingId)?.label} ${value ? 'enabled' : 'disabled'}`
    );
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="border-blue-400/30 text-blue-300 hover:bg-blue-400/10"
      aria-label="Open accessibility settings"
    >
      <Accessibility className="w-4 h-4 mr-2" />
      Accessibility
    </Button>
  );

  const groupedSettings = settingsOptions.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof settingsOptions>);

  return (
    <>
      {/* Skip to content link - hidden until focused */}
      <button
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded"
        onFocus={() => announceToScreenReader('Skip to content link focused')}
      >
        Skip to main content
      </button>

      <Dialog>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        
        <DialogContent 
          className="max-w-2xl bg-gray-900 border-gray-700"
          aria-labelledby="accessibility-settings-title"
          aria-describedby="accessibility-settings-description"
        >
          <DialogHeader>
            <DialogTitle 
              id="accessibility-settings-title"
              className="font-cinzel text-gold-300 flex items-center gap-2"
            >
              <Accessibility className="w-5 h-5" />
              Accessibility Settings
            </DialogTitle>
            <p 
              id="accessibility-settings-description"
              className="text-sm text-muted-foreground font-montserrat"
            >
              Customize your experience for better accessibility and usability
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Status */}
            <Card className="card-elegancia">
              <CardHeader>
                <CardTitle className="text-sm font-montserrat">Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {isKeyboardUser && (
                    <Badge variant="secondary" className="text-xs">
                      <Keyboard className="w-3 h-3 mr-1" />
                      Keyboard User Detected
                    </Badge>
                  )}
                  
                  {settings.reduceMotion && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Reduced Motion
                    </Badge>
                  )}
                  
                  {settings.highContrast && (
                    <Badge variant="secondary" className="text-xs">
                      <Contrast className="w-3 h-3 mr-1" />
                      High Contrast
                    </Badge>
                  )}
                  
                  {settings.screenReaderMode && (
                    <Badge variant="secondary" className="text-xs">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Screen Reader Mode
                    </Badge>
                  )}
                  
                  {Object.values(settings).every(v => !v) && (
                    <Badge variant="outline" className="text-xs">
                      Default Settings
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings by Category */}
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <Card key={category} className="card-elegancia">
                <CardHeader>
                  <CardTitle className="text-sm font-montserrat">{category} Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div 
                      key={setting.id}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <setting.icon className="w-5 h-5 mt-0.5 text-blue-400" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={setting.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {setting.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      
                      <Switch
                        id={setting.id}
                        checked={setting.value}
                        onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                        aria-describedby={`${setting.id}-description`}
                        className="shrink-0"
                      />
                      
                      <div 
                        id={`${setting.id}-description`}
                        className="sr-only"
                      >
                        {setting.description}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Quick Actions */}
            <Card className="card-elegancia">
              <CardHeader>
                <CardTitle className="text-sm font-montserrat">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={skipToContent}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  aria-label="Skip to main content area"
                >
                  <MousePointer className="w-4 h-4 mr-2" />
                  Skip to Main Content
                </Button>
                
                <Button
                  onClick={() => {
                    // Reset all settings to defaults
                    Object.keys(settings).forEach(key => {
                      updateSetting(key as keyof typeof settings, false);
                    });
                    updateSetting('keyboardNavigation', true);
                    updateSetting('focusVisible', true);
                    announceToScreenReader('All accessibility settings reset to defaults');
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  aria-label="Reset all accessibility settings to default values"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Information */}
            <div className="text-xs text-muted-foreground bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Keyboard Shortcuts:</h4>
              <ul className="space-y-1" role="list">
                <li><kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Tab</kbd> - Navigate between elements</li>
                <li><kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Enter/Space</kbd> - Activate buttons and links</li>
                <li><kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> - Close dialogs and menus</li>
                <li><kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Arrow Keys</kbd> - Navigate within components</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessibilitySettings;