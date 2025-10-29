/**
 * Worker types and interfaces
 */

export type WorkerMessageType
  = | 'applyFilter'
    | 'applyFilterBatch'
    | 'processImage'
    | 'resizeImage'
    | 'rotateImage'
    | 'cropImage'
    | 'generateThumbnail'
    | 'analyzeImage'
    | 'detectFaces'
    | 'suggestComposition'

export interface WorkerMessage<T = any> {
  id: string
  type: WorkerMessageType
  data: T
}

export interface WorkerResponse<T = any> {
  id: string
  success: boolean
  data?: T
  error?: string
  progress?: number
}

export interface FilterWorkerData {
  imageData: ImageData
  filterName: string
  filterOptions: any
}

export interface BatchFilterWorkerData {
  images: ImageData[]
  filterName: string
  filterOptions: any
}

export interface ResizeWorkerData {
  imageData: ImageData
  width: number
  height: number
  quality?: number
  algorithm?: 'bilinear' | 'bicubic' | 'lanczos'
}

export interface RotateWorkerData {
  imageData: ImageData
  angle: number
  fillColor?: string
}

export interface CropWorkerData {
  imageData: ImageData
  x: number
  y: number
  width: number
  height: number
}

export interface ThumbnailWorkerData {
  imageData: ImageData
  width: number
  height: number
  quality?: number
}

export interface ImageAnalysisResult {
  brightness: number
  contrast: number
  saturation: number
  dominantColors: string[]
  histogram: {
    red: number[]
    green: number[]
    blue: number[]
  }
  hasTransparency: boolean
}

export interface FaceDetectionResult {
  faces: Array<{
    x: number
    y: number
    width: number
    height: number
    confidence: number
  }>
}

export interface CompositionSuggestion {
  type: 'rule-of-thirds' | 'golden-ratio' | 'center' | 'diagonal'
  cropBox: {
    x: number
    y: number
    width: number
    height: number
  }
  score: number
  description: string
}
