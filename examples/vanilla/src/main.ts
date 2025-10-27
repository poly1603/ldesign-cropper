import { Cropper } from '@ldesign/cropper-core'
import '@ldesign/cropper-core/dist/styles/cropper.css'

let cropper: Cropper | null = null

// 获取元素
const fileInput = document.getElementById('file-input') as HTMLInputElement
const container = document.getElementById('cropper-container') as HTMLElement
const resultSection = document.getElementById('result-section') as HTMLElement
const resultCanvas = document.getElementById('result-canvas') as HTMLCanvasElement

// 按钮
const rotateLeftBtn = document.getElementById('rotate-left') as HTMLButtonElement
const rotateRightBtn = document.getElementById('rotate-right') as HTMLButtonElement
const flipHBtn = document.getElementById('flip-h') as HTMLButtonElement
const flipVBtn = document.getElementById('flip-v') as HTMLButtonElement
const resetBtn = document.getElementById('reset') as HTMLButtonElement
const cropBtn = document.getElementById('crop') as HTMLButtonElement

// 文件选择
fileInput.addEventListener('change', async (e) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 销毁旧的 cropper
  if (cropper) {
    cropper.destroy()
  }

  // 创建图片 URL
  const imageUrl = URL.createObjectURL(file)

  // 初始化 cropper
  cropper = new Cropper(container, {
    src: imageUrl,
    aspectRatio: 16 / 9,
    viewMode: 1,
    dragMode: 'move',
    autoCrop: true,
    autoCropArea: 0.8,
    restore: true,
    guides: true,
    center: true,
    highlight: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: true,
    toolbar: true,
    keyboard: true,
    ready: () => {
      console.log('Cropper is ready')
      // 释放临时 URL
      URL.revokeObjectURL(imageUrl)
    }
  })

  // 隐藏空状态
  const emptyState = container.querySelector('.empty-state') as HTMLElement
  if (emptyState) {
    emptyState.style.display = 'none'
  }
})

// 左旋转
rotateLeftBtn.addEventListener('click', () => {
  if (cropper) {
    cropper.rotate(-90)
  }
})

// 右旋转
rotateRightBtn.addEventListener('click', () => {
  if (cropper) {
    cropper.rotate(90)
  }
})

// 水平翻转
let scaleX = 1
flipHBtn.addEventListener('click', () => {
  if (cropper) {
    scaleX = -scaleX
    cropper.scaleX(scaleX)
  }
})

// 垂直翻转
let scaleY = 1
flipVBtn.addEventListener('click', () => {
  if (cropper) {
    scaleY = -scaleY
    cropper.scaleY(scaleY)
  }
})

// 重置
resetBtn.addEventListener('click', () => {
  if (cropper) {
    cropper.reset()
    scaleX = 1
    scaleY = 1
  }
})

// 裁剪
cropBtn.addEventListener('click', () => {
  if (!cropper) return

  const canvas = cropper.getCroppedCanvas({
    width: 1920,
    height: 1080,
    fillColor: '#fff'
  })

  if (canvas) {
    // 显示结果
    resultSection.style.display = 'block'

    // 复制 canvas 内容
    const ctx = resultCanvas.getContext('2d')
    if (ctx) {
      resultCanvas.width = canvas.width
      resultCanvas.height = canvas.height
      ctx.drawImage(canvas, 0, 0)
    }

    // 滚动到结果区域
    resultSection.scrollIntoView({ behavior: 'smooth' })

    // 可以下载图片
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
})

// 禁用按钮直到图片加载
function updateButtonsState(enabled: boolean) {
  const buttons = [rotateLeftBtn, rotateRightBtn, flipHBtn, flipVBtn, resetBtn, cropBtn]
  buttons.forEach(btn => {
    btn.disabled = !enabled
    btn.style.opacity = enabled ? '1' : '0.5'
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed'
  })
}

// 初始时禁用按钮
updateButtonsState(false)

// 监听 cropper ready 事件
container.addEventListener('ready', () => {
  updateButtonsState(true)
})

