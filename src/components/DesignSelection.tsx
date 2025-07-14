import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Template } from '@/types/templates';
import { loadTemplatesByLayout, generateTemplatePreview } from '@/lib/templateService';

interface Layout {
  id: string;
  name: string;
  shots: number;
}

interface DesignSelectionProps {
  layout: Layout;
  onSelectDesign: (template: Template) => void;
  onBack: () => void;
}

const DesignSelection = ({ layout, onSelectDesign, onBack }: DesignSelectionProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  
  const templatesPerPage = 6;
  const totalPages = Math.ceil(templates.length / templatesPerPage);
  const currentTemplates = templates.slice(
    currentPage * templatesPerPage,
    (currentPage + 1) * templatesPerPage
  );

  // Load templates for the selected layout
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const layoutTemplates = await loadTemplatesByLayout(layout.id);
        setTemplates(layoutTemplates);
        
        // Generate preview URLs for each template
        const previews: Record<string, string> = {};
        layoutTemplates.forEach(template => {
          previews[template.id] = generateTemplatePreview(template);
        });
        setPreviewUrls(previews);
        
        // Auto-select first template
        if (layoutTemplates.length > 0) {
          setSelectedTemplate(layoutTemplates[0]);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [layout.id]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelectDesign(selectedTemplate);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container-elegancia py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg font-montserrat text-muted-foreground">
            Loading design templates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Choose Your Design
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat mb-4">
          Select a design template for your {layout.name}
        </p>
        <div className="flex items-center justify-center text-primary">
          <Palette className="w-5 h-5 mr-2" />
          <span className="font-montserrat font-medium">
            {templates.length} designs available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Template Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
            {currentTemplates.map((template, index) => (
              <div
                key={template.id}
                className={`card-elegancia p-4 cursor-pointer transition-all duration-300 animate-scale-in ${
                  selectedTemplate?.id === template.id 
                    ? 'border-primary shadow-glow scale-105' 
                    : 'hover:border-gold-400/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-card rounded-lg mb-3 overflow-hidden border border-gold-400/20">
                  {previewUrls[template.id] ? (
                    <img
                      src={previewUrls[template.id]}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Palette className="w-8 h-8" />
                    </div>
                  )}
                </div>
                
                {/* Template Info */}
                <h3 className="font-cinzel font-semibold text-sm text-center mb-1">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground font-montserrat text-center">
                  {template.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                onClick={prevPage}
                disabled={currentPage === 0}
                variant="outline"
                size="sm"
                className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-montserrat text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                variant="outline"
                size="sm"
                className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Selected Template Details */}
        <div className="space-y-6">
          {selectedTemplate && (
            <>
              <div className="card-elegancia p-6">
                <h3 className="font-cinzel font-semibold text-xl mb-4 text-center">
                  Selected Design
                </h3>
                
                <div className="aspect-[3/4] bg-gradient-card rounded-lg mb-4 overflow-hidden border border-primary/30">
                  <img
                    src={previewUrls[selectedTemplate.id]}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h4 className="font-cinzel font-bold text-lg text-primary mb-2">
                  {selectedTemplate.name}
                </h4>
                <p className="text-sm text-muted-foreground font-montserrat mb-4">
                  {selectedTemplate.description}
                </p>
                
                <div className="space-y-2 text-xs font-montserrat">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Layout:</span>
                    <span className="text-foreground">{layout.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Photos:</span>
                    <span className="text-foreground">{layout.shots}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="btn-elegancia w-full animate-pulse-glow"
              >
                Continue with this Design
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
        >
          Back to Layouts
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground font-montserrat">
            {selectedTemplate ? 'Continue when ready' : 'Select a design to continue'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignSelection;