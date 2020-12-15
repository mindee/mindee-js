![logo_mindee](https://user-images.githubusercontent.com/41388086/68026973-7858b080-fcb1-11e9-85ff-724c8d014118.png)

# mindee-js

> Computer vision SDK for image segmentation and document processing on top of [mindee](https://mindee.com) APIs

[![NPM](https://img.shields.io/npm/v/mindee-js.svg)](https://www.npmjs.com/package/mindee-js)

You can also check out more SDKs built on top of mindee-js
- [react-mindee-js](https://www.npmjs.com/package/react-mindee-js)
- [vue-mindee-js](https://www.npmjs.com/package/vue-mindee-js)

![ezgif com-video-to-gif (12)](https://user-images.githubusercontent.com/41388086/87852820-92045b80-c905-11ea-808e-5a971de2b29f.gif)


## Features

This SDK was made for building interfaces on top of Mindee document parsing APIs and more generally on top of
any computer vision detection APIs.

- Work with images and pdfs
- Display interactive shapes on images or pdfs with custom style
- Bind custom functions to shapes mouse events
- Create multi-pages pdfs navigation sidebar
- Zoom in and out in the canvas
- Move the image with the mouse
- Create a lens to zoom around the user's pointer

This SDK was primarily made for document processing but can be used for any type of computer vision interface:

## Installation

Installing with npm

```bash
npm install --save mindee-js
```

installing with yarn

```
yarn add mindee-js
```

## Usage

Import **mindee-js** as a side effect in code that will be included throughout your site (e.g. your root module). This will make sure the mindee-js web components are inserted immediately upon page load.

### React example
```jsx
import React, { useEffect, useRef, useState } from 'react'
import 'mindee-js'

import dummyImage from 'assets/image.jpg'
const dummy_shapes = [
  {
    id: 1,
    coordinates: [
      [0.479, 0.172],
      [0.611, 0.172],
      [0.611, 0.196],
      [0.479, 0.196],
    ],
  },
  {
    id: 2,
    coordinates: [
      [0.394, 0.068],
      [0.477, 0.068],
      [0.477, 0.087],
      [0.394, 0.087],
    ],
  },
]

const Example = () => {
  const [pointerPosition, setPointerPosition] = useState(null)
  const ref = useRef(null)

  const onPointerMove = (event) => {
    setPointerPosition(event?.detail?.pointerPosition)
  }

  useEffect(() => {
    ref.current?.addEventListener('on-pointer-move', onPointerMove)
    return () => {
      ref.current?.removeEventListener('on-pointer-move', onPointerMove)
    }
  }, [])

  return (
    <div>
      <annotation-viewer
        ref={ref}
        image={dummyImage}
        shapes={JSON.stringify(dummyShapes)}
        style={{
          display: 'flex',
          width: '100%',
          height: 600,
        }}
      ></annotation-viewer>
      <annotation-lens
        image={dummyImage}
        pointerPosition={pointerPosition && JSON.stringify(pointerPosition)}
        style={{
          display: 'flex',
          width: 300,
          height: 300,
        }}
      ></annotation-lens>
    </div>
  )
}

```

### getImagesFromPDF
> This function returns a Promise that resolves with a list of images as base64 format . It takes pdf file (object URL)

```javascript
import { getImagesFromPDF } from 'mindee-js'

getImagesFromPDF(file).then((images) => {
  // Do something with images pdf pages
})
```

# Contribute to this repo

Feel free to use github to submit issues, pull requests or general feedback.
You can also visit [our website](https://mindee.com) or drop us an [email](mailto:contact@mindee.com).

Please read our [Contributing section](CONTRIBUTING.md) before contributing.

# License

GPLv3 © [mindee](https://mindee.com)
