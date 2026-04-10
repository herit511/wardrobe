// Shared utility functions

export const colorMap = [
  { name: 'Black', hex: '#000000' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'Dark Gray', hex: '#333333' },
  { name: 'Charcoal', hex: '#404040' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Light Gray', hex: '#d3d3d3' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Dark Red', hex: '#8b0000' },
  { name: 'Red', hex: '#ff0000' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Navy', hex: '#1B2A4A' }, // Very dark navy
  { name: 'Navy', hex: '#263a57' }, // Slate navy
  { name: 'Dark Blue', hex: '#00008b' },
  { name: 'Blue', hex: '#0000ff' },
  { name: 'Light Blue', hex: '#add8e6' },
  { name: 'Cyan', hex: '#00ffff' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Green', hex: '#008000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Yellow', hex: '#ffff00' },
  { name: 'Orange', hex: '#ffa500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Magenta', hex: '#ff00ff' },
  { name: 'Pink', hex: '#ffc0cb' },
  { name: 'Brown', hex: '#8b4513' },
  { name: 'Brown', hex: '#654321' }, // Dark brown
  { name: 'Brown', hex: '#3E2723' }, // Espresso brown
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Cream', hex: '#fffdd0' }
];

export function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return { r, g, b };
}

export function getColorName(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return hexColor;
  
  const { r, g, b } = hexToRgb(hexColor);
  let closestColor = hexColor;
  let minDistance = Infinity;
  
  for (const color of colorMap) {
    const rgb = hexToRgb(color.hex);
    // Use redmean approximation for better perceptual color distance
    const rmean = (r + rgb.r) / 2;
    const rDist = r - rgb.r;
    const gDist = g - rgb.g;
    const bDist = b - rgb.b;
    
    const weightR = 2 + rmean / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - rmean) / 256;
    
    const distance = weightR * rDist * rDist + weightG * gDist * gDist + weightB * bDist * bDist;
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  }
  return closestColor;
}

export function getOptimizedUrl(url, width = 400) {
  if (!url || !url.includes('cloudinary.com')) return url;
  // If already optimized or has transformations, return as is to avoid breaking
  if (url.includes('/upload/c_') || url.includes('/upload/w_') || url.includes('/upload/q_')) return url;
  
  return url.replace('/upload/', `/upload/q_auto,f_auto,c_fill,w_${width}/`);
}
