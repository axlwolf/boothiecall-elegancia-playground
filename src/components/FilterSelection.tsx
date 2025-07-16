import { useState, useEffect } from 'react';
import { Check, ArrowRight, Image as ImageIcon, Palette, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Layout, CapturedPhoto } from '@/types/layout';
import { enhancedFilters, FilterCategory, EnhancedFilter } from '@/types/filters';
import { FilterEngine } from '@/lib/filterEngine';

interface FilterSelectionProps {
  layout: Layout;
  photos: CapturedPhoto[];
  onComplete: () => void;
  onBack: () => void;
  onEditPhoto?: (photoIndex: number) => void;
}

const FilterSelection = ({ layout, photos, onComplete, onBack, onEditPhoto }: FilterSelectionProps) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [photoId: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('basic');
  const [beforeAfterMode, setBeforeAfterMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const filterEngine = FilterEngine.getInstance();
  
  // Group filters by category
  const filtersByCategory = enhancedFilters.reduce((acc, filter) => {
    if (!acc[filter.category]) {
      acc[filter.category] = [];
    }
    acc[filter.category].push(filter);
    return acc;
  }, {} as Record<FilterCategory, EnhancedFilter[]>);
  
  const currentFilters = filtersByCategory[selectedCategory] || [];

  const filtersPerPage = 8;
  const totalPages = Math.ceil(currentFilters.length / filtersPerPage);
  const pageFilters = currentFilters.slice(
    currentPage * filtersPerPage,
    (currentPage + 1) * filtersPerPage
  );
  
  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

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

  const getFilterStyle = (filter: EnhancedFilter) => {
    return filter.cssFilter ? { filter: filter.cssFilter } : {};
  };
  
  const getCategoryIcon = (category: FilterCategory) => {
    switch (category) {
      case 'basic': return '🎯';
      case 'artistic': return '🎨';
      case 'vintage': return '📸';
      case 'creative': return '✨';
      case 'black-white': return '⚫';
      default: return '🎭';
    }
  };
  
  const getCategoryBadgeCount = (category: FilterCategory) => {
    return filtersByCategory[category]?.length || 0;
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

      {/* Filter Categories */}
      <div className="mb-8">
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FilterCategory)}>
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gold-400/20">
            {(Object.keys(filtersByCategory) as FilterCategory[]).map(category => (
              <TabsTrigger 
                key={category}
                value={category}
                className="flex items-center gap-2 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300"
              >
                <span className="text-lg">{getCategoryIcon(category)}</span>
                <div className="hidden sm:flex flex-col">
                  <span className="capitalize font-montserrat text-xs">{category.replace('-', ' ')}</span>
                  <Badge variant="secondary" className="text-xs px-1 h-4">
                    {getCategoryBadgeCount(category)}
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Photo Preview */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-cinzel font-semibold text-xl">
              Photo Preview
            </h3>
            <Button
              onClick={() => setBeforeAfterMode(!beforeAfterMode)}
              variant="outline"
              size="sm"
              className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {beforeAfterMode ? 'Show Filtered' : 'Before/After'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, index) => {
              const selectedFilter = enhancedFilters.find(f => f.id === selectedFilters[photo.id]);
              return (
                <div key={photo.id} className="space-y-2">
                  <div className="photo-frame aspect-square relative overflow-hidden group">
                    {beforeAfterMode && selectedFilter ? (
                      <div className="w-full h-full relative">
                        {/* Before/After split view */}
                        <div className="absolute inset-0 flex">
                          <div className="w-1/2 overflow-hidden">
                            <img
                              src={photo.dataUrl}
                              alt={`Photo ${index + 1} - Original`}
                              className="w-full h-full object-cover"
                              style={{ transform: 'translateX(0)' }}
                            />
                          </div>
                          <div className="w-1/2 overflow-hidden">
                            <img
                              src={photo.dataUrl}
                              alt={`Photo ${index + 1} - Filtered`}
                              className="w-full h-full object-cover"
                              style={{ 
                                ...getFilterStyle(selectedFilter),
                                transform: 'translateX(-100%)'
                              }}
                            />
                          </div>
                        </div>
                        {/* Divider line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gold-400 z-10" />
                        {/* Labels */}
                        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                          Original
                        </div>
                        <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                          {selectedFilter.name}
                        </div>
                      </div>
                    ) : (
                      <img
                        src={photo.dataUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg transition-all duration-300"
                        style={selectedFilter ? getFilterStyle(selectedFilter) : {}}
                      />
                    )}
                    
                    {/* Edit Photo Button - appears on hover */}
                    {onEditPhoto && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          onClick={() => onEditPhoto(index)}
                          variant="outline"
                          size="sm"
                          className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
                        >
                          <Sliders className="w-4 h-4 mr-2" />
                          Edit Photo
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-center text-sm text-muted-foreground font-montserrat">
                    Photo {index + 1} - {selectedFilter?.name || 'Original'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Selection */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-cinzel font-semibold text-xl">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Filters
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
              {pageFilters.slice(0, 4).map(filter => (
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
            {pageFilters.map(filter => (
              <div key={filter.id} className="card-elegancia p-3 cursor-pointer hover:bg-gray-800/50 transition-colors">
                <div className="aspect-square mb-2 bg-gradient-card rounded-lg overflow-hidden">
                  <div
                    className="w-full h-full bg-center bg-cover transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundImage: `url(${photos[0]?.dataUrl})`,
                      ...getFilterStyle(filter)
                    }}
                  />
                </div>
                <div className="text-center mb-2">
                  <p className="text-sm font-montserrat font-medium mb-1">
                    {filter.name}
                  </p>
                  {filter.description && (
                    <p className="text-xs text-muted-foreground">
                      {filter.description}
                    </p>
                  )}
                </div>
                
                {/* Individual Photo Selection */}
                <div className="space-y-1">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => handleFilterSelect(photo.id, filter.id)}
                      className={`w-full text-xs px-2 py-1 rounded transition-colors ${
                        selectedFilters[photo.id] === filter.id
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
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
                Page {currentPage + 1} of {totalPages} • {currentFilters.length} filters in {selectedCategory.replace('-', ' ')}
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
        
        <div className="flex gap-3">
          {onEditPhoto && photos.length > 0 && (
            <Button
              onClick={() => onEditPhoto(0)}
              variant="outline"
              className="border-gold-400/30 text-gold-300 hover:bg-gold-400/10"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Advanced Edit
            </Button>
          )}
          
          <Button
            onClick={onComplete}
            className="btn-elegancia animate-pulse-glow"
          >
            Continue to Design
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSelection;