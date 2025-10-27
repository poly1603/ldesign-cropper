import { useRef, useState } from 'react'
import { Cropper, type CropperRef } from '@ldesign/cropper-react'
// import '@ldesign/cropper-react/es/style.css'
import './App.css'

function App() {
  const cropperRef = useRef<CropperRef>(null)
  const [croppedImage, setCroppedImage] = useState('')

  const handleReady = () => {
    console.log('✅ Cropper ready!')
  }

  const handleCrop = (e: CustomEvent) => {
    console.log('📐 Crop data:', e.detail)
  }

  const rotate = () => {
    cropperRef.current?.rotate(90)
  }

  const flipH = () => {
    const data = cropperRef.current?.getData()
    if (data) {
      cropperRef.current?.scale(-(data.scaleX || 1), undefined)
    }
  }

  const flipV = () => {
    const data = cropperRef.current?.getData()
    if (data) {
      cropperRef.current?.scale(undefined, -(data.scaleY || 1))
    }
  }

  const reset = () => {
    cropperRef.current?.reset()
    setCroppedImage('')
  }

  const getCropped = () => {
    const canvas = cropperRef.current?.getCroppedCanvas()
    if (canvas) {
      setCroppedImage(canvas.toDataURL())
    }
  }

  return (
    <div className="app">
      <h1>🖼️ Cropper React Demo</h1>

      <div className="controls">
        <button onClick={rotate}>↻ Rotate</button>
        <button onClick={flipH}>↔ Flip H</button>
        <button onClick={flipV}>↕ Flip V</button>
        <button onClick={reset}>Reset</button>
        <button onClick={getCropped}>Get Cropped Image</button>
      </div>

      <Cropper
        ref={cropperRef}
        src="https://picsum.photos/1200/800"
        aspectRatio={16 / 9}
        viewMode={1}
        dragMode="crop"
        autoCrop={true}
        onReady={handleReady}
        onCrop={handleCrop}
        style={{ width: '800px', height: '600px', margin: '0 auto' }}
        className="cropper-wrapper"
      />

      {croppedImage && (
        <div className="result">
          <h3>Cropped Result:</h3>
          <img src={croppedImage} alt="Cropped" style={{ maxWidth: '400px', border: '2px solid #ccc' }} />
        </div>
      )}
    </div>
  )
}

export default App

