import { useState, useRef } from 'react';
import Landing from './Landing';
import LayoutSelection from './LayoutSelection';
import DesignSelection from './DesignSelection';
import CameraCapture from './CameraCapture';
import FilterSelection from './FilterSelection';
import PhotoEditor from './PhotoEditor';
import FinalResult from './FinalResult';
import SessionHistory from './SessionHistory';
import { Layout, CapturedPhoto } from '@/types/layout';
import { Template } from '@/types/templates';
import { PhotoSession } from '@/types/session';
import { HybridStorageService } from '@/lib/hybridStorage';

type Step = 'landing' | 'layout' | 'design' | 'capture' | 'filters' | 'edit' | 'result' | 'history';

const Photobooth = () => {
  const [step, setStep] = useState<Step>('landing');
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [finalGifUrl, setFinalGifUrl] = useState<string>('');
  
  const sessionStorage = HybridStorageService.getInstance();

  const handleStart = () => {
    setSessionStartTime(Date.now());
    setStep('layout');
  };

  const handleShowHistory = () => {
    setStep('history');
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

  const handleSessionComplete = (finalImageDataUrl: string, gifDataUrl?: string) => {
    setFinalImageUrl(finalImageDataUrl);
    if (gifDataUrl) {
      setFinalGifUrl(gifDataUrl);
    }
    
    // Save session to history
    saveCurrentSession(finalImageDataUrl, gifDataUrl);
  };

  const saveCurrentSession = async (finalImageDataUrl: string, gifDataUrl?: string) => {
    if (!selectedLayout || !selectedTemplate) return;

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const filtersUsed = capturedPhotos
      .map(photo => photo.metadata?.filterId)
      .filter(Boolean) as string[];
    const wasEdited = capturedPhotos.some(photo => photo.metadata?.editedAt);

    const session: PhotoSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      layout: {
        id: selectedLayout.id,
        name: selectedLayout.name,
        shots: selectedLayout.shots
      },
      template: {
        id: selectedTemplate.id,
        name: selectedTemplate.name
      },
      photos: capturedPhotos.map(photo => ({
        id: photo.id,
        dataUrl: photo.dataUrl,
        filterId: photo.metadata?.filterId,
        adjustments: photo.metadata?.adjustments
      })),
      finalImageUrl: finalImageDataUrl,
      gifUrl: gifDataUrl,
      createdAt: new Date().toISOString(),
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        duration: sessionDuration,
        filtersUsed,
        wasEdited
      }
    };

    await sessionStorage.saveSession(session);
  };

  const handleReplaySession = (session: PhotoSession) => {
    // Load session data and restart with the same configuration
    setSelectedLayout({
      id: session.layout.id,
      name: session.layout.name,
      shots: session.layout.shots,
      description: '',
      requirements: []
    });
    
    setSelectedTemplate({
      id: session.template.id,
      name: session.template.name,
      layout: session.layout,
      frameMapping: [],
      assets: { background: '', overlay: '', logo: '' },
      description: ''
    });
    
    setSessionStartTime(Date.now());
    setStep('capture');
  };

  const handleOpenPhotoEditor = (photoIndex: number) => {
    setEditingPhotoIndex(photoIndex);
    setStep('edit');
  };

  const handlePhotoEdited = (editedPhoto: CapturedPhoto) => {
    if (editingPhotoIndex !== null) {
      const updatedPhotos = [...capturedPhotos];
      updatedPhotos[editingPhotoIndex] = editedPhoto;
      setCapturedPhotos(updatedPhotos);
    }
    setEditingPhotoIndex(null);
    setStep('filters');
  };

  const handleCancelPhotoEdit = () => {
    setEditingPhotoIndex(null);
    setStep('filters');
  };

  const handleBackToLanding = () => {
    setStep('landing');
    setSelectedLayout(null);
    setSelectedTemplate(null);
    setCapturedPhotos([]);
    setEditingPhotoIndex(null);
    setFinalImageUrl('');
    setFinalGifUrl('');
    setSessionStartTime(Date.now());
  };

  const handleBackToLayout = () => {
    setStep('layout');
    setSelectedTemplate(null);
    setCapturedPhotos([]);
    setEditingPhotoIndex(null);
  };

  const handleBackToDesign = () => {
    setStep('design');
    setCapturedPhotos([]);
    setEditingPhotoIndex(null);
  };

  const handleBackToCapture = () => {
    setStep('capture');
  };

  const handleBackToFilters = () => {
    setStep('filters');
  };

  switch (step) {
    case 'landing':
      return <Landing onStart={handleStart} onShowHistory={handleShowHistory} />;
    
    case 'history':
      return (
        <SessionHistory
          onClose={handleBackToLanding}
          onReplaySession={handleReplaySession}
        />
      );
    
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
          onEditPhoto={handleOpenPhotoEditor}
        />
      ) : null;
    
    case 'edit':
      return editingPhotoIndex !== null && capturedPhotos[editingPhotoIndex] ? (
        <PhotoEditor
          photo={capturedPhotos[editingPhotoIndex]}
          onSave={handlePhotoEdited}
          onCancel={handleCancelPhotoEdit}
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
          onSessionComplete={handleSessionComplete}
        />
      ) : null;
    
    default:
      return <Landing onStart={handleStart} />;
  }
};

export default Photobooth;