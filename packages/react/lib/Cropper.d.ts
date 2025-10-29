import React from 'react';
import { Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core';
import type { CropBoxData, CropData } from '@ldesign/cropper-core';
import '@ldesign/cropper-core/style.css';
export interface CropperProps extends CropperOptions {
    onReady?: (event: CustomEvent) => void;
    onCropStart?: (event: CustomEvent) => void;
    onCropMove?: (event: CustomEvent) => void;
    onCropEnd?: (event: CustomEvent) => void;
    onCrop?: (event: CustomEvent) => void;
    onZoom?: (event: CustomEvent) => void;
    style?: React.CSSProperties;
    className?: string;
}
export interface CropperRef {
    getCropper: () => CropperCore | null;
    getCropBoxData: () => CropBoxData | null;
    setCropBoxData: (data: Partial<CropBoxData>) => void;
    getData: (rounded?: boolean) => CropData | null;
    getCroppedCanvas: (options?: any) => HTMLCanvasElement | null;
    replace: (src: string) => Promise<void>;
    reset: () => void;
    clear: () => void;
    rotate: (degree: number) => void;
    scale: (scaleX: number, scaleY?: number) => void;
    move: (offsetX: number, offsetY?: number) => void;
    zoom: (ratio: number) => void;
    enable: () => void;
    disable: () => void;
    destroy: () => void;
}
export declare const Cropper: React.ForwardRefExoticComponent<CropperProps & React.RefAttributes<CropperRef>>;
export default Cropper;
