/*!
 * ***********************************
 * @ldesign/cropper-solid v2.0.0   *
 * Built with rollup               *
 * Build time: 2024-10-29 10:24:42 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
"use strict";var r=require("solid-js/web"),e=require("solid-js"),o=require("@ldesign/cropper-core"),t=r.template("<div style=min-height:400px>");exports.Cropper=i=>{let n,s;const[p,c]=e.createSignal(!1);return e.onMount(()=>{if(n){const r={...i.options,src:i.src,aspectRatio:i.aspectRatio,viewMode:i.viewMode,dragMode:i.dragMode,ready:r=>{c(!0),i.onReady?.(r)},cropstart:i.onCropstart,cropmove:i.onCropmove,cropend:i.onCropend,crop:i.onCrop,zoom:i.onZoom};s=new o.Cropper(n,r)}}),e.createEffect(()=>{s&&void 0!==i.aspectRatio&&s.setAspectRatio(i.aspectRatio)}),e.createEffect(()=>{s&&i.src&&s.replace(i.src)}),e.onCleanup(()=>{s?.destroy()}),d=t(),"function"==typeof(u=n)?r.use(u,d):n=d,r.effect(e=>{var o=i.class,t={width:"100%",height:"100%",...i.style};return o!==e.e&&r.className(d,e.e=o),e.t=r.style(d,t,e.t),e},{e:void 0,t:void 0}),d;var d,u},exports.useCropper=function(){const[r,t]=e.createSignal(),i=()=>{r()?.destroy(),t(void 0)};return e.onCleanup(()=>{i()}),{cropper:r,initCropper:(r,e)=>{const i=new o.Cropper(r,e);return t(i),i},destroyCropper:i}};
/*! End of @ldesign/cropper-solid | Powered by @ldesign/builder */
//# sourceMappingURL=Cropper.cjs.map
