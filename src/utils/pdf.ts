import {
  PDFDocumentProxy,
  PDFPageProxy,
  GlobalWorkerOptions,
  version,
  getDocument,
} from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`

const getImageFromPage = (_document: PDFDocumentProxy, pageNumber) =>
  new Promise(async (resolve, reject) => {
    try {
      const page: PDFPageProxy = await _document.getPage(pageNumber)

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: 1 })
      canvas.height = viewport.height
      canvas.width = viewport.width
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }
      page.render(renderContext).promise.then(() => {
        resolve(canvas.toDataURL())
      })
    } catch (error) {
      reject(null)
    }
  })

export const getImagesFromPDF = (file: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    getDocument(file).promise.then((document: PDFDocumentProxy) => {
      Promise.all(
        Array.from(Array(document.numPages).keys()).map((index) =>
          getImageFromPage(document, index + 1)
        )
      )
        .then((images: string[]) => {
          resolve(images)
        })
        .catch(() => {
          reject([])
        })
    })
  })
