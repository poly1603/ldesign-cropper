import { type Component, type JSX } from 'solid-js';
import { Cropper as CropperCore, type CropperOptions } from '@ldesign/cropper-core';
export interface CropperProps {
    src?: string;
    aspectRatio?: number;
    viewMode?: 0 | 1 | 2 | 3;
    dragMode?: 'crop' | 'move' | 'none';
    options?: CropperOptions;
    onReady?: (event: CustomEvent) => void;
    onCropstart?: (event: CustomEvent) => void;
    onCropmove?: (event: CustomEvent) => void;
    onCropend?: (event: CustomEvent) => void;
    onCrop?: (event: CustomEvent) => void;
    onZoom?: (event: CustomEvent) => void;
    class?: string;
    style?: JSX.CSSProperties;
}
export declare const Cropper: Component<CropperProps>;
export declare function useCropper(): {
    cropper: import("solid-js").Accessor<CropperCore | undefined>;
    initCropper: (element: HTMLElement, options: CropperOptions) => CropperCore;
    destroyCropper: () => void;
};
