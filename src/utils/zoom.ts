import { ImageBoundingBox } from '../common'
import { Stage } from 'konva/types/Stage'
import { DEFAULT_OPTIONS } from './../common/constants'

export const handleStageZoom = (
  event,
  stage: Stage,
  imageBoundingBox: ImageBoundingBox,
  options = DEFAULT_OPTIONS.zoom
) => {
  const { x, y, scale } = imageBoundingBox
  event.evt.preventDefault()
  const oldScale = stage.scaleX()
  const stageX = stage.x()
  const stageY = stage.y()
  const { x: pointerX, y: pointerY } = stage.getPointerPosition()

  const mousePointTo = {
    x: (pointerX - stageX) / oldScale,
    y: (pointerY - stageY) / oldScale,
  }
  const { max, modifier, defaultZoom } = options

  const newScale =
    event.evt.deltaY < 0 ? oldScale * modifier : oldScale / modifier
  if (newScale > max) {
    return
  }
  if (newScale / scale <= defaultZoom) {
    stage.draggable(false)
    stage.scale({ x: scale, y: scale })
    stage.position({ x, y })
  } else {
    stage.draggable(true)
    stage.scale({ x: newScale, y: newScale })
    const newPos = {
      x: pointerX - mousePointTo.x * newScale,
      y: pointerY - mousePointTo.y * newScale,
    }
    stage.position(newPos)
  }

  stage.batchDraw()
}

export const handleLensZoom = (
  stage: Stage,
  imageBoundingBox: ImageBoundingBox,
  pointerPosition,
  zoomLevel
) => {
  const { height, width, scale } = imageBoundingBox

  const { x: _x, y: _y } = pointerPosition
  const pointerX = (_x * width) / scale
  const pointerY = (_y * height) / scale
  const newScale = zoomLevel
  stage.scale({ x: newScale, y: newScale })
  const newPos = {
    x: -pointerX * newScale + stage.width() / 2,
    y: -pointerY * newScale + stage.height() / 2,
  }
  stage.position(newPos)

  stage.batchDraw()
}

export const getMousePosition = (
  stage: Stage,
  imageBoundingBox: ImageBoundingBox
) => {
  const { x: pointerX, y: pointerY } = stage.getPointerPosition()
  const oldScale = stage.scaleX()
  const stageX = stage.x()
  const stageY = stage.y()
  return {
    x:
      ((pointerX - stageX) * imageBoundingBox.scale) /
      (oldScale * imageBoundingBox.width),
    y:
      ((pointerY - stageY) * imageBoundingBox.scale) /
      (oldScale * imageBoundingBox.height),
  }
}
