import { Template, TemplatesByLayout } from '@/types/templates';

// Template cache for performance
const templateCache: TemplatesByLayout = {};

// Template data based on actual files in public/designs/
const templateData: Record<string, Array<{id: string, name: string, description: string}>> = {
  '1shot': [
    { id: '1shot-design1', name: 'Classic Portrait', description: 'Elegant single frame design' },
    { id: '1shot-design2', name: 'Modern Single', description: 'Contemporary portrait layout' },
    { id: '1shot-design3', name: 'Artistic Frame', description: 'Creative single shot design' },
    { id: '1shot-design4', name: 'Professional', description: 'Business-style portrait' },
    { id: '1shot-design5', name: 'Vintage Style', description: 'Retro-inspired single frame' },
    { id: '1shot-design6', name: 'Minimalist', description: 'Clean and simple design' },
    { id: '1shot-design7', name: 'Bold Frame', description: 'Strong geometric borders' },
    { id: '1shot-design8', name: 'Elegant Gold', description: 'Luxury gold accented frame' },
    { id: '1shot-design9', name: 'Classic Round', description: 'Traditional circular frame' },
    { id: '1shot-design10', name: 'Modern Edge', description: 'Contemporary angular design' }
  ],
  '3shot': [
    { id: '3shot-design1', name: 'Triple Classic', description: 'Traditional three-frame strip' },
    { id: '3shot-design2', name: 'Modern Triple', description: 'Contemporary three-shot layout' },
    { id: '3shot-design3', name: 'Artistic Trio', description: 'Creative three-frame design' },
    { id: '3shot-design4', name: 'Elegant Strip', description: 'Sophisticated three-shot' },
    { id: '3shot-design5', name: 'Fun Frames', description: 'Playful three-frame layout' }
  ],
  '4shot': [
    { id: '4shot-design1', name: 'Quad Classic', description: 'Traditional four-frame strip' },
    { id: '4shot-design2', name: 'Modern Quad', description: 'Contemporary four-shot layout' },
    { id: '4shot-design3', name: 'Story Strip', description: 'Narrative four-frame design' },
    { id: '4shot-design4', name: 'Timeline', description: 'Sequential four-shot layout' },
    { id: '4shot-design5', name: 'Gallery View', description: 'Artistic four-frame display' }
  ],
  '6shot': [
    { id: '6shot-design1', name: 'Gallery Grid', description: 'Classic 2x3 photo grid' },
    { id: '6shot-design2', name: 'Memory Wall', description: 'Collage-style six-shot' },
    { id: '6shot-design3', name: 'Photo Matrix', description: 'Modern grid layout' }
  ]
};

/**
 * Load templates for a specific layout type
 */
export const loadTemplatesByLayout = async (layoutType: string): Promise<Template[]> => {
  // Return cached templates if available
  if (templateCache[layoutType]) {
    return templateCache[layoutType];
  }

  try {
    const layoutTemplates = templateData[layoutType] || [];
    const templates: Template[] = layoutTemplates.map(templateInfo => createTemplateFromDesign(templateInfo, layoutType));
    
    // Cache the templates
    templateCache[layoutType] = templates;
    
    return templateCache[layoutType];
  } catch (error) {
    console.error(`Failed to load templates for layout ${layoutType}:`, error);
    
    // Return fallback template
    return [createFallbackTemplate(layoutType)];
  }
};

/**
 * Get a specific template by ID
 */
export const getTemplateById = async (templateId: string, layoutType: string): Promise<Template | null> => {
  const templates = await loadTemplatesByLayout(layoutType);
  return templates.find(template => template.id === templateId) || null;
};

/**
 * Create a template from design data
 */
const createTemplateFromDesign = (templateInfo: {id: string, name: string, description: string}, layoutType: string): Template => {
  const shotCount = parseInt(layoutType.replace('shot', ''));
  
  // Get frame mapping from frameMappings.ts data
  const getFrameMapping = () => {
    switch (shotCount) {
      case 1:
        return [{ x: 50, y: 50, width: 300, height: 450, borderRadius: 10 }];
      case 3:
        return [
          { x: 50, y: 50, width: 300, height: 150, borderRadius: 5 },
          { x: 50, y: 250, width: 300, height: 150, borderRadius: 5 },
          { x: 50, y: 450, width: 300, height: 150, borderRadius: 5 }
        ];
      case 4:
        return [
          { x: 50, y: 50, width: 300, height: 120, borderRadius: 5 },
          { x: 50, y: 200, width: 300, height: 120, borderRadius: 5 },
          { x: 50, y: 350, width: 300, height: 120, borderRadius: 5 },
          { x: 50, y: 500, width: 300, height: 120, borderRadius: 5 }
        ];
      case 6:
        return [
          { x: 20, y: 20, width: 160, height: 120, borderRadius: 5 },
          { x: 220, y: 20, width: 160, height: 120, borderRadius: 5 },
          { x: 20, y: 170, width: 160, height: 120, borderRadius: 5 },
          { x: 220, y: 170, width: 160, height: 120, borderRadius: 5 },
          { x: 20, y: 320, width: 160, height: 120, borderRadius: 5 },
          { x: 220, y: 320, width: 160, height: 120, borderRadius: 5 }
        ];
      default:
        return [{ x: 50, y: 50, width: 300, height: 450, borderRadius: 10 }];
    }
  };

  return {
    id: templateInfo.id,
    name: templateInfo.name,
    layoutType,
    description: templateInfo.description,
    frameMapping: getFrameMapping(),
    styling: {
      backgroundColor: '#1a1a2e',
      borderColor: '#D8AE48',
      borderWidth: 4,
      titleColor: '#D8AE48',
      subtitleColor: '#D8AE48',
      titleFont: 'bold 24px Cinzel',
      subtitleFont: '14px Montserrat'
    },
    assets: {
      previewImage: `/designs/${templateInfo.id}.png`
    },
    isActive: true
  };
};

/**
 * Create a fallback template when loading fails
 */
const createFallbackTemplate = (layoutType: string): Template => {
  const shotCount = parseInt(layoutType.replace('shot', ''));
  const frameHeight = shotCount === 1 ? 400 : 120;
  const frameWidth = shotCount === 1 ? 350 : 120;
  
  const frameMapping = Array.from({ length: shotCount }, (_, index) => ({
    x: shotCount === 1 ? 25 : 140,
    y: shotCount === 1 ? 100 : 80 + (index * 130),
    width: frameWidth,
    height: frameHeight,
    borderRadius: 8
  }));

  return {
    id: `${layoutType}-fallback`,
    name: 'Classic Design',
    layoutType,
    description: 'Default template design',
    frameMapping,
    styling: {
      backgroundColor: '#1a1a2e',
      borderColor: '#D8AE48',
      borderWidth: 4,
      titleColor: '#D8AE48',
      subtitleColor: '#D8AE48',
      titleFont: 'bold 24px Cinzel',
      subtitleFont: '14px Montserrat'
    },
    assets: {
      previewImage: '/placeholder.svg'
    },
    isActive: true
  };
};

/**
 * Generate canvas preview for template
 */
export const generateTemplatePreview = (template: Template, canvasWidth: number = 120, canvasHeight: number = 160): string => {
  // Return the actual template image path
  return template.assets.previewImage;
};

/**
 * Get all templates for multiple layouts
 */
export const loadAllTemplates = async (): Promise<TemplatesByLayout> => {
  const layouts = ['1shot', '3shot', '4shot', '6shot'];
  const allTemplates: TemplatesByLayout = {};
  
  await Promise.all(
    layouts.map(async (layout) => {
      allTemplates[layout] = await loadTemplatesByLayout(layout);
    })
  );
  
  return allTemplates;
};