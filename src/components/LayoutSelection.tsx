import { useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/types/layout';

interface LayoutSelectionProps {
  onSelectLayout: (layout: Layout) => void;
  onBack: () => void;
}

const LayoutSelection = ({ onSelectLayout, onBack }: LayoutSelectionProps) => {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);

  const layouts: Layout[] = [
    {
      id: '1shot',
      name: 'Classic Single',
      shots: 1,
      description: 'Perfect for portraits and headshots',
      preview: '1shot'
    },
    {
      id: '3shot',
      name: 'Triple Strip',
      shots: 3,
      description: 'Classic photobooth experience',
      preview: '3shot'
    },
    {
      id: '4shot',
      name: 'Quad Layout',
      shots: 4,
      description: 'Tell your story in four frames',
      preview: '4shot'
    },
    {
      id: '6shot',
      name: 'Gallery Grid',
      shots: 6,
      description: 'Maximum memories in 2x3 grid',
      preview: '6shot'
    }
  ];

  const handleSelect = (layout: Layout) => {
    setSelectedLayout(layout);
    setTimeout(() => onSelectLayout(layout), 300);
  };

  return (
    <div className="container-elegancia py-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-glow mb-4">
          Choose Your Layout
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat max-w-2xl mx-auto">
          Select the perfect photo strip layout for your session
        </p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 flex-1">
        {layouts.map((layout, index) => (
          <div
            key={layout.id}
            className={`card-elegancia p-8 cursor-pointer transition-all duration-300 animate-scale-in animate-stagger-${index + 1} ${
              selectedLayout?.id === layout.id ? 'border-primary shadow-glow scale-105' : ''
            }`}
            onClick={() => handleSelect(layout)}
          >
            <div className="text-center">
              {/* Layout Preview */}
              <div className="w-24 h-32 mx-auto mb-6 bg-gradient-card rounded-lg flex flex-col items-center justify-center border border-gold-400/30 p-2">
                {layout.id === '1shot' && (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                )}
                {layout.id === '3shot' && (
                  <div className="flex flex-col items-center justify-center gap-2 h-full">
                    <Camera className="w-6 h-6 text-primary" />
                    <Camera className="w-6 h-6 text-primary" />
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                )}
                {layout.id === '4shot' && (
                  <div className="flex flex-col items-center justify-center gap-1 h-full">
                    <Camera className="w-5 h-5 text-primary" />
                    <Camera className="w-5 h-5 text-primary" />
                    <Camera className="w-5 h-5 text-primary" />
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                )}
                {layout.id === '6shot' && (
                  <div className="flex flex-col items-center justify-center gap-1 h-full">
                    <div className="flex gap-1">
                      <Camera className="w-4 h-4 text-primary" />
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Camera className="w-4 h-4 text-primary" />
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Camera className="w-4 h-4 text-primary" />
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>

              {/* Layout Info */}
              <h3 className="font-cinzel font-semibold text-xl text-foreground mb-2">
                {layout.name}
              </h3>
              <p className="text-sm text-muted-foreground font-montserrat mb-4">
                {layout.description}
              </p>
              
              {/* Shots Count */}
              <div className="flex items-center justify-center text-primary">
                <Camera className="w-4 h-4 mr-2" />
                <span className="font-montserrat font-medium">
                  {layout.shots} {layout.shots === 1 ? 'Shot' : 'Shots'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8 py-4 border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
        >
          Back to Home
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-montserrat">
            Select a layout to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default LayoutSelection;