"use strict";
/**
 * The `isect` module has functions for performing intersections between entities in the model.
 * These functions may make new entities, and may modify existing entities, depending on the function that is selected.
 * If new entities are created, then the function will return the IDs of those entities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// import { __merge__ } from '../_model';
/**
 * Adds positions by intersecting polylines, planes, and polygons.
 * @param __model__
 * @param entities1 First polyline, plane, face, or polygon.
 * @param entities2 Second polyline, plane face, or polygon.
 * @returns List of positions.
 * @example intersect1 = isect.Intersect (object1, object2)
 * @example_info Returns a list of positions at the intersections between both objects.
 */
function Intersect(__model__, entities1, entities2) {
    // --- Error Check ---
    // const fn_name = 'isect.Intersect';
    // const ents_arr_1 = checkIDnTypes(fn_name, 'object1', entities1,
    //                                  [IDcheckObj.isID, TypeCheckObj.isPlane],
    //                                  [EEntType.PLINE, EEntType.PGON, EEntType.FACE]);
    // const ents_arr_2 = checkIDnTypes(fn_name, 'object2', entities2,
    //                                  [IDcheckObj.isID, TypeCheckObj.isPlane],
    //                                  [EEntType.PLINE, EEntType.PGON, EEntType.FACE]);
    // --- Error Check ---
    throw new Error('Not impemented.');
    return null;
}
exports.Intersect = Intersect;
// Knife modelling operation keep
var _EKnifeKeep;
(function (_EKnifeKeep) {
    _EKnifeKeep["KEEP_ABOVE"] = "keep above the plane";
    _EKnifeKeep["KEEP_BELOW"] = "keep below the plane";
    _EKnifeKeep["KEEP_ALL"] = "keep all";
})(_EKnifeKeep = exports._EKnifeKeep || (exports._EKnifeKeep = {}));
/**
 * Separates a list of points, polylines or polygons into two lists with a plane.
 * @param __model__
 * @param geometry List of points, polylines or polygons.
 * @param plane Knife.
 * @param keep Keep above, keep below, or keep both lists of separated points, polylines or polygons.
 * @returns List, or list of two lists, of points, polylines or polygons.
 * @example knife1 = isect.Knife ([p1,p2,p3,p4,p5], plane1, keepabove)
 * @example_info Returns [[p1,p2,p3],[p4,p5]] if p1, p2, p3 are points above the plane and p4, p5 are points below the plane.
 */
function Knife(__model__, geometry, plane, keep) {
    // --- Error Check ---
    // const fn_name = 'isect.Knife';
    // const ents_arr = checkIDs(__model__, fn_name, 'geometry', geometry, ['isIDList'], [EEntType.POINT, EEntType.PLINE, EEntType.PGON]);
    // checkCommTypes(fn_name, 'plane', plane, [TypeCheckObj.isPlane]);
    // --- Error Check ---
    throw new Error('Not implemented.');
    return null;
}
exports.Knife = Knife;
/**
 * Splits a polyline or polygon with a polyline.
 * @param __model__
 * @param geometry A list of polylines or polygons to be split.
 * @param polyline Splitter.
 * @returns List of two lists containing polylines or polygons.
 * @example splitresult = isect.Split (pl1, pl2)
 * @example_info Returns [[pl1A],[pl1B]], where pl1A and pl1B are polylines resulting from the split occurring where pl1 and pl2 intersect.
 */
function Split(__model__, geometry, polyline) {
    // --- Error Check ---
    // const fn_name = 'isect.Split';
    // const ents_arr = checkIDs(__model__, fn_name, 'objects', geometry, ['isIDList'], [EEntType.PLINE, EEntType.PGON]);
    // checkIDs(__model__, fn_name, 'polyline', polyline, [IDcheckObj.isID], [EEntType.PLINE]);
    // --- Error Check ---
    throw new Error('Not implemented.');
    return null;
}
exports.Split = Split;
// Ray and plane
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cy9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL2lzZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOztBQVdILHlDQUF5QztBQUV6Qzs7Ozs7Ozs7R0FRRztBQUNILFNBQWdCLFNBQVMsQ0FBQyxTQUFrQixFQUFFLFNBQWMsRUFBRSxTQUFjO0lBQ3hFLHNCQUFzQjtJQUN0QixxQ0FBcUM7SUFDckMsa0VBQWtFO0lBQ2xFLDRFQUE0RTtJQUM1RSxvRkFBb0Y7SUFDcEYsa0VBQWtFO0lBQ2xFLDRFQUE0RTtJQUM1RSxvRkFBb0Y7SUFDcEYsc0JBQXNCO0lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ3BELENBQUM7QUFYRCw4QkFXQztBQUNELGlDQUFpQztBQUNqQyxJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDbkIsa0RBQW9DLENBQUE7SUFDcEMsa0RBQXFDLENBQUE7SUFDckMsb0NBQXNCLENBQUE7QUFDMUIsQ0FBQyxFQUpXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBSXRCO0FBQ0Q7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLFNBQWtCLEVBQUUsUUFBZSxFQUFFLEtBQWEsRUFBRSxJQUFpQjtJQUN2RixzQkFBc0I7SUFDdEIsaUNBQWlDO0lBQ2pDLHNJQUFzSTtJQUN0SSxtRUFBbUU7SUFDbkUsc0JBQXNCO0lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUFDLE9BQU8sSUFBSSxDQUFDO0FBQ3JELENBQUM7QUFQRCxzQkFPQztBQUNEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLFNBQWtCLEVBQUUsUUFBZSxFQUFFLFFBQWE7SUFDcEUsc0JBQXNCO0lBQ3RCLGlDQUFpQztJQUNqQyxxSEFBcUg7SUFDckgsMkZBQTJGO0lBQzNGLHNCQUFzQjtJQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFBQyxPQUFPLElBQUksQ0FBQztBQUNyRCxDQUFDO0FBUEQsc0JBT0M7QUFFRCxnQkFBZ0IifQ==