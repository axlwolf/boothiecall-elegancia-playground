import { useState } from 'react';
import Landing from './Landing';
import LayoutSelection from './LayoutSelection';
import DesignSelection from './DesignSelection';
import CameraCapture from './CameraCapture';
import FilterSelection from './FilterSelection';
import FinalResult from './FinalResult';
import { Layout, CapturedPhoto } from '@/types/layout';
import { Template } from '@/types/templates';

type Step = 'landing' | 'layout' | 'design' | 'capture' | 'filters' | 'result';

const Photobooth = () => {
  const [step, setStep] = useState<Step>('landing');
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const handleStart = () => {
    setStep('layout');
  };

  const handleLayoutSelect = (layout: Layout) => {
    setSelectedLayout(layout);
    setStep('design');
  };

  const handleDesignSelect = (template: Template) => {
    setSelectedTemplate(template);
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
    setSelectedTemplate(null);
    setCapturedPhotos([]);
  };

  const handleBackToLayout = () => {
    setStep('layout');
    setSelectedTemplate(null);
    setCapturedPhotos([]);
  };

  const handleBackToDesign = () => {
    setStep('design');
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
    
    case 'design':
      return selectedLayout ? (
        <DesignSelection
          layout={selectedLayout}
          onSelectDesign={handleDesignSelect}
          onBack={handleBackToLayout}
        />
      ) : null;
    
    case 'capture':
      return selectedLayout ? (
        <CameraCapture
          layout={selectedLayout}
          onComplete={handlePhotosComplete}
          onBack={handleBackToDesign}
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
      return selectedLayout && selectedTemplate && capturedPhotos.length > 0 ? (
        <FinalResult
          layout={selectedLayout}
          template={selectedTemplate}
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