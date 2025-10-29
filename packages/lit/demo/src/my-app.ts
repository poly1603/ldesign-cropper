import { css, html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@ldesign/cropper-lit'
// import '@ldesign/cropper-lit/es/style.css'

@customElement('my-app')
export class MyApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 3.2em;
      line-height: 1.1;
      color: #646cff;
    }

    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 20px 0;
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

    l-cropper {
      width: 800px;
      height: 600px;
      margin: 0 auto;
      display: block;
      border: 2px solid #646cff;
      border-radius: 8px;
      overflow: hidden;
    }

    .result {
      margin-top: 20px;
    }

    .result img {
      max-width: 400px;
      border: 2px solid #ccc;
    }
  `

  @state()
  private croppedImage = ''

  @query('l-cropper')
  private cropper!: any

  render() {
    return html`
      <div>
        <h1>🖼️ Cropper Lit Demo</h1>
        
        <div class="controls">
          <button @click=${this.rotate}>↻ Rotate</button>
          <button @click=${this.flipH}>↔ Flip H</button>
          <button @click=${this.flipV}>↕ Flip V</button>
          <button @click=${this.reset}>Reset</button>
          <button @click=${this.getCropped}>Get Cropped Image</button>
        </div>
        
        <l-cropper
          src="https://picsum.photos/1200/800"
          aspect-ratio="1.7778"
          view-mode="1"
          drag-mode="crop"
          ?auto-crop=${true}
          @cropper-ready=${this.handleReady}
          @cropper-crop=${this.handleCrop}
        ></l-cropper>
        
        ${this.croppedImage
          ? html`
          <div class="result">
            <h3>Cropped Result:</h3>
            <img src=${this.croppedImage} alt="Cropped" />
          </div>
        `
          : ''}
      </div>
    `
  }

  private handleReady() {
    console.log('✅ Cropper ready!')
  }

  private handleCrop(e: CustomEvent) {
    console.log('📐 Crop data:', e.detail)
  }

  private rotate() {
    this.cropper?.rotate(90)
  }

  private flipH() {
    const data = this.cropper?.getData()
    if (data) {
      this.cropper?.scale(-(data.scaleX || 1), undefined)
    }
  }

  private flipV() {
    const data = this.cropper?.getData()
    if (data) {
      this.cropper?.scale(undefined, -(data.scaleY || 1))
    }
  }

  private reset() {
    this.cropper?.reset()
    this.croppedImage = ''
  }

  private getCropped() {
    const canvas = this.cropper?.getCroppedCanvas()
    if (canvas) {
      this.croppedImage = canvas.toDataURL()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-app': MyApp
  }
}
