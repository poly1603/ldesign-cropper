/*!
 * ***********************************
 * @ldesign/cropper-angular v2.0.0 *
 * Built with rollup               *
 * Build time: 2024-10-29 12:35:24 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var cropper_component = require('./cropper.component.cjs');
var cropperCore = require('@ldesign/cropper-core');



Object.defineProperty(exports, "CropperComponent", {
	enumerable: true,
	get: function () { return cropper_component.CropperComponent; }
});
Object.keys(cropperCore).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return cropperCore[k]; }
	});
});
/*! End of @ldesign/cropper-angular | Powered by @ldesign/builder */
//# sourceMappingURL=index.cjs.map
