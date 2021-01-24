import { ShapeConfig } from 'konva/types/Shape'

export interface AnnotationShape {
  id: string
  coordinates: number[][]
  crop?: string
  [key: string]: any
  config?: ShapeConfig
}

export type Orientation = 0 | 90 | 180 | 270

export type Options = {
  backgroundColor?: string
  zoom?: {
    modifier: number
    max: number
    defaultZoom: number
  }
  shapeConfig?: ShapeConfig
}

export type ImageBoundingBox = {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

export type PointerPosition = {
  x: number
  y: number
}

declare function getImagesFromPDF(file: string): Promise<string[]>
