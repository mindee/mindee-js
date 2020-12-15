import { KONVA_REFS } from './../../common/constants'
import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'
import {
  LitElement,
  html,
  property,
  customElement,
  internalProperty,
} from 'lit-element'
import { Image as imageShape } from 'konva/types/shapes/Image'

import { DEFAULT_OPTIONS } from '../../common/constants'
import {
  mapShapesToPolygons,
  getImageBoundingBox,
  handleStageZoom,
  rotateImage,
  getMousePosition,
} from '../../utils'
import {
  AnnotationShape,
  ImageBoundingBox,
  PointerPosition,
  Options,
  Orientation,
} from '../../common'
import { containerStyle } from '../../common/styles'

@customElement('annotation-viewer')
export class AnnotationViewer extends LitElement {
  private _image
  private _shapes
  private stage: Stage
  private container: HTMLElement
  private imageLayer: Layer
  private shapesLayer: Layer
  private imageObject: HTMLImageElement
  private imageShape: imageShape
  private _orientation: Orientation
  private _options: Options

  @internalProperty() imageBoundingBox: ImageBoundingBox

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
  get orientation(): Orientation {
    return this._orientation
  }
  set orientation(value: Orientation) {
    this._orientation = value
    this.loadImage()
  }

  @property({ type: Object })
  get options(): Options {
    return this._options
  }
  set options(value: Options) {
    this._options = { ...this._options, ...value }
  }

  constructor() {
    super()
    this._image = ''
    this._options = DEFAULT_OPTIONS
    this._shapes = []
    this._orientation = 0
    this.stage = null
    this.imageBoundingBox = null
    this.imageLayer = new Konva.Layer({ id: KONVA_REFS.imageLayer })
    this.shapesLayer = new Konva.Layer({ id: KONVA_REFS.shapesLayer })
    this.imageObject = new Image()
    this.imageShape = new Konva.Image({
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

    this.stage.on('wheel', this.onZoom)
    this.stage.on('mousemove', this.onMouseMove)
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('resize', this.resizeCanvas)
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this.resizeCanvas)
    super.disconnectedCallback()
  }

  onShapeClick = (shape: AnnotationShape) => {
    const event = new CustomEvent('on-shape-click', {
      detail: { shape },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  onShapeMouseEnter = (shape: AnnotationShape) => {
    const event = new CustomEvent('on-shape-mouse-enter', {
      detail: { shape },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  onPointerMove = (pointerPosition: PointerPosition) => {
    const event = new CustomEvent('on-pointer-move', {
      detail: { pointerPosition },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  onShapeMouseLeave = (shape: AnnotationShape) => {
    const event = new CustomEvent('on-shape-mouse-leave', {
      detail: { shape },
      bubbles: true,
      composed: true,
    })
    this.dispatchEvent(event)
  }

  onMouseMove = () => {
    if (!this.imageBoundingBox) {
      return
    }
    const mousePointTo = getMousePosition(this.stage, this.imageBoundingBox)
    this.onPointerMove(mousePointTo)
  }

  resizeCanvas = () => {
    this.imageBoundingBox = getImageBoundingBox(
      this.container,
      this.imageObject
    )
    this.resizeStage()
    const { x, y, width, height, scale } = this.imageBoundingBox
    this.stage.scale({
      x: scale,
      y: scale,
    })
    this.stage.position({ x, y })
    this.imageShape.width(width / scale)
    this.imageShape.height(height / scale)
    this.imageLayer.batchDraw()
    this.loadShapes()
  }

  resizeStage = () => {
    this.stage.width(this.container.clientWidth)
    this.stage.height(this.container.clientHeight)
  }

  private loadImage = () => {
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

  private loadShapes = () => {
    if (!this.imageBoundingBox) {
      return
    }
    const polygons = mapShapesToPolygons(
      this.stage,
      this.shapes,
      this.imageBoundingBox,
      {
        onClick: this.onShapeClick,
        onMouseEnter: this.onShapeMouseEnter,
        onMouseLeave: this.onShapeMouseLeave,
      },
      this.options
    )
    if (polygons.length) {
      this.shapesLayer.add(...polygons)
    }
    this.shapesLayer.batchDraw()
  }

  private onZoom = (event) => {
    handleStageZoom(event, this.stage, this.imageBoundingBox, this.options.zoom)
  }
  render() {
    return html`${containerStyle(this.options.backgroundColor)}
      <div id="container"></div>`
  }
}
