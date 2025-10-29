import { Cropper, type CropperOptions } from '@ldesign/cropper-core';
import type { CropBoxData, CropData } from '@ldesign/cropper-core';
export interface UseCropperOptions extends CropperOptions {
    onReady?: (cropper: Cropper) => void;
}
export interface UseCropperReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    cropper: Cropper | null;
    ready: boolean;
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
}
export declare function useCropper(options?: UseCropperOptions): UseCropperReturn;
