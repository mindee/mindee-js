export const CONTAINER_WIDTH = 600
export const CONTAINER_HEIGHT = 600

export enum KONVA_REFS {
  imageLayer = 'image-layer',
  shapesLayer = 'shapes-layer',
  imageShape = 'image-shape',
  shape = 'shape',
}

export const DEFAULT_OPTIONS = {
  backgroundColor: 'black',
  shape: {
    default: {
      stroke: 'red',
      strokeWidth: 3,
      listening: true,
    },
    onMouseEnter: {},
    onMouseLeave: {},
  },

  zoom: {
    modifier: 1.2,
    max: 10,
    defaultZoom: 1,
  },
}
