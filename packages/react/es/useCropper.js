/*!
 * ***********************************
 * @ldesign/cropper-react v2.0.0   *
 * Built with rollup               *
 * Build time: 2024-10-29 10:32:02 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { Cropper } from '@ldesign/cropper-core';

function useCropper(options = {}) {
  const containerRef = useRef(null);
  const [cropper, setCropper] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!containerRef.current)
      return;
    const { onReady, ...cropperOptions } = options;
    const instance = new Cropper(containerRef.current, {
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
  const getCropBoxData = useCallback(() => {
    return cropper?.getCropBoxData() || null;
  }, [cropper]);
  const setCropBoxData = useCallback((data) => {
    cropper?.setCropBoxData(data);
  }, [cropper]);
  const getData = useCallback((rounded) => {
    return cropper?.getData(rounded) || null;
  }, [cropper]);
  const getCroppedCanvas = useCallback((options2) => {
    return cropper?.getCroppedCanvas(options2) || null;
  }, [cropper]);
  const replace = useCallback(async (src) => {
    await cropper?.replace(src);
  }, [cropper]);
  const reset = useCallback(() => {
    cropper?.reset();
  }, [cropper]);
  const clear = useCallback(() => {
    cropper?.clear();
  }, [cropper]);
  const rotate = useCallback((degree) => {
    cropper?.rotate(degree);
  }, [cropper]);
  const scale = useCallback((scaleX, scaleY) => {
    cropper?.scale(scaleX, scaleY);
  }, [cropper]);
  const move = useCallback((offsetX, offsetY) => {
    cropper?.move(offsetX, offsetY);
  }, [cropper]);
  const zoom = useCallback((ratio) => {
    cropper?.zoom(ratio);
  }, [cropper]);
  const enable = useCallback(() => {
    cropper?.enable();
  }, [cropper]);
  const disable = useCallback(() => {
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

export { useCropper };
/*! End of @ldesign/cropper-react | Powered by @ldesign/builder */
//# sourceMappingURL=useCropper.js.map
