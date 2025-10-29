/*!
 * ***********************************
 * @ldesign/cropper-react v2.0.0   *
 * Built with rollup               *
 * Build time: 2024-10-29 10:32:02 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var cropperCore = require('@ldesign/cropper-core');
require('@ldesign/cropper-core/style.css');

const Cropper = react.forwardRef((props, ref) => {
  const { onReady, onCropStart, onCropMove, onCropEnd, onCrop, onZoom, style, className, ...cropperOptions } = props;
  const containerRef = react.useRef(null);
  const cropperRef = react.useRef(null);
  react.useEffect(() => {
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
    cropperRef.current = new cropperCore.Cropper(containerRef.current, options);
    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, []);
  react.useEffect(() => {
    if (props.src && cropperRef.current) {
      cropperRef.current.replace(props.src);
    }
  }, [props.src]);
  react.useImperativeHandle(ref, () => ({
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
  return jsxRuntime.jsx("div", { ref: containerRef, className: `cropper-container ${className || ""}`, style });
});
Cropper.displayName = "Cropper";

exports.Cropper = Cropper;
exports.default = Cropper;
/*! End of @ldesign/cropper-react | Powered by @ldesign/builder */
//# sourceMappingURL=Cropper.cjs.map
