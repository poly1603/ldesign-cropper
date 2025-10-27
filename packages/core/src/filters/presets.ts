/**
 * Filter Presets
 * Instagram-style and other popular filter presets
 */

import type { FilterEngine } from './FilterEngine'

export interface FilterPreset {
  name: string
  description: string
  filters: Array<{
    name: string
    options: Record<string, any>
  }>
}

/**
 * Valencia preset - warm, faded
 */
export const valenciaPreset: FilterPreset = {
  name: 'Valencia',
  description: 'Warm, faded look with increased exposure',
  filters: [
    { name: 'exposure', options: { exposure: 8 } },
    { name: 'contrast', options: { contrast: 8 } },
    { name: 'saturation', options: { saturation: -10 } },
    { name: 'temperature', options: { temperature: 15 } }
  ]
}

/**
 * Nashville preset - warm vintage
 */
export const nashvillePreset: FilterPreset = {
  name: 'Nashville',
  description: 'Warm vintage look',
  filters: [
    { name: 'temperature', options: { temperature: 30 } },
    { name: 'contrast', options: { contrast: -10 } },
    { name: 'saturation', options: { saturation: -20 } },
    { name: 'sepia', options: { intensity: 0.2 } }
  ]
}

/**
 * Lomo preset - high contrast, vignette
 */
export const lomoPreset: FilterPreset = {
  name: 'Lomo',
  description: 'High contrast with dark edges',
  filters: [
    { name: 'contrast', options: { contrast: 50 } },
    { name: 'saturation', options: { saturation: 30 } },
    { name: 'vignette', options: { strength: 0.7 } }
  ]
}

/**
 * Toaster preset - dark borders, warm center
 */
export const toasterPreset: FilterPreset = {
  name: 'Toaster',
  description: 'Dark borders with warm center',
  filters: [
    { name: 'contrast', options: { contrast: 50 } },
    { name: 'brightness', options: { brightness: 10 } },
    { name: 'vignette', options: { strength: 0.6 } },
    { name: 'temperature', options: { temperature: 20 } }
  ]
}

/**
 * Walden preset - increased exposure and warmth
 */
export const waldenPreset: FilterPreset = {
  name: 'Walden',
  description: 'Increased exposure and golden warmth',
  filters: [
    { name: 'exposure', options: { exposure: 10 } },
    { name: 'hue', options: { hue: 20 } },
    { name: 'saturation', options: { saturation: 60 } }
  ]
}

/**
 * Earlybird preset - vintage morning light
 */
export const earlybirdPreset: FilterPreset = {
  name: 'Earlybird',
  description: 'Vintage morning light',
  filters: [
    { name: 'sepia', options: { intensity: 0.2 } },
    { name: 'contrast', options: { contrast: -10 } },
    { name: 'temperature', options: { temperature: 30 } },
    { name: 'vignette', options: { strength: 0.5 } }
  ]
}

/**
 * Mayfair preset - warm center, subtle vignette
 */
export const mayfairPreset: FilterPreset = {
  name: 'Mayfair',
  description: 'Warm center with subtle vignette',
  filters: [
    { name: 'contrast', options: { contrast: 10 } },
    { name: 'saturation', options: { saturation: 10 } },
    { name: 'vignette', options: { strength: 0.3 } },
    { name: 'temperature', options: { temperature: 10 } }
  ]
}

/**
 * Amaro preset - bright, slightly cool
 */
export const amaroPreset: FilterPreset = {
  name: 'Amaro',
  description: 'Brightened with cool undertones',
  filters: [
    { name: 'brightness', options: { brightness: 10 } },
    { name: 'saturation', options: { saturation: 20 } },
    { name: 'temperature', options: { temperature: -10 } },
    { name: 'vignette', options: { strength: 0.2 } }
  ]
}

/**
 * Gingham preset - soft, desaturated
 */
export const ginghamPreset: FilterPreset = {
  name: 'Gingham',
  description: 'Soft and desaturated',
  filters: [
    { name: 'brightness', options: { brightness: 5 } },
    { name: 'saturation', options: { saturation: -30 } },
    { name: 'hue', options: { hue: -10 } }
  ]
}

/**
 * Clarendon preset - bright, high contrast
 */
export const clarendonPreset: FilterPreset = {
  name: 'Clarendon',
  description: 'Bright colors with high contrast',
  filters: [
    { name: 'brightness', options: { brightness: 10 } },
    { name: 'contrast', options: { contrast: 20 } },
    { name: 'saturation', options: { saturation: 35 } }
  ]
}

/**
 * Black & White preset
 */
export const blackAndWhitePreset: FilterPreset = {
  name: 'Black & White',
  description: 'Classic monochrome',
  filters: [
    { name: 'grayscale', options: { intensity: 1 } },
    { name: 'contrast', options: { contrast: 10 } }
  ]
}

/**
 * Vintage preset
 */
export const vintagePreset: FilterPreset = {
  name: 'Vintage',
  description: 'Classic vintage look',
  filters: [
    { name: 'sepia', options: { intensity: 0.4 } },
    { name: 'contrast', options: { contrast: -15 } },
    { name: 'brightness', options: { brightness: -5 } },
    { name: 'vignette', options: { strength: 0.4 } },
    { name: 'noise', options: { amount: 5 } }
  ]
}

/**
 * Dramatic preset
 */
export const dramaticPreset: FilterPreset = {
  name: 'Dramatic',
  description: 'High contrast and saturation',
  filters: [
    { name: 'contrast', options: { contrast: 40 } },
    { name: 'saturation', options: { saturation: 25 } },
    { name: 'brightness', options: { brightness: -10 } },
    { name: 'vignette', options: { strength: 0.6 } }
  ]
}

/**
 * Cool preset
 */
export const coolPreset: FilterPreset = {
  name: 'Cool',
  description: 'Cool blue tones',
  filters: [
    { name: 'temperature', options: { temperature: -40 } },
    { name: 'saturation', options: { saturation: 10 } },
    { name: 'brightness', options: { brightness: 5 } }
  ]
}

/**
 * Warm preset
 */
export const warmPreset: FilterPreset = {
  name: 'Warm',
  description: 'Warm golden tones',
  filters: [
    { name: 'temperature', options: { temperature: 40 } },
    { name: 'saturation', options: { saturation: 10 } },
    { name: 'brightness', options: { brightness: 5 } }
  ]
}

/**
 * Faded preset
 */
export const fadedPreset: FilterPreset = {
  name: 'Faded',
  description: 'Soft, faded look',
  filters: [
    { name: 'contrast', options: { contrast: -25 } },
    { name: 'saturation', options: { saturation: -15 } },
    { name: 'brightness', options: { brightness: 10 } }
  ]
}

/**
 * Vivid preset
 */
export const vividPreset: FilterPreset = {
  name: 'Vivid',
  description: 'Vibrant, saturated colors',
  filters: [
    { name: 'saturation', options: { saturation: 50 } },
    { name: 'contrast', options: { contrast: 15 } }
  ]
}

/**
 * Get all presets
 */
export function getAllPresets(): FilterPreset[] {
  return [
    valenciaPreset,
    nashvillePreset,
    lomoPreset,
    toasterPreset,
    waldenPreset,
    earlybirdPreset,
    mayfairPreset,
    amaroPreset,
    ginghamPreset,
    clarendonPreset,
    blackAndWhitePreset,
    vintagePreset,
    dramaticPreset,
    coolPreset,
    warmPreset,
    fadedPreset,
    vividPreset
  ]
}

/**
 * Apply a preset to a filter engine
 */
export function applyPreset(
  filterEngine: FilterEngine,
  preset: FilterPreset
): boolean {
  filterEngine.clearFilters()

  for (const filterConfig of preset.filters) {
    const success = filterEngine.addFilterLayer(
      filterConfig.name,
      filterConfig.options
    )
    if (!success) {
      console.warn(
        `Failed to apply filter "${filterConfig.name}" from preset "${preset.name}"`
      )
      return false
    }
  }

  return true
}

/**
 * Get preset by name
 */
export function getPresetByName(name: string): FilterPreset | undefined {
  return getAllPresets().find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )
}

