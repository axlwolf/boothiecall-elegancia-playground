import { useState } from 'react';
import Landing from './Landing';
import LayoutSelection from './LayoutSelection';
import CameraCapture from './CameraCapture';
import FilterSelection from './FilterSelection';
import FinalResult from './FinalResult';

type Step = 'landing' | 'layout' | 'capture' | 'filters' | 'result';

interface Layout {
  id: string;
  name: string;
  shots: number;
}

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

const Photobooth = () => {
  const [step, setStep] = useState<Step>('landing');
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const handleStart = () => {
    setStep('layout');
  };

  const handleLayoutSelect = (layout: Layout) => {
    setSelectedLayout(layout);
    setStep('capture');
  };

  const handlePhotosComplete = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setStep('filters');
  };

  const handleFiltersComplete = () => {
    setStep('result');
  };

  const handleBackToLanding = () => {
    setStep('landing');
    setSelectedLayout(null);
    setCapturedPhotos([]);
  };

  const handleBackToLayout = () => {
    setStep('layout');
    setCapturedPhotos([]);
  };

  const handleBackToCapture = () => {
    setStep('capture');
  };

  switch (step) {
    case 'landing':
      return <Landing onStart={handleStart} />;
    
    case 'layout':
      return (
        <LayoutSelection
          onSelectLayout={handleLayoutSelect}
          onBack={handleBackToLanding}
        />
      );
    
    case 'capture':
      return selectedLayout ? (
        <CameraCapture
          layout={selectedLayout}
          onComplete={handlePhotosComplete}
          onBack={handleBackToLayout}
        />
      ) : null;
    
    case 'filters':
      return selectedLayout && capturedPhotos.length > 0 ? (
        <FilterSelection
          layout={selectedLayout}
          photos={capturedPhotos}
          onComplete={handleFiltersComplete}
          onBack={handleBackToCapture}
        />
      ) : null;
    
    case 'result':
      return selectedLayout && capturedPhotos.length > 0 ? (
        <FinalResult
          layout={selectedLayout}
          photos={capturedPhotos}
          onStartOver={handleBackToLanding}
          onBack={() => setStep('filters')}
        />
      ) : null;
    
    default:
      return <Landing onStart={handleStart} />;
  }
};

export default Photobooth;