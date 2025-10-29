import { LitElement } from 'lit';
import { Cropper } from '@ldesign/cropper-core';
import type { CropBoxData, CropData } from '@ldesign/cropper-core';
export declare class CropperElement extends LitElement {
    static styles: import("lit").CSSResult;
    src: string;
    aspectRatio: number;
    viewMode: number;
    dragMode: 'crop' | 'move' | 'none';
    responsive: boolean;
    restore: boolean;
    checkCrossOrigin: boolean;
    checkOrientation: boolean;
    modal: boolean;
    guides: boolean;
    center: boolean;
    highlight: boolean;
    background: boolean;
    autoCrop: boolean;
    movable: boolean;
    rotatable: boolean;
    scalable: boolean;
    zoomable: boolean;
    zoomOnTouch: boolean;
    zoomOnWheel: boolean;
    wheelZoomRatio: number;
    cropBoxMovable: boolean;
    cropBoxResizable: boolean;
    private container;
    private cropper;
    protected firstUpdated(): void;
    disconnectedCallback(): void;
    private initCropper;
    protected updated(changedProperties: Map<string | number | symbol, unknown>): void;
    getCropper(): Cropper | null;
    getCropBoxData(): CropBoxData | null;
    setCropBoxData(data: Partial<CropBoxData>): void;
    getData(rounded?: boolean): CropData | null;
    getCroppedCanvas(options?: any): HTMLCanvasElement | null;
    replace(src: string): Promise<void>;
    reset(): void;
    clear(): void;
    rotate(degree: number): void;
    scale(scaleX: number, scaleY?: number): void;
    move(offsetX: number, offsetY?: number): void;
    zoom(ratio: number): void;
    enable(): void;
    disable(): void;
    destroy(): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'l-cropper': CropperElement;
    }
}
