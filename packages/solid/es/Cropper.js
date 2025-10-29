/*!
 * ***********************************
 * @ldesign/cropper-solid v2.0.0   *
 * Built with rollup               *
 * Build time: 2024-10-29 10:24:42 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import{template as o,effect as r,className as e,style as t,use as i}from"solid-js/web";import{createSignal as p,onMount as n,createEffect as c,onCleanup as s}from"solid-js";import{Cropper as d}from"@ldesign/cropper-core";var v=o("<div style=min-height:400px>");const a=o=>{let a,m;const[f,u]=p(!1);return n(()=>{if(a){const r={...o.options,src:o.src,aspectRatio:o.aspectRatio,viewMode:o.viewMode,dragMode:o.dragMode,ready:r=>{u(!0),o.onReady?.(r)},cropstart:o.onCropstart,cropmove:o.onCropmove,cropend:o.onCropend,crop:o.onCrop,zoom:o.onZoom};m=new d(a,r)}}),c(()=>{m&&void 0!==o.aspectRatio&&m.setAspectRatio(o.aspectRatio)}),c(()=>{m&&o.src&&m.replace(o.src)}),s(()=>{m?.destroy()}),h=v(),"function"==typeof a?i(a,h):a=h,r(r=>{var i=o.class,p={width:"100%",height:"100%",...o.style};return i!==r.e&&e(h,r.e=i),r.t=t(h,p,r.t),r},{e:void 0,t:void 0}),h;var h};function m(){const[o,r]=p(),e=()=>{o()?.destroy(),r(void 0)};return s(()=>{e()}),{cropper:o,initCropper:(o,e)=>{const t=new d(o,e);return r(t),t},destroyCropper:e}}export{a as Cropper,m as useCropper};
/*! End of @ldesign/cropper-solid | Powered by @ldesign/builder */
//# sourceMappingURL=Cropper.js.map
