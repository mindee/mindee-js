import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'
import { Shape } from 'konva/types/Shape'
import { Image as imageShape } from 'konva/types/shapes/Image'
import {
  LitElement,
  html,
  property,
  customElement,
  internalProperty,
} from 'lit-element'

import {
  mapShapesToPolygons,
  getImageBoundingBox,
  rotateImage,
  handleLensZoom,
} from './../../utils'
import { AnnotationShape, ImageBoundingBox, Options } from '../../common'
//@ts-ignore
import targetIcon from '../../common/assets/target.svg'
import { KONVA_REFS, DEFAULT_OPTIONS } from '../../common/constants'
import { LensStyle } from '../../common/styles'

@customElement('annotation-lens')
export class AnnotationLens extends LitElement {
  private _pointerPosition
  private _image
  private _shapes
  private _zoomLevel
  private stage: Stage
  private container: HTMLElement
  private imageLayer: Layer
  private shapesLayer: Layer
  private imageObject: HTMLImageElement
  private imageShape: imageShape
  private _orientation: number | null
  private _options: Options

  @property({ type: Array })
  get shapes(): AnnotationShape[] {
    return this._shapes
  }
  set shapes(value: AnnotationShape[]) {
    this._shapes = value
    this.loadShapes()
  }

  @property({ type: String })
  get image(): string {
    return this._image
  }
  set image(value: string) {
    this._image = value
    this.loadImage()
  }

  @property({ type: Number })
  get orientation(): number {
    return this._orientation
  }
  set orientation(value: number) {
    this._orientation = value || 0
    this.loadImage()
  }

  @property({ type: Number, attribute: 'zoom-level' })
  get zoomLevel(): number {
    return this._zoomLevel
  }
  set zoomLevel(value: number) {
    this._zoomLevel = value
    this.onPointerPositionChange()
  }

  @property({ type: Object, attribute: 'pointer-position' })
  get pointerPosition(): number {
    return this._pointerPosition
  }
  set pointerPosition(value: number) {
    this._pointerPosition = value || { x: 0, y: 0 }
    this.onPointerPositionChange()
  }

  @property({ type: Object })
  get options(): Options {
    return this._options
  }
  set options(value: Options) {
    this._options = { ...this._options, ...value }
  }

  @internalProperty() imageBoundingBox: ImageBoundingBox
  @internalProperty() polygons: Shape[]

  constructor() {
    super()
    this.stage = null
    this._image = ''
    this._shapes = []
    this._zoomLevel = 2
    this._orientation = 0
    this._options = DEFAULT_OPTIONS
    this._pointerPosition = { x: 0, y: 0 }
    this.imageBoundingBox = null
    this.polygons = []
    this.imageLayer = new Konva.Layer({ id: KONVA_REFS.imageLayer })
    this.shapesLayer = new Konva.Layer({ id: KONVA_REFS.shapesLayer })
    this.imageObject = new Image()
    this.imageShape = new Konva.Image({
      name: KONVA_REFS.imageShape,
      image: this.imageObject,
    })
  }

  firstUpdated() {
    this.container = this.shadowRoot.getElementById('container')
    this.stage = new Konva.Stage({
      // @ts-ignore
      container: this.container,
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    })

    this.imageLayer.add(this.imageShape)
    // @ts-ignore
    this.stage.add(this.imageLayer, this.shapesLayer)
  }

  resizeCanvas = () => {
    this.imageBoundingBox = getImageBoundingBox(
      this.container,
      this.imageObject
    )
    this.resizeStage()
    const { width, height, scale } = this.imageBoundingBox
    this.imageShape.width(width / scale)
    this.imageShape.height(height / scale)
    this.onPointerPositionChange()
    this.imageLayer.batchDraw()
    this.loadShapes()
  }

  onPointerPositionChange = () => {
    if (!this.imageBoundingBox) {
      return
    }
    handleLensZoom(
      this.stage,
      this.imageBoundingBox,
      this.pointerPosition,
      this.zoomLevel
    )
  }

  resizeStage = () => {
    const { x, y, scale } = this.imageBoundingBox
    this.stage.scale({
      x: scale,
      y: scale,
    })
    this.stage.position({ x, y })
    this.stage.width(this.container.clientWidth)
    this.stage.height(this.container.clientHeight)
  }

  loadImage = () => {
    this.imageObject.onload = () => {
      this.imageShape.image(this.imageObject)
      this.imageLayer.batchDraw()
      this.resizeCanvas()
    }
    if (this.orientation) {
      rotateImage(this.image, this.orientation).then((image) => {
        this.imageObject.src = image
      })
    } else {
      this.imageObject.src = this.image
    }
  }

  loadShapes = () => {
    if (!this.imageBoundingBox) {
      return
    }
    const polygons = mapShapesToPolygons(
      this.stage,
      this.shapes,
      this.imageBoundingBox,
      {},
      this.options
    )
    if (polygons.length) {
      this.shapesLayer.add(...polygons)
    }
    this.shapesLayer.batchDraw()
  }

  render() {
    return html`${LensStyle(this.options.backgroundColor)}
      <div class="wrapper">
        <img class="icon" src=${targetIcon} />
        <div id="container"></div>
      </div>`
  }
}
