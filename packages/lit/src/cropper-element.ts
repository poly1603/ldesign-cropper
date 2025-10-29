import type { CropBoxData, CropData, Cropper, type CropperOptions } from '@ldesign/cropper-core'

import { css, html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('l-cropper')
export class CropperElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .cropper-container {
      width: 100%;
      height: 100%;
    }
  `

  @property({ type: String }) src = ''
  @property({ type: Number }) aspectRatio = Number.NaN
  @property({ type: Number }) viewMode = 0
  @property({ type: String }) dragMode: 'crop' | 'move' | 'none' = 'crop'
  @property({ type: Boolean }) responsive = true
  @property({ type: Boolean }) restore = true
  @property({ type: Boolean }) checkCrossOrigin = true
  @property({ type: Boolean }) checkOrientation = true
  @property({ type: Boolean }) modal = true
  @property({ type: Boolean }) guides = true
  @property({ type: Boolean }) center = true
  @property({ type: Boolean }) highlight = true
  @property({ type: Boolean }) background = true
  @property({ type: Boolean }) autoCrop = true
  @property({ type: Boolean }) movable = true
  @property({ type: Boolean }) rotatable = true
  @property({ type: Boolean }) scalable = true
  @property({ type: Boolean }) zoomable = true
  @property({ type: Boolean }) zoomOnTouch = true
  @property({ type: Boolean }) zoomOnWheel = true
  @property({ type: Number }) wheelZoomRatio = 0.1
  @property({ type: Boolean }) cropBoxMovable = true
  @property({ type: Boolean }) cropBoxResizable = true

  @query('.cropper-container')
  private container!: HTMLDivElement

  private cropper: Cropper | null = null

  protected firstUpdated() {
    this.initCropper()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.destroy()
  }

  private async initCropper() {
    if (!this.container)
      return

    const options: CropperOptions = {
      src: this.src,
      aspectRatio: this.aspectRatio,
      viewMode: this.viewMode as any,
      dragMode: this.dragMode,
      responsive: this.responsive,
      restore: this.restore,
      checkCrossOrigin: this.checkCrossOrigin,
      checkOrientation: this.checkOrientation,
      modal: this.modal,
      guides: this.guides,
      center: this.center,
      highlight: this.highlight,
      background: this.background,
      autoCrop: this.autoCrop,
      movable: this.movable,
      rotatable: this.rotatable,
      scalable: this.scalable,
      zoomable: this.zoomable,
      zoomOnTouch: this.zoomOnTouch,
      zoomOnWheel: this.zoomOnWheel,
      wheelZoomRatio: this.wheelZoomRatio,
      cropBoxMovable: this.cropBoxMovable,
      cropBoxResizable: this.cropBoxResizable,
      ready: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-ready', { detail: e }))
      },
      cropstart: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-cropstart', { detail: e }))
      },
      cropmove: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-cropmove', { detail: e }))
      },
      cropend: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-cropend', { detail: e }))
      },
      crop: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-crop', { detail: e }))
      },
      zoom: (e) => {
        this.dispatchEvent(new CustomEvent('cropper-zoom', { detail: e }))
      },
    }

    this.cropper = new Cropper(this.container, options)
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('src') && this.src && this.cropper) {
      this.cropper.replace(this.src)
    }
  }

  // Public API
  getCropper(): Cropper | null {
    return this.cropper
  }

  getCropBoxData(): CropBoxData | null {
    return this.cropper?.getCropBoxData() || null
  }

  setCropBoxData(data: Partial<CropBoxData>): void {
    this.cropper?.setCropBoxData(data)
  }

  getData(rounded?: boolean): CropData | null {
    return this.cropper?.getData(rounded) || null
  }

  getCroppedCanvas(options?: any): HTMLCanvasElement | null {
    return this.cropper?.getCroppedCanvas(options) || null
  }

  async replace(src: string): Promise<void> {
    await this.cropper?.replace(src)
  }

  reset(): void {
    this.cropper?.reset()
  }

  clear(): void {
    this.cropper?.clear()
  }

  rotate(degree: number): void {
    this.cropper?.rotate(degree)
  }

  scale(scaleX: number, scaleY?: number): void {
    this.cropper?.scale(scaleX, scaleY)
  }

  move(offsetX: number, offsetY?: number): void {
    this.cropper?.move(offsetX, offsetY)
  }

  zoom(ratio: number): void {
    this.cropper?.zoom(ratio)
  }

  enable(): void {
    this.cropper?.enable()
  }

  disable(): void {
    this.cropper?.disable()
  }

  destroy(): void {
    this.cropper?.destroy()
    this.cropper = null
  }

  render() {
    return html`
      <div class="cropper-container"></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-cropper': CropperElement
  }
}
