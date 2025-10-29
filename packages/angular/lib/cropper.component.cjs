/*!
 * ***********************************
 * @ldesign/cropper-angular v2.0.0 *
 * Built with rollup               *
 * Build time: 2024-10-29 10:23:42 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var tslib = require('tslib');
var core = require('@angular/core');
var cropperCore = require('@ldesign/cropper-core');

exports.CropperComponent = class CropperComponent {
    constructor() {
        Object.defineProperty(this, "containerRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "src", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aspectRatio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "viewMode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dragMode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ready", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "cropstart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "cropmove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "cropend", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "crop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "zoom", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new core.EventEmitter()
        });
        Object.defineProperty(this, "cropper", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    ngOnInit() {
        this.initCropper();
    }
    ngOnDestroy() {
        this.cropper?.destroy();
    }
    initCropper() {
        const options = {
            ...this.options,
            src: this.src,
            aspectRatio: this.aspectRatio,
            viewMode: this.viewMode,
            dragMode: this.dragMode,
            ready: (e) => this.ready.emit(e),
            cropstart: (e) => this.cropstart.emit(e),
            cropmove: (e) => this.cropmove.emit(e),
            cropend: (e) => this.cropend.emit(e),
            crop: (e) => this.crop.emit(e),
            zoom: (e) => this.zoom.emit(e)
        };
        this.cropper = new cropperCore.Cropper(this.containerRef.nativeElement, options);
    }
    // Public API methods
    getCroppedCanvas(options) {
        return this.cropper?.getCroppedCanvas(options) ?? null;
    }
    getCropBoxData() {
        return this.cropper?.getCropBoxData() ?? null;
    }
    getImageData() {
        return this.cropper?.getImageData() ?? null;
    }
    setAspectRatio(aspectRatio) {
        this.cropper?.setAspectRatio(aspectRatio);
    }
    reset() {
        this.cropper?.reset();
    }
    clear() {
        this.cropper?.clear();
    }
    replace(url) {
        this.cropper?.replace(url);
    }
    destroy() {
        this.cropper?.destroy();
    }
    zoom(ratio) {
        this.cropper?.zoom(ratio);
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
};
tslib.__decorate([
    core.ViewChild('cropperContainer', { static: true }),
    tslib.__metadata("design:type", core.ElementRef)
], exports.CropperComponent.prototype, "containerRef", void 0);
tslib.__decorate([
    core.Input(),
    tslib.__metadata("design:type", String)
], exports.CropperComponent.prototype, "src", void 0);
tslib.__decorate([
    core.Input(),
    tslib.__metadata("design:type", Number)
], exports.CropperComponent.prototype, "aspectRatio", void 0);
tslib.__decorate([
    core.Input(),
    tslib.__metadata("design:type", Number)
], exports.CropperComponent.prototype, "viewMode", void 0);
tslib.__decorate([
    core.Input(),
    tslib.__metadata("design:type", String)
], exports.CropperComponent.prototype, "dragMode", void 0);
tslib.__decorate([
    core.Input(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "options", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "ready", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "cropstart", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "cropmove", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "cropend", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "crop", void 0);
tslib.__decorate([
    core.Output(),
    tslib.__metadata("design:type", Object)
], exports.CropperComponent.prototype, "zoom", void 0);
exports.CropperComponent = tslib.__decorate([
    core.Component({
        selector: 'l-cropper',
        standalone: true,
        template: `<div #cropperContainer class="cropper-container"></div>`,
        styleUrls: ['./cropper.component.css'],
        encapsulation: core.ViewEncapsulation.None
    })
], exports.CropperComponent);
/*! End of @ldesign/cropper-angular | Powered by @ldesign/builder */
//# sourceMappingURL=cropper.component.cjs.map
