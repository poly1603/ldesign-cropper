import { Cropper } from '@ldesign/cropper'
// Import styles - adjust path based on build output
// import '@ldesign/cropper/es/style.css'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="container">
    <h1>🖼️ Cropper Vanilla JS Demo</h1>
    
    <div class="controls">
      <button id="rotate-btn">↻ Rotate</button>
      <button id="flip-h-btn">↔ Flip H</button>
      <button id="flip-v-btn">↕ Flip V</button>
      <button id="reset-btn">Reset</button>
      <button id="crop-btn">Get Cropped Image</button>
    </div>
    
    <div id="cropper-container" class="cropper-wrapper"></div>
    
    <div id="result-container" style="margin-top: 20px;"></div>
  </div>
`

// Initialize cropper
const cropper = new Cropper('#cropper-container', {
  src: 'https://picsum.photos/1200/800',
  aspectRatio: 16 / 9,
  viewMode: 1,
  dragMode: 'crop',
  autoCrop: true,
  ready: () => {
    console.log('✅ Cropper ready!')
  },
  crop: (event: CustomEvent) => {
    console.log('📐 Crop data:', event.detail)
  },
})

// Setup controls
document.getElementById('rotate-btn')?.addEventListener('click', () => {
  cropper.rotate(90)
})

document.getElementById('flip-h-btn')?.addEventListener('click', () => {
  const data = cropper.getImageData()
  cropper.scaleX(-(data.scaleX || 1))
})

document.getElementById('flip-v-btn')?.addEventListener('click', () => {
  const data = cropper.getImageData()
  cropper.scaleY(-(data.scaleY || 1))
})

document.getElementById('reset-btn')?.addEventListener('click', () => {
  cropper.reset()
})

document.getElementById('crop-btn')?.addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas()
  if (canvas) {
    const resultContainer = document.getElementById('result-container')!
    resultContainer.innerHTML = '<h3>Cropped Result:</h3>'
    resultContainer.appendChild(canvas)
    canvas.style.maxWidth = '400px'
    canvas.style.border = '2px solid #ccc'
  }
})

console.log('🚀 Cropper instance:', cropper)
