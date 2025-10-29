import type { ReactCropperRef } from '@ldesign/cropper-react'
import { ReactCropper } from '@ldesign/cropper-react'
import { useRef, useState } from 'react'

function App() {
  const cropperRef = useRef<ReactCropperRef>(null)
  const [imageSrc, setImageSrc] = useState('')
  const [croppedImage, setCroppedImage] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file)
      return

    // 创建图片 URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
      setIsReady(false)
      setScaleX(1)
      setScaleY(1)
    }
    reader.readAsDataURL(file)
  }

  const handleReady = () => {
    console.log('Cropper is ready')
    setIsReady(true)
  }

  const rotateLeft = () => {
    cropperRef.current?.rotate(-90)
  }

  const rotateRight = () => {
    cropperRef.current?.rotate(90)
  }

  const flipH = () => {
    const newScaleX = -scaleX
    setScaleX(newScaleX)
    cropperRef.current?.scaleX(newScaleX)
  }

  const flipV = () => {
    const newScaleY = -scaleY
    setScaleY(newScaleY)
    cropperRef.current?.scaleY(newScaleY)
  }

  const reset = () => {
    cropperRef.current?.reset()
    setScaleX(1)
    setScaleY(1)
  }

  const crop = () => {
    const canvas = cropperRef.current?.getCroppedCanvas({
      width: 1920,
      height: 1080,
      fillColor: '#fff',
    })

    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      setCroppedImage(dataUrl)

      // 自动下载
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `cropped-${Date.now()}.jpg`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/jpeg', 0.95)
    }
  }

  return (
    <div>
      <h1>⚛️ Cropper React - React 示例</h1>

      <div className="card">
        <div className="upload-section">
          <div className="file-input-wrapper">
            <button className="btn">
              📁 选择图片
            </button>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="cropper-wrapper">
          {imageSrc
            ? (
                <ReactCropper
                  ref={cropperRef}
                  src={imageSrc}
                  aspectRatio={16 / 9}
                  viewMode={1}
                  dragMode="move"
                  autoCrop={true}
                  autoCropArea={0.8}
                  guides={true}
                  center={true}
                  highlight={true}
                  cropBoxMovable={true}
                  cropBoxResizable={true}
                  toolbar={true}
                  onReady={handleReady}
                />
              )
            : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                  <p>请选择一张图片开始裁剪</p>
                </div>
              )}
        </div>

        <div className="controls">
          <button className="btn" disabled={!isReady} onClick={rotateLeft}>↶ 左旋转</button>
          <button className="btn" disabled={!isReady} onClick={rotateRight}>↷ 右旋转</button>
          <button className="btn" disabled={!isReady} onClick={flipH}>↔️ 水平翻转</button>
          <button className="btn" disabled={!isReady} onClick={flipV}>↕️ 垂直翻转</button>
          <button className="btn btn-secondary" disabled={!isReady} onClick={reset}>🔄 重置</button>
          <button className="btn btn-success" disabled={!isReady} onClick={crop}>✂️ 裁剪</button>
        </div>
      </div>

      {croppedImage && (
        <div className="card result-section">
          <h3>裁剪结果</h3>
          <img src={croppedImage} alt="Cropped" className="result-image" />
        </div>
      )}
    </div>
  )
}

export default App
