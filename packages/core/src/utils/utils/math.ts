/**
 * Math utilities
 */

import type { Point } from '../types'
import { memoize } from './performance'

// Trigonometric lookup tables for performance
const SIN_TABLE_SIZE = 360
const sinTable = new Float32Array(SIN_TABLE_SIZE)
const cosTable = new Float32Array(SIN_TABLE_SIZE)

// Populate lookup tables
for (let i = 0; i < SIN_TABLE_SIZE; i++) {
  const radians = (i * Math.PI) / 180
  sinTable[i] = Math.sin(radians)
  cosTable[i] = Math.cos(radians)
}

/**
 * Fast sine using lookup table (for integer degrees 0-359)
 */
export function fastSin(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.floor(normalized)
  return sinTable[index]
}

/**
 * Fast cosine using lookup table (for integer degrees 0-359)
 */
export function fastCos(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.floor(normalized)
  return cosTable[index]
}

/**
 * Clamp a number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

/**
 * Get the distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Get the angle between two points
 */
export function getAngle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Rotate a point around a center
 */
export function rotatePoint(
  point: Point,
  center: Point,
  angle: number,
): Point {
  const radians = toRadians(angle)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)

  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}

/**
 * Get aspect ratio from width and height
 */
export const getAspectRatio = memoize(
  (width: number, height: number): number => {
    return width / height
  },
  (w, h) => `${w}:${h}`,
)

/**
 * Round a number to a specific number of decimal places
 */
export function round(num: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(num * factor) / factor
}

/**
 * Check if a number is between two values
 */
export function isBetween(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Calculate the scale to fit a rectangle inside another
 */
export function getScaleToFit(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): number {
  return Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight)
}

/**
 * Calculate the scale to cover a rectangle
 */
export function getScaleToCover(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): number {
  return Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
}
