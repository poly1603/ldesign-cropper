/*!
 * ***********************************
 * @ldesign/cropper-react v2.0.0   *
 * Built with rollup               *
 * Build time: 2024-10-29 10:32:02 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { jsx } from 'react/jsx-runtime';
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { Cropper as Cropper$1 } from '@ldesign/cropper-core';
import '@ldesign/cropper-core/style.css';

const Cropper = forwardRef((props, ref) => {
  const { onReady, onCropStart, onCropMove, onCropEnd, onCrop, onZoom, style, className, ...cropperOptions } = props;
  const containerRef = useRef(null);
  const cropperRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current)
      return;
    const options = {
      ...cropperOptions,
      ready: (e) => {
        onReady?.(e);
        if (cropperOptions.ready)
          cropperOptions.ready(e);
      },
      cropstart: (e) => {
        onCropStart?.(e);
        if (cropperOptions.cropstart)
          cropperOptions.cropstart(e);
      },
      cropmove: (e) => {
        onCropMove?.(e);
        if (cropperOptions.cropmove)
          cropperOptions.cropmove(e);
      },
      cropend: (e) => {
        onCropEnd?.(e);
        if (cropperOptions.cropend)
          cropperOptions.cropend(e);
      },
      crop: (e) => {
        onCrop?.(e);
        if (cropperOptions.crop)
          cropperOptions.crop(e);
      },
      zoom: (e) => {
        onZoom?.(e);
        if (cropperOptions.zoom)
          cropperOptions.zoom(e);
      }
    };
    cropperRef.current = new Cropper$1(containerRef.current, options);
    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (props.src && cropperRef.current) {
      cropperRef.current.replace(props.src);
    }
  }, [props.src]);
  useImperativeHandle(ref, () => ({
    getCropper: () => cropperRef.current,
    getCropBoxData: () => cropperRef.current?.getCropBoxData() || null,
    setCropBoxData: (data) => {
      cropperRef.current?.setCropBoxData(data);
    },
    getData: (rounded) => cropperRef.current?.getData(rounded) || null,
    getCroppedCanvas: (options) => cropperRef.current?.getCroppedCanvas(options) || null,
    replace: async (src) => {
      await cropperRef.current?.replace(src);
    },
    reset: () => cropperRef.current?.reset(),
    clear: () => cropperRef.current?.clear(),
    rotate: (degree) => cropperRef.current?.rotate(degree),
    scale: (scaleX, scaleY) => cropperRef.current?.scale(scaleX, scaleY),
    move: (offsetX, offsetY) => cropperRef.current?.move(offsetX, offsetY),
    zoom: (ratio) => cropperRef.current?.zoom(ratio),
    enable: () => cropperRef.current?.enable(),
    disable: () => cropperRef.current?.disable(),
    destroy: () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    }
  }));
  return jsx("div", { ref: containerRef, className: `cropper-container ${className || ""}`, style });
});
Cropper.displayName = "Cropper";

export { Cropper, Cropper as default };
/*! End of @ldesign/cropper-react | Powered by @ldesign/builder */
//# sourceMappingURL=Cropper.js.map
