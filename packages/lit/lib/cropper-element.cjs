/*!
 * ***********************************
 * @ldesign/cropper-lit v2.0.0     *
 * Built with rollup               *
 * Build time: 2024-10-29 10:32:34 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var tslib_es6 = require('./node_modules/.pnpm/@rollup_plugin-typescript@11.1.6_rollup@4.52.5_tslib@2.8.1_typescript@5.9.3/node_modules/tslib/tslib.es6.cjs');
var lit = require('lit');
var decorators_js = require('lit/decorators.js');
var cropperCore = require('@ldesign/cropper-core');

exports.CropperElement = class CropperElement2 extends lit.LitElement {
  constructor() {
    super(...arguments);
    this.src = "";
    this.aspectRatio = NaN;
    this.viewMode = 0;
    this.dragMode = "crop";
    this.responsive = true;
    this.restore = true;
    this.checkCrossOrigin = true;
    this.checkOrientation = true;
    this.modal = true;
    this.guides = true;
    this.center = true;
    this.highlight = true;
    this.background = true;
    this.autoCrop = true;
    this.movable = true;
    this.rotatable = true;
    this.scalable = true;
    this.zoomable = true;
    this.zoomOnTouch = true;
    this.zoomOnWheel = true;
    this.wheelZoomRatio = 0.1;
    this.cropBoxMovable = true;
    this.cropBoxResizable = true;
    this.cropper = null;
  }
  firstUpdated() {
    this.initCropper();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroy();
  }
  async initCropper() {
    if (!this.container)
      return;
    const options = {
      src: this.src,
      aspectRatio: this.aspectRatio,
      viewMode: this.viewMode,
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
        this.dispatchEvent(new CustomEvent("cropper-ready", { detail: e }));
      },
      cropstart: (e) => {
        this.dispatchEvent(new CustomEvent("cropper-cropstart", { detail: e }));
      },
      cropmove: (e) => {
        this.dispatchEvent(new CustomEvent("cropper-cropmove", { detail: e }));
      },
      cropend: (e) => {
        this.dispatchEvent(new CustomEvent("cropper-cropend", { detail: e }));
      },
      crop: (e) => {
        this.dispatchEvent(new CustomEvent("cropper-crop", { detail: e }));
      },
      zoom: (e) => {
        this.dispatchEvent(new CustomEvent("cropper-zoom", { detail: e }));
      }
    };
    this.cropper = new cropperCore.Cropper(this.container, options);
  }
  updated(changedProperties) {
    if (changedProperties.has("src") && this.src && this.cropper) {
      this.cropper.replace(this.src);
    }
  }
  // Public API
  getCropper() {
    return this.cropper;
  }
  getCropBoxData() {
    return this.cropper?.getCropBoxData() || null;
  }
  setCropBoxData(data) {
    this.cropper?.setCropBoxData(data);
  }
  getData(rounded) {
    return this.cropper?.getData(rounded) || null;
  }
  getCroppedCanvas(options) {
    return this.cropper?.getCroppedCanvas(options) || null;
  }
  async replace(src) {
    await this.cropper?.replace(src);
  }
  reset() {
    this.cropper?.reset();
  }
  clear() {
    this.cropper?.clear();
  }
  rotate(degree) {
    this.cropper?.rotate(degree);
  }
  scale(scaleX, scaleY) {
    this.cropper?.scale(scaleX, scaleY);
  }
  move(offsetX, offsetY) {
    this.cropper?.move(offsetX, offsetY);
  }
  zoom(ratio) {
    this.cropper?.zoom(ratio);
  }
  enable() {
    this.cropper?.enable();
  }
  disable() {
    this.cropper?.disable();
  }
  destroy() {
    this.cropper?.destroy();
    this.cropper = null;
  }
  render() {
    return lit.html`
      <div class="cropper-container"></div>
    `;
  }
};
exports.CropperElement.styles = lit.css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .cropper-container {
      width: 100%;
      height: 100%;
    }
  `;
tslib_es6.__decorate([
  decorators_js.property({ type: String })
], exports.CropperElement.prototype, "src", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Number })
], exports.CropperElement.prototype, "aspectRatio", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Number })
], exports.CropperElement.prototype, "viewMode", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: String })
], exports.CropperElement.prototype, "dragMode", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "responsive", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "restore", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "checkCrossOrigin", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "checkOrientation", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "modal", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "guides", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "center", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "highlight", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "background", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "autoCrop", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "movable", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "rotatable", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "scalable", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "zoomable", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "zoomOnTouch", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "zoomOnWheel", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Number })
], exports.CropperElement.prototype, "wheelZoomRatio", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "cropBoxMovable", void 0);
tslib_es6.__decorate([
  decorators_js.property({ type: Boolean })
], exports.CropperElement.prototype, "cropBoxResizable", void 0);
tslib_es6.__decorate([
  decorators_js.query(".cropper-container")
], exports.CropperElement.prototype, "container", void 0);
exports.CropperElement = tslib_es6.__decorate([
  decorators_js.customElement("l-cropper")
], exports.CropperElement);
/*! End of @ldesign/cropper-lit | Powered by @ldesign/builder */
//# sourceMappingURL=cropper-element.cjs.map
