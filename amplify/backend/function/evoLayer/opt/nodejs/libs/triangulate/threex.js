"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const three = __importStar(require("three"));
const EPS = 1e-6;
/**
 * Utility functions for threejs.
 */
// Matrices ======================================================================================================
function multVectorMatrix(v, m) {
    const v2 = v.clone();
    v2.applyMatrix4(m);
    return v2;
}
exports.multVectorMatrix = multVectorMatrix;
function xformMatrix(o, x, y, z) {
    x.normalize();
    y.normalize();
    z.normalize();
    const m1 = new three.Matrix4();
    const o_neg = o.clone().negate();
    m1.setPosition(o_neg);
    const m2 = new three.Matrix4();
    m2.makeBasis(x, y, z);
    m2.getInverse(m2);
    const m3 = new three.Matrix4();
    m3.multiplyMatrices(m2, m1);
    return m3;
}
exports.xformMatrix = xformMatrix;
function matrixInv(m) {
    const m2 = new three.Matrix4();
    return m2.getInverse(m);
}
exports.matrixInv = matrixInv;
//  Vectors =======================================================================================================
function subVectors(v1, v2, norm = false) {
    const v3 = new three.Vector3();
    v3.subVectors(v1, v2);
    if (norm) {
        v3.normalize();
    }
    return v3;
}
exports.subVectors = subVectors;
function addVectors(v1, v2, norm = false) {
    const v3 = new three.Vector3();
    v3.addVectors(v1, v2);
    if (norm) {
        v3.normalize();
    }
    return v3;
}
exports.addVectors = addVectors;
function crossVectors(v1, v2, norm = false) {
    const v3 = new three.Vector3();
    v3.crossVectors(v1, v2);
    if (norm) {
        v3.normalize();
    }
    return v3;
}
exports.crossVectors = crossVectors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9saWJzL3RyaWFuZ3VsYXRlL3RocmVleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw2Q0FBK0I7QUFFL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2pCOztHQUVHO0FBRUYsa0hBQWtIO0FBRW5ILFNBQWdCLGdCQUFnQixDQUFDLENBQWdCLEVBQUUsQ0FBZ0I7SUFDL0QsTUFBTSxFQUFFLEdBQWtCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQUpELDRDQUlDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLENBQWdCLEVBQUUsQ0FBZ0IsRUFBRSxDQUFnQixFQUFFLENBQWdCO0lBQzlGLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNkLE1BQU0sRUFBRSxHQUFrQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QyxNQUFNLEtBQUssR0FBa0IsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hELEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEIsTUFBTSxFQUFFLEdBQWtCLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0QixFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sRUFBRSxHQUFrQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQztBQWJELGtDQWFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLENBQWdCO0lBQ3RDLE1BQU0sRUFBRSxHQUFrQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM5QyxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUhELDhCQUdDO0FBRUQsbUhBQW1IO0FBRW5ILFNBQWdCLFVBQVUsQ0FBQyxFQUFpQixFQUFFLEVBQWlCLEVBQUUsT0FBZ0IsS0FBSztJQUNsRixNQUFNLEVBQUUsR0FBa0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEIsSUFBSSxJQUFJLEVBQUU7UUFBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7S0FBRTtJQUM1QixPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUM7QUFMRCxnQ0FLQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxFQUFpQixFQUFFLEVBQWlCLEVBQUUsT0FBZ0IsS0FBSztJQUNsRixNQUFNLEVBQUUsR0FBa0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEIsSUFBSSxJQUFJLEVBQUU7UUFBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7S0FBRTtJQUM1QixPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUM7QUFMRCxnQ0FLQztBQUVELFNBQWdCLFlBQVksQ0FBQyxFQUFpQixFQUFFLEVBQWlCLEVBQUUsT0FBZ0IsS0FBSztJQUNwRixNQUFNLEVBQUUsR0FBa0IsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEIsSUFBSSxJQUFJLEVBQUU7UUFBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7S0FBRTtJQUM1QixPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUM7QUFMRCxvQ0FLQyJ9