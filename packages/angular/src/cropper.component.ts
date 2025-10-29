import type {
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core'
import type { CropBoxData, CropperOptions, ImageData } from '@ldesign/cropper-core'
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { Cropper as CropperCore } from '@ldesign/cropper-core'

@Component({
  selector: 'l-cropper',
  standalone: true,
  template: `<div #cropperContainer class="cropper-container"></div>`,
  styleUrls: ['./cropper.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CropperComponent implements OnInit, OnDestroy {
  @ViewChild('cropperContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>

  @Input() src?: string
  @Input() aspectRatio?: number
  @Input() viewMode?: 0 | 1 | 2 | 3
  @Input() dragMode?: 'crop' | 'move' | 'none'
  @Input() options?: CropperOptions

  @Output() ready = new EventEmitter<CustomEvent>()
  @Output() cropstart = new EventEmitter<CustomEvent>()
  @Output() cropmove = new EventEmitter<CustomEvent>()
  @Output() cropend = new EventEmitter<CustomEvent>()
  @Output() crop = new EventEmitter<CustomEvent>()
  @Output() zoom = new EventEmitter<CustomEvent>()

  private cropper?: CropperCore

  ngOnInit(): void {
    this.initCropper()
  }

  ngOnDestroy(): void {
    this.cropper?.destroy()
  }

  private initCropper(): void {
    const options: CropperOptions = {
      ...this.options,
      src: this.src,
      aspectRatio: this.aspectRatio,
      viewMode: this.viewMode,
      dragMode: this.dragMode,
      ready: e => this.ready.emit(e),
      cropstart: e => this.cropstart.emit(e),
      cropmove: e => this.cropmove.emit(e),
      cropend: e => this.cropend.emit(e),
      crop: e => this.crop.emit(e),
      zoom: e => this.zoom.emit(e),
    }

    this.cropper = new CropperCore(this.containerRef.nativeElement, options)
  }

  // Public API methods
  getCroppedCanvas(options?: any): HTMLCanvasElement | null {
    return this.cropper?.getCroppedCanvas(options) ?? null
  }

  getCropBoxData(): CropBoxData | null {
    return this.cropper?.getCropBoxData() ?? null
  }

  getImageData(): ImageData | null {
    return this.cropper?.getImageData() ?? null
  }

  setAspectRatio(aspectRatio: number): void {
    this.cropper?.setAspectRatio(aspectRatio)
  }

  reset(): void {
    this.cropper?.reset()
  }

  clear(): void {
    this.cropper?.clear()
  }

  replace(url: string): void {
    this.cropper?.replace(url)
  }

  destroy(): void {
    this.cropper?.destroy()
  }

  zoom(ratio: number): void {
    this.cropper?.zoom(ratio)
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
}
