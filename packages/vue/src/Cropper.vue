<script setup lang="ts">
import type { CropBoxData, CropData, Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core'

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface CropperProps extends CropperOptions {
  modelValue?: string
}

const props = withDefaults(defineProps<CropperProps>(), {
  aspectRatio: Number.NaN,
  viewMode: 0,
  dragMode: 'crop',
  responsive: true,
  restore: true,
  checkCrossOrigin: true,
  checkOrientation: true,
  modal: true,
  guides: true,
  center: true,
  highlight: true,
  background: true,
  autoCrop: true,
  movable: true,
  rotatable: true,
  scalable: true,
  zoomable: true,
  zoomOnTouch: true,
  zoomOnWheel: true,
  wheelZoomRatio: 0.1,
  cropBoxMovable: true,
  cropBoxResizable: true,
  toggleDragModeOnDblclick: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'ready': [event: CustomEvent]
  'cropstart': [event: CustomEvent]
  'cropmove': [event: CustomEvent]
  'cropend': [event: CustomEvent]
  'crop': [event: CustomEvent]
  'zoom': [event: CustomEvent]
}>()

const containerRef = ref<HTMLElement>()
let cropperInstance: CropperCore | null = null

// 初始化裁剪器
async function initCropper() {
  if (!containerRef.value)
    return

  const options: CropperOptions = {
    ...props,
    ready: (e) => {
      emit('ready', e)
      if (props.ready)
        props.ready(e)
    },
    cropstart: (e) => {
      emit('cropstart', e)
      if (props.cropstart)
        props.cropstart(e)
    },
    cropmove: (e) => {
      emit('cropmove', e)
      if (props.cropmove)
        props.cropmove(e)
    },
    cropend: (e) => {
      emit('cropend', e)
      if (props.cropend)
        props.cropend(e)
    },
    crop: (e) => {
      emit('crop', e)
      if (props.crop)
        props.crop(e)
    },
    zoom: (e) => {
      emit('zoom', e)
      if (props.zoom)
        props.zoom(e)
    },
  }

  cropperInstance = new CropperCore(containerRef.value, options)
}

// 暴露方法给父组件
const getCropper = () => cropperInstance

function getCropBoxData(): CropBoxData | null {
  return cropperInstance?.getCropBoxData() || null
}

function setCropBoxData(data: Partial<CropBoxData>) {
  cropperInstance?.setCropBoxData(data)
}

function getData(rounded?: boolean): CropData | null {
  return cropperInstance?.getData(rounded) || null
}

function getCroppedCanvas(options?: any) {
  return cropperInstance?.getCroppedCanvas(options) || null
}

async function replace(src: string) {
  await cropperInstance?.replace(src)
  emit('update:modelValue', src)
}

function reset() {
  cropperInstance?.reset()
}

function clear() {
  cropperInstance?.clear()
}

function rotate(degree: number) {
  cropperInstance?.rotate(degree)
}

function scale(scaleX: number, scaleY?: number) {
  cropperInstance?.scale(scaleX, scaleY)
}

function move(offsetX: number, offsetY?: number) {
  cropperInstance?.move(offsetX, offsetY)
}

function zoom(ratio: number) {
  cropperInstance?.zoom(ratio)
}

function enable() {
  cropperInstance?.enable()
}

function disable() {
  cropperInstance?.disable()
}

function destroy() {
  cropperInstance?.destroy()
  cropperInstance = null
}

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc && cropperInstance) {
      replace(newSrc)
    }
  },
)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && cropperInstance && newValue !== props.src) {
      replace(newValue)
    }
  },
)

onMounted(() => {
  initCropper()
})

onBeforeUnmount(() => {
  destroy()
})

// 暴露方法
defineExpose({
  getCropper,
  getCropBoxData,
  setCropBoxData,
  getData,
  getCroppedCanvas,
  replace,
  reset,
  clear,
  rotate,
  scale,
  move,
  zoom,
  enable,
  disable,
  destroy,
})
</script>

<template>
  <div ref="containerRef" class="cropper-container" />
</template>

<style>
@import '@ldesign/cropper-core/style.css';
</style>
