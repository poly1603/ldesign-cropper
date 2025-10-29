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

var react = require('react');
var cropperCore = require('@ldesign/cropper-core');

function useCropper(options = {}) {
  const containerRef = react.useRef(null);
  const [cropper, setCropper] = react.useState(null);
  const [ready, setReady] = react.useState(false);
  react.useEffect(() => {
    if (!containerRef.current)
      return;
    const { onReady, ...cropperOptions } = options;
    const instance = new cropperCore.Cropper(containerRef.current, {
      ...cropperOptions,
      ready: (e) => {
        setReady(true);
        onReady?.(instance);
        if (cropperOptions.ready) {
          cropperOptions.ready(e);
        }
      }
    });
    setCropper(instance);
    return () => {
      instance.destroy();
      setCropper(null);
      setReady(false);
    };
  }, []);
  const getCropBoxData = react.useCallback(() => {
    return cropper?.getCropBoxData() || null;
  }, [cropper]);
  const setCropBoxData = react.useCallback((data) => {
    cropper?.setCropBoxData(data);
  }, [cropper]);
  const getData = react.useCallback((rounded) => {
    return cropper?.getData(rounded) || null;
  }, [cropper]);
  const getCroppedCanvas = react.useCallback((options2) => {
    return cropper?.getCroppedCanvas(options2) || null;
  }, [cropper]);
  const replace = react.useCallback(async (src) => {
    await cropper?.replace(src);
  }, [cropper]);
  const reset = react.useCallback(() => {
    cropper?.reset();
  }, [cropper]);
  const clear = react.useCallback(() => {
    cropper?.clear();
  }, [cropper]);
  const rotate = react.useCallback((degree) => {
    cropper?.rotate(degree);
  }, [cropper]);
  const scale = react.useCallback((scaleX, scaleY) => {
    cropper?.scale(scaleX, scaleY);
  }, [cropper]);
  const move = react.useCallback((offsetX, offsetY) => {
    cropper?.move(offsetX, offsetY);
  }, [cropper]);
  const zoom = react.useCallback((ratio) => {
    cropper?.zoom(ratio);
  }, [cropper]);
  const enable = react.useCallback(() => {
    cropper?.enable();
  }, [cropper]);
  const disable = react.useCallback(() => {
    cropper?.disable();
  }, [cropper]);
  return {
    containerRef,
    cropper,
    ready,
    getCropBoxData,
    setCropBoxData,
    getData,
    getCroppedCanvas,
    replace,
    reset,
    clear,
    rotate,
    scale,
    move,
    zoom,
    enable,
    disable
  };
}

exports.useCropper = useCropper;
/*! End of @ldesign/cropper-react | Powered by @ldesign/builder */
//# sourceMappingURL=useCropper.cjs.map
