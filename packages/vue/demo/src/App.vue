<script setup lang="ts">
import { Cropper } from '@ldesign/cropper-vue'
import { ref } from 'vue'
// import '@ldesign/cropper-vue/es/style.css'

const cropperRef = ref()
const croppedImage = ref('')

function onReady() {
  console.log('✅ Cropper ready!')
}

function onCrop(event: CustomEvent) {
  console.log('📐 Crop data:', event.detail)
}

function rotate() {
  cropperRef.value?.rotate(90)
}

function flipH() {
  const data = cropperRef.value?.getData()
  if (data) {
    cropperRef.value?.scale(-(data.scaleX || 1), undefined)
  }
}

function flipV() {
  const data = cropperRef.value?.getData()
  if (data) {
    cropperRef.value?.scale(undefined, -(data.scaleY || 1))
  }
}

function reset() {
  cropperRef.value?.reset()
  croppedImage.value = ''
}

function getCropped() {
  const canvas = cropperRef.value?.getCroppedCanvas()
  if (canvas) {
    croppedImage.value = canvas.toDataURL()
  }
}
</script>

<template>
  <div class="app">
    <h1>🖼️ Cropper Vue 3 Demo</h1>

    <div class="controls">
      <button @click="rotate">
        ↻ Rotate
      </button>
      <button @click="flipH">
        ↔ Flip H
      </button>
      <button @click="flipV">
        ↕ Flip V
      </button>
      <button @click="reset">
        Reset
      </button>
      <button @click="getCropped">
        Get Cropped Image
      </button>
    </div>

    <Cropper
      ref="cropperRef"
      src="https://picsum.photos/1200/800"
      :aspect-ratio="16 / 9"
      :view-mode="1"
      drag-mode="crop"
      :auto-crop="true"
      class="cropper-wrapper"
      @ready="onReady"
      @crop="onCrop"
    />

    <div v-if="croppedImage" class="result">
      <h3>Cropped Result:</h3>
      <img :src="croppedImage" alt="Cropped" style="max-width: 400px; border: 2px solid #ccc;">
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.cropper-wrapper {
  width: 800px;
  height: 600px;
  margin: 0 auto;
  border: 2px solid #646cff;
  border-radius: 8px;
  overflow: hidden;
}

.result {
  margin-top: 20px;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: white;
}

button:hover {
  border-color: #646cff;
}
</style>
