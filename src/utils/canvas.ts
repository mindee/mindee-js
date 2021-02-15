import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'
import { mapPolygonToImage } from './image'
import konva from 'konva'

import { DEFAULT_OPTIONS, KONVA_REFS } from '../common/constants'
import { AnnotationShape, Options } from 'common'
import { Line } from 'konva/types/shapes/Line'

export const mapShapesToPolygons = (
  stage: Stage,
  shapes: AnnotationShape[],
  imageBoundingBox,
  { onClick, onMouseEnter, onMouseLeave }: any,
  options: Options = DEFAULT_OPTIONS
): Line[] => {
  clearDeprecatedShapes(stage, shapes)
  return shapes.reduce((accumulator: Line[], shape: AnnotationShape) => {
    let polygon: Line | null = stage.findOne(`#${shape.id}`)
    let shapeConfig = options.shapeConfig
    if (shape.config) {
      shapeConfig = {
        ...shapeConfig,
        ...shape.config,
      }
    }
    if (polygon) {
      polygon.setAttrs({
        ...polygon.getAttrs(),
        points: mapCoordinatesToPoints(shape.coordinates, imageBoundingBox),
        ...shapeConfig,
        shape,
      })
      return accumulator
    }
    polygon = new konva.Line({
      id: shape.id,
      name: KONVA_REFS.shape,
      points: mapCoordinatesToPoints(shape.coordinates, imageBoundingBox),
      closed: true,
      ...shapeConfig,
      shape,
    })
    const shapesLayer: Layer | null = stage.findOne(
      `#${KONVA_REFS.shapesLayer}`
    )
    polygon.on('mousedown', async (event) => {
      event.cancelBubble = true
      stage.container().style.cursor = 'move'
      if (onClick) {
        const shape = await mapPolygonToShape(polygon)
        onClick(shape)
      }
    })
    polygon.on('mouseup', async () => {
      stage.container().style.cursor = 'pointer'
    })
    polygon.on('mouseenter', async function (event) {
      shapesLayer && shapesLayer.batchDraw()
      event.cancelBubble = true
      stage.container().style.cursor = 'pointer'
      if (onMouseEnter) {
        const shape = await mapPolygonToShape(polygon)
        onMouseEnter(shape)
      }
    })
    polygon.on('mouseleave', async function (event) {
      shapesLayer && shapesLayer.batchDraw()
      event.cancelBubble = true
      stage.container().style.cursor = 'default'
      if (onMouseLeave) {
        const shape = await mapPolygonToShape(polygon)
        onMouseLeave(shape)
      }
    })
    accumulator.push(polygon)
    return accumulator
  }, [])
}

export const clearDeprecatedShapes = (
  stage: Stage,
  shapes: AnnotationShape[]
) => {
  const polygons: any = stage.find(`.${KONVA_REFS.shape}`) || []
  polygons.forEach((polygon: Line) => {
    if (shapes.every((shape: AnnotationShape) => shape.id !== polygon.id())) {
      polygon.destroy()
    }
  })
}

export const mapPolygonToShapes = (polygons: Line[]): AnnotationShape[] =>
  polygons.map((polygon: Line) => ({
    ...polygon.attrs.shape,
  }))

export const scalePointToImage = (point, imageBoundingBox) => {
  const { width, height, scale } = imageBoundingBox
  return {
    x: (point.x * width) / scale,
    y: (point.y * height) / scale,
  }
}

const mapCoordinatesToPoints = (
  coordinates: number[][],
  imageBoundingBox
): number[] =>
  coordinates.reduce((accumulator, element) => {
    const { x, y } = scalePointToImage(
      { x: element[0], y: element[1] },
      imageBoundingBox
    )
    accumulator = accumulator.concat([x, y])
    return accumulator
  }, [])

const mapPolygonToShape = async (polygon: Line) => {
  try {
    const crop = await mapPolygonToImage(polygon)
    polygon.setAttr('crop', crop)
    const shape = polygon.getAttr('shape')
    return {
      ...shape,
      crop,
    }
  } catch (error) {
    console.error(error)
  }
}
