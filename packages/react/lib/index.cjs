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

var Cropper = require('./Cropper.cjs');
var useCropper = require('./useCropper.cjs');
var cropperCore = require('@ldesign/cropper-core');



exports.Cropper = Cropper.Cropper;
exports.default = Cropper.Cropper;
exports.useCropper = useCropper.useCropper;
Object.keys(cropperCore).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return cropperCore[k]; }
	});
});
/*! End of @ldesign/cropper-react | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
