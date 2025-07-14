import { useState } from 'react';
import { Check, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout, CapturedPhoto } from '@/types/layout';

interface Filter {
  id: string;
  name: string;
  cssFilter: string;
}

interface FilterSelectionProps {
  layout: Layout;
  photos: CapturedPhoto[];
  onComplete: () => void;
  onBack: () => void;
}

const FilterSelection = ({ layout, photos, onComplete, onBack }: FilterSelectionProps) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [photoId: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(0);

  const filters: Filter[] = [
    { id: 'none', name: 'Original', cssFilter: 'none' },
    { id: 'noir', name: 'Noir', cssFilter: 'grayscale(100%) contrast(120%)' },
    { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(50%) contrast(120%) brightness(110%)' },
    { id: 'glam', name: 'Glam', cssFilter: 'contrast(130%) saturate(130%) brightness(110%)' },
    { id: 'sketch', name: 'Sketch', cssFilter: 'grayscale(100%) contrast(200%) brightness(90%)' },
    { id: 'sharp', name: 'Extra Sharp', cssFilter: 'contrast(150%) brightness(105%)' },
    { id: 'warm', name: 'Warm', cssFilter: 'sepia(20%) contrast(110%) brightness(110%)' },
    { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(120%)' },
    { id: 'faded', name: 'Faded', cssFilter: 'contrast(80%) brightness(120%) saturate(80%)' },
    { id: 'blackwhite', name: 'B&W', cssFilter: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(100%)' },
    { id: 'bright', name: 'Brightness', cssFilter: 'brightness(130%)' },
    { id: 'contrast', name: 'Contrast', cssFilter: 'contrast(150%)' },
    { id: 'blur', name: 'Blur', cssFilter: 'blur(1px)' },
    { id: 'invert', name: 'Invert', cssFilter: 'invert(100%)' }
  ];

  const filtersPerPage = 6;
  const totalPages = Math.ceil(filters.length / filtersPerPage);
  const currentFilters = filters.slice(
    currentPage * filtersPerPage,
    (currentPage + 1) * filtersPerPage
  );

  const handleFilterSelect = (photoId: string, filterId: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [photoId]: filterId
    }));
  };

  const applyFilterToAll = (filterId: string) => {
    const newFilters: { [photoId: string]: string } = {};
    photos.forEach(photo => {
      newFilters[photo.id] = filterId;
    });
    setSelectedFilters(newFilters);
  };

  const getFilterStyle = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    return filter ? { filter: filter.cssFilter } : {};
  };

  return (
    <div className="container-elegancia py-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-glow mb-2">
          Apply Filters
        </h1>
        <p className="text-lg text-muted-foreground font-montserrat">
          Enhance your photos with premium filter effects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Photo Preview */}
        <div className="space-y-6">
          <h3 className="font-cinzel font-semibold text-xl text-center">
            Photo Preview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="space-y-2">
                <div className="photo-frame aspect-square">
                  <img
                    src={photo.dataUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-all duration-300"
                    style={getFilterStyle(selectedFilters[photo.id] || 'none')}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground font-montserrat">
                  Photo {index + 1} - {
                    filters.find(f => f.id === selectedFilters[photo.id])?.name || 'Original'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Selection */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-cinzel font-semibold text-xl">
              Choose Filters
            </h3>
            <div className="flex gap-2">
              {totalPages > 1 && (
                <>
                  <Button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    variant="outline"
                    size="sm"
                    className="border-gold-400/30 text-gold-300"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    variant="outline"
                    size="sm"
                    className="border-gold-400/30 text-gold-300"
                  >
                    Next
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Apply to All Button */}
          <div className="card-elegancia p-4">
            <h4 className="font-montserrat font-semibold mb-3">Quick Apply</h4>
            <div className="grid grid-cols-2 gap-2">
              {currentFilters.slice(0, 4).map(filter => (
                <Button
                  key={filter.id}
                  onClick={() => applyFilterToAll(filter.id)}
                  variant="outline"
                  size="sm"
                  className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                >
                  All: {filter.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {currentFilters.map(filter => (
              <div key={filter.id} className="card-elegancia p-3 cursor-pointer">
                <div className="aspect-square mb-2 bg-gradient-card rounded-lg overflow-hidden">
                  <div
                    className="w-full h-full bg-center bg-cover"
                    style={{
                      backgroundImage: `url(${photos[0]?.dataUrl})`,
                      ...getFilterStyle(filter.id)
                    }}
                  />
                </div>
                <p className="text-center text-sm font-montserrat font-medium">
                  {filter.name}
                </p>
                
                {/* Individual Photo Selection */}
                <div className="mt-2 space-y-1">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => handleFilterSelect(photo.id, filter.id)}
                      className={`w-full text-xs px-2 py-1 rounded transition-colors ${
                        selectedFilters[photo.id] === filter.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {selectedFilters[photo.id] === filter.id && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}
                      Photo {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Page Indicator */}
          {totalPages > 1 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-montserrat">
                Page {currentPage + 1} of {totalPages}
              </p>
            </div>
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
          Back to Photos
        </Button>
        
        <Button
          onClick={onComplete}
          className="btn-elegancia animate-pulse-glow"
        >
          Continue to Design
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FilterSelection;