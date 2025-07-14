/**
 * Core image processing utilities using Canvas API and ImageData manipulation
 */

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  hue: number;        // -180 to 180
  exposure: number;   // -2 to 2
  highlights: number; // -100 to 100
  shadows: number;    // -100 to 100
}

export const defaultAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0
};

/**
 * Convert image URL to ImageData for processing
 */
export const imageToImageData = (imageUrl: string): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Convert ImageData back to data URL
 */
export const imageDataToDataUrl = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png', 0.9);
};

/**
 * Apply brightness adjustment to ImageData
 */
export const adjustBrightness = (imageData: ImageData, value: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const adjustment = (value / 100) * 255;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + adjustment));     // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment)); // B
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Apply contrast adjustment to ImageData
 */
export const adjustContrast = (imageData: ImageData, value: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * RGB to HSL conversion
 */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return [h * 360, s * 100, l * 100];
};

/**
 * HSL to RGB conversion
 */
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Apply saturation adjustment to ImageData
 */
export const adjustSaturation = (imageData: ImageData, value: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const saturationFactor = 1 + (value / 100);
  
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newS = Math.max(0, Math.min(100, s * saturationFactor));
    const [r, g, b] = hslToRgb(h, newS, l);
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Apply hue adjustment to ImageData
 */
export const adjustHue = (imageData: ImageData, value: number): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newH = (h + value + 360) % 360;
    const [r, g, b] = hslToRgb(newH, s, l);
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Apply multiple adjustments to ImageData
 */
export const applyAdjustments = (imageData: ImageData, adjustments: ImageAdjustments): ImageData => {
  let result = imageData;
  
  if (adjustments.brightness !== 0) {
    result = adjustBrightness(result, adjustments.brightness);
  }
  
  if (adjustments.contrast !== 0) {
    result = adjustContrast(result, adjustments.contrast);
  }
  
  if (adjustments.saturation !== 0) {
    result = adjustSaturation(result, adjustments.saturation);
  }
  
  if (adjustments.hue !== 0) {
    result = adjustHue(result, adjustments.hue);
  }
  
  return result;
};

/**
 * Convolution kernel for image effects
 */
export const applyConvolution = (imageData: ImageData, kernel: number[], divisor: number = 1): ImageData => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);
  const kernelSize = Math.sqrt(kernel.length);
  const half = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky * kernelSize + kx];
          
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      output[idx] = Math.max(0, Math.min(255, r / divisor));
      output[idx + 1] = Math.max(0, Math.min(255, g / divisor));
      output[idx + 2] = Math.max(0, Math.min(255, b / divisor));
      output[idx + 3] = data[idx + 3]; // Alpha
    }
  }
  
  return new ImageData(output, width, height);
};

// Predefined kernels
export const kernels = {
  sharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
  blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  edgeDetect: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2]
};