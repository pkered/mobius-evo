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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9pc2VjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7R0FJRzs7QUFXSCx5Q0FBeUM7QUFFekM7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQixTQUFTLENBQUMsU0FBa0IsRUFBRSxTQUFjLEVBQUUsU0FBYztJQUN4RSxzQkFBc0I7SUFDdEIscUNBQXFDO0lBQ3JDLGtFQUFrRTtJQUNsRSw0RUFBNEU7SUFDNUUsb0ZBQW9GO0lBQ3BGLGtFQUFrRTtJQUNsRSw0RUFBNEU7SUFDNUUsb0ZBQW9GO0lBQ3BGLHNCQUFzQjtJQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFBQyxPQUFPLElBQUksQ0FBQztBQUNwRCxDQUFDO0FBWEQsOEJBV0M7QUFDRCxpQ0FBaUM7QUFDakMsSUFBWSxXQUlYO0FBSkQsV0FBWSxXQUFXO0lBQ25CLGtEQUFvQyxDQUFBO0lBQ3BDLGtEQUFxQyxDQUFBO0lBQ3JDLG9DQUFzQixDQUFBO0FBQzFCLENBQUMsRUFKVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQUl0QjtBQUNEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQWdCLEtBQUssQ0FBQyxTQUFrQixFQUFFLFFBQWUsRUFBRSxLQUFhLEVBQUUsSUFBaUI7SUFDdkYsc0JBQXNCO0lBQ3RCLGlDQUFpQztJQUNqQyxzSUFBc0k7SUFDdEksbUVBQW1FO0lBQ25FLHNCQUFzQjtJQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFBQyxPQUFPLElBQUksQ0FBQztBQUNyRCxDQUFDO0FBUEQsc0JBT0M7QUFDRDs7Ozs7Ozs7R0FRRztBQUNILFNBQWdCLEtBQUssQ0FBQyxTQUFrQixFQUFFLFFBQWUsRUFBRSxRQUFhO0lBQ3BFLHNCQUFzQjtJQUN0QixpQ0FBaUM7SUFDakMscUhBQXFIO0lBQ3JILDJGQUEyRjtJQUMzRixzQkFBc0I7SUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQUMsT0FBTyxJQUFJLENBQUM7QUFDckQsQ0FBQztBQVBELHNCQU9DO0FBRUQsZ0JBQWdCIn0=