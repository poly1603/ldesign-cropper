<script setup lang="ts">
import { VueCropper } from '@ldesign/cropper-vue'
import { ref } from 'vue'

const cropperRef = ref<any>(null)
const imageSrc = ref('')
const croppedImage = ref('')
const isReady = ref(false)
let scaleX = 1
let scaleY = 1

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file)
    return

  // 创建图片 URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target?.result as string
    isReady.value = false
    scaleX = 1
    scaleY = 1
  }
  reader.readAsDataURL(file)
}

function onReady() {
  console.log('Cropper is ready')
  isReady.value = true
}

function rotateLeft() {
  if (cropperRef.value) {
    cropperRef.value.rotate(-90)
  }
}

function rotateRight() {
  if (cropperRef.value) {
    cropperRef.value.rotate(90)
  }
}

function flipH() {
  if (cropperRef.value) {
    scaleX = -scaleX
    cropperRef.value.scaleX(scaleX)
  }
}

function flipV() {
  if (cropperRef.value) {
    scaleY = -scaleY
    cropperRef.value.scaleY(scaleY)
  }
}

function reset() {
  if (cropperRef.value) {
    cropperRef.value.reset()
    scaleX = 1
    scaleY = 1
  }
}

function crop() {
  if (!cropperRef.value)
    return

  const canvas = cropperRef.value.getCroppedCanvas({
    width: 1920,
    height: 1080,
    fillColor: '#fff',
  })

  if (canvas) {
    croppedImage.value = canvas.toDataURL('image/jpeg', 0.95)

    // 自动下载
    canvas.toBlob((blob: Blob | null) => {
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
</script>

<template>
  <div>
    <h1>🖼️ Cropper Vue - Vue 3 示例</h1>

    <div class="card">
      <div class="upload-section">
        <div class="file-input-wrapper">
          <button class="btn">
            📁 选择图片
          </button>
          <input type="file" accept="image/*" @change="handleFileChange">
        </div>
      </div>

      <div class="cropper-wrapper">
        <VueCropper
          v-if="imageSrc"
          ref="cropperRef"
          :src="imageSrc"
          :aspect-ratio="16 / 9"
          :view-mode="1"
          drag-mode="move"
          :auto-crop="true"
          :auto-crop-area="0.8"
          :guides="true"
          :center="true"
          :highlight="true"
          :crop-box-movable="true"
          :crop-box-resizable="true"
          :toolbar="true"
          @ready="onReady"
        />
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
          <p>请选择一张图片开始裁剪</p>
        </div>
      </div>

      <div class="controls">
        <button class="btn" :disabled="!isReady" @click="rotateLeft">
          ↶ 左旋转
        </button>
        <button class="btn" :disabled="!isReady" @click="rotateRight">
          ↷ 右旋转
        </button>
        <button class="btn" :disabled="!isReady" @click="flipH">
          ↔️ 水平翻转
        </button>
        <button class="btn" :disabled="!isReady" @click="flipV">
          ↕️ 垂直翻转
        </button>
        <button class="btn btn-secondary" :disabled="!isReady" @click="reset">
          🔄 重置
        </button>
        <button class="btn btn-success" :disabled="!isReady" @click="crop">
          ✂️ 裁剪
        </button>
      </div>
    </div>

    <div v-if="croppedImage" class="card result-section">
      <h3>裁剪结果</h3>
      <img :src="croppedImage" alt="Cropped" class="result-image">
    </div>
  </div>
</template>
