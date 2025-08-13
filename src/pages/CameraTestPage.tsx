import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '@/components/CameraCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, CapturedPhoto } from '@/types/layout';

const CameraTestPage = () => {
  const navigate = useNavigate();
  const [testLayout] = useState<Layout>({
    id: 'test-layout',
    name: 'Test Layout',
    description: 'Layout for camera testing',
    shots: 4,
    preview: '',
    requirements: []
  });

  const handleCameraComplete = (photos: CapturedPhoto[]) => {
    console.log('Photos captured:', photos);
    alert(`Captured ${photos.length} photos successfully!`);
    // Navigate to results page or process photos
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="card-elegancia">
          <CardHeader>
            <CardTitle className="font-cinzel text-2xl text-gold-300">
              Camera Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-muted-foreground font-montserrat mb-4">
                This page tests the camera functionality with a sample layout.
              </p>
              <Button onClick={handleBack} variant="outline" className="mb-4">
                Back to Home
              </Button>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <CameraCapture
                layout={testLayout}
                onComplete={handleCameraComplete}
                onBack={handleBack}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CameraTestPage;
