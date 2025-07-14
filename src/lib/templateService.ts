import { Template, TemplatesByLayout } from '@/types/templates';

// Template cache for performance
const templateCache: TemplatesByLayout = {};

/**
 * Load templates for a specific layout type
 */
export const loadTemplatesByLayout = async (layoutType: string): Promise<Template[]> => {
  // Return cached templates if available
  if (templateCache[layoutType]) {
    return templateCache[layoutType];
  }

  try {
    // Import template JSON file dynamically
    const templatesModule = await import(`@/assets/designs/${layoutType}/templates.json`);
    const templates: Template[] = templatesModule.default;
    
    // Cache the templates
    templateCache[layoutType] = templates.filter(template => template.isActive);
    
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
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '/placeholder.svg';
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Scale factor for preview
  const scaleX = canvasWidth / 400;
  const scaleY = canvasHeight / (template.layoutType === '1shot' ? 600 : 650);
  
  // Background
  ctx.fillStyle = template.styling.backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Border
  ctx.strokeStyle = template.styling.borderColor;
  ctx.lineWidth = Math.max(1, template.styling.borderWidth * scaleX);
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
  
  // Draw frame placeholders
  template.frameMapping.forEach(frame => {
    const x = frame.x * scaleX;
    const y = frame.y * scaleY;
    const width = frame.width * scaleX;
    const height = frame.height * scaleY;
    
    // Frame background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, width, height);
    
    // Frame border
    ctx.strokeStyle = template.styling.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  });
  
  return canvas.toDataURL('image/png');
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