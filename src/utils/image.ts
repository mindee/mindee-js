import { KONVA_REFS } from './../common/constants'
import { Stage } from 'konva/types/Stage'
import { Line } from 'konva/types/shapes/Line'
export const getImageBoundingBox = (
  { clientWidth, clientHeight },
  imageObj
) => {
  const imageAspectRatio = imageObj.width / imageObj.height
  const canvasAspectRatio = clientWidth / clientHeight
  let renderableHeight, renderableWidth, xStart, yStart

  // Happy path - keep aspect ratio
  xStart = 0
  yStart = 0
  renderableHeight = clientHeight
  renderableWidth = clientWidth

  // If image's aspect ratio is less than canvas's we fit on height
  // and place the image centrally along width
  if (imageAspectRatio < canvasAspectRatio) {
    renderableWidth = imageObj.width * (renderableHeight / imageObj.height)
    xStart = Math.round((clientWidth - renderableWidth) / 2)
  }

  // If image's aspect ratio is greater than canvas's we fit on width
  // and place the image centrally along height
  else if (imageAspectRatio > canvasAspectRatio) {
    renderableHeight = imageObj.height * (renderableWidth / imageObj.width)
    yStart = Math.round((clientHeight - renderableHeight) / 2)
  }

  return {
    scale: Number(Number(renderableWidth / imageObj.width).toFixed(3)),
    x: xStart,
    y: yStart,
    width: Math.round(renderableWidth),
    height: Math.round(renderableHeight),
  }
}

export const toBase64 = (base64: string) => `data:image/jpeg;base64,${base64}`

export const mapPolygonToImage = (polygon: Line) => {
  const stage: Stage = polygon.getStage().clone({})
  const polygons: any = stage.find(`.${KONVA_REFS.shape}`)
  const polygonId = polygon.id()
  polygons.forEach((_polygon: Line) => {
    if (_polygon.id() !== polygonId) _polygon.hide()
  })
  const clientRect = polygon.getClientRect()
  return new Promise((callback) => {
    const crop = polygon.getAttr('crop')
    if (crop) {
      callback(crop)
    }
    stage.toDataURL({
      ...clientRect,
      quality: 1,
      pixelRatio: 3,
      callback,
    })
  })
}
