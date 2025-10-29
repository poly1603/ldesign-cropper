/*!
 * ***********************************
 * @ldesign/cropper-lit v2.0.0     *
 * Built with rollup               *
 * Build time: 2024-10-29 10:32:34 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var cropperElement = require('./cropper-element.cjs');
var cropperCore = require('@ldesign/cropper-core');



Object.defineProperty(exports, "CropperElement", {
	enumerable: true,
	get: function () { return cropperElement.CropperElement; }
});
Object.keys(cropperCore).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return cropperCore[k]; }
	});
});
/*! End of @ldesign/cropper-lit | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
