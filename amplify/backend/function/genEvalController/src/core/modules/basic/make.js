"use strict";
/**
 * The `make` module has functions for making new entities in the model.
 * All these functions return the IDs of the entities that are created.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const _check_ids_1 = require("../../_check_ids");
const chk = __importStar(require("../../_check_types"));
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
// Enums
var _EClose;
(function (_EClose) {
    _EClose["OPEN"] = "open";
    _EClose["CLOSE"] = "close";
})(_EClose = exports._EClose || (exports._EClose = {}));
var _ELoftMethod;
(function (_ELoftMethod) {
    _ELoftMethod["OPEN_QUADS"] = "open_quads";
    _ELoftMethod["CLOSED_QUADS"] = "closed_quads";
    _ELoftMethod["OPEN_STRINGERS"] = "open_stringers";
    _ELoftMethod["CLOSED_STRINGERS"] = "closed_stringers";
    _ELoftMethod["OPEN_RIBS"] = "open_ribs";
    _ELoftMethod["CLOSED_RIBS"] = "closed_ribs";
    _ELoftMethod["COPIES"] = "copies";
})(_ELoftMethod = exports._ELoftMethod || (exports._ELoftMethod = {}));
var _EExtrudeMethod;
(function (_EExtrudeMethod) {
    _EExtrudeMethod["QUADS"] = "quads";
    _EExtrudeMethod["STRINGERS"] = "stringers";
    _EExtrudeMethod["RIBS"] = "ribs";
    _EExtrudeMethod["COPIES"] = "copies";
})(_EExtrudeMethod = exports._EExtrudeMethod || (exports._EExtrudeMethod = {}));
var _ECutMethod;
(function (_ECutMethod) {
    _ECutMethod["KEEP_ABOVE"] = "keep_above";
    _ECutMethod["KEEP_BELOW"] = "keep_below";
    _ECutMethod["KEEP_BOTH"] = "keep_both";
})(_ECutMethod = exports._ECutMethod || (exports._ECutMethod = {}));
// ================================================================================================
/**
 * Adds one or more new position to the model.
 *
 * @param __model__
 * @param coords A list of three numbers, or a list of lists of three numbers.
 * @returns A new position, or nested list of new positions.
 * @example position1 = make.Position([1,2,3])
 * @example_info Creates a position with coordinates x=1, y=2, z=3.
 * @example positions = make.Position([[1,2,3],[3,4,5],[5,6,7]])
 * @example_info Creates three positions, with coordinates [1,2,3],[3,4,5] and [5,6,7].
 * @example_link make.Position.mob&node=1
 */
function Position(__model__, coords) {
    if (arrs_1.isEmptyArr(coords)) {
        return [];
    }
    // --- Error Check ---
    if (__model__.debug) {
        chk.checkArgs('make.Position', 'coords', coords, [chk.isXYZ, chk.isXYZL, chk.isXYZLL]);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.position(coords);
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Position = Position;
// ================================================================================================
/**
 * Adds one or more new points to the model.
 *
 * @param __model__
 * @param entities Position, or list of positions, or entities from which positions can be extracted.
 * @returns Entities, new point or a list of new points.
 * @example point1 = make.Point(position1)
 * @example_info Creates a point at position1.
 * @example_link make.Point.mob&node=1
 */
function Point(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, 'make.Point', 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.VERT, common_1.EEntType.EDGE, common_1.EEntType.WIRE,
            common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.point(ents_arr);
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Point = Point;
// ================================================================================================
/**
 * Adds one or more new polylines to the model.
 *
 * @param __model__
 * @param entities List or nested lists of positions, or entities from which positions can be extracted.
 * @param close Enum, 'open' or 'close'.
 * @returns Entities, new polyline, or a list of new polylines.
 * @example polyline1 = make.Polyline([position1,position2,position3], close)
 * @example_info Creates a closed polyline with vertices position1, position2, position3 in sequence.
 * @example_link make.Polyline.mob&node=1
 */
function Polyline(__model__, entities, close) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, 'make.Polyline', 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.VERT, common_1.EEntType.EDGE, common_1.EEntType.WIRE,
            common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.polyline(ents_arr, close);
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 1 || (depth === 2 && ents_arr[0][0] === common_1.EEntType.POSI)) {
        const first_ent = new_ents_arr[0];
        return common_id_funcs_1.idsMake(first_ent);
    }
    else {
        return common_id_funcs_1.idsMake(new_ents_arr);
    }
}
exports.Polyline = Polyline;
// ================================================================================================
/**
 * Adds one or more new polygons to the model.
 *
 * @param __model__
 * @param entities List or nested lists of positions, or entities from which positions can be extracted.
 * @returns Entities, new polygon, or a list of new polygons.
 * @example polygon1 = make.Polygon([pos1,pos2,pos3])
 * @example_info Creates a polygon with vertices pos1, pos2, pos3 in sequence.
 * @example polygons = make.Polygon([[pos1,pos2,pos3], [pos3,pos4,pos5]])
 * @example_info Creates two polygons, the first with vertices at [pos1,pos2,pos3], and the second with vertices at [pos3,pos4,pos5].
 * @example_link make.Polygon.mob&node=1
 */
function Polygon(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, 'make.Polygon', 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.polygon(ents_arr);
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 1 || (depth === 2 && ents_arr[0][0] === common_1.EEntType.POSI)) {
        const first_ent = new_ents_arr[0];
        return common_id_funcs_1.idsMake(first_ent);
    }
    else {
        return common_id_funcs_1.idsMake(new_ents_arr);
    }
}
exports.Polygon = Polygon;
// ================================================================================================
/**
 * Lofts between entities.
 *
 * The geometry that is generated depends on the method that is selected.
 * - The 'quads' methods will generate polygons.
 * - The 'stringers' and 'ribs' methods will generate polylines.
 * - The 'copies' method will generate copies of the input geometry type.
 *
 * @param __model__
 * @param entities List of entities, or list of lists of entities.
 * @param method Enum, if 'closed', then close the loft back to the first entity in the list.
 * @returns Entities, a list of new polygons or polylines resulting from the loft.
 * @example quads = make.Loft([polyline1,polyline2,polyline3], 1, 'open_quads')
 * @example_info Creates quad polygons lofting between polyline1, polyline2, polyline3.
 * @example quads = make.Loft([polyline1,polyline2,polyline3], 1, 'closed_quads')
 * @example_info Creates quad polygons lofting between polyline1, polyline2, polyline3, and back to polyline1.
 * @example quads = make.Loft([ [polyline1,polyline2], [polyline3,polyline4] ] , 1, 'open_quads')
 * @example_info Creates quad polygons lofting first between polyline1 and polyline2, and then between polyline3 and polyline4.
 */
function Loft(__model__, entities, divisions, method) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, 'make.Loft', 'entities', entities, [_check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.loft(ents_arr, divisions, method);
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Loft = Loft;
// ================================================================================================
/**
 * Extrudes geometry by distance or by vector.
 * - Extrusion of a position, vertex, or point produces polylines;
 * - Extrusion of an edge, wire, or polyline produces polygons;
 * - Extrusion of a face or polygon produces polygons, capped at the top.
 *
 *
 * The geometry that is generated depends on the method that is selected.
 * - The 'quads' methods will generate polygons.
 * - The 'stringers' and 'ribs' methods will generate polylines.
 * - The 'copies' method will generate copies of the input geometry type.
 *
 * @param __model__
 * @param entities A list of entities, can be any type of entitiy.
 * @param dist Number or vector. If number, assumed to be [0,0,value] (i.e. extrusion distance in z-direction).
 * @param divisions Number of divisions to divide extrusion by. Minimum is 1.
 * @param method Enum, when extruding edges, select quads, stringers, or ribs
 * @returns Entities, a list of new polygons or polylines resulting from the extrude.
 * @example extrusion1 = make.Extrude(point1, 10, 2, 'quads')
 * @example_info Creates a polyline of total length 10 (with two edges of length 5 each) in the z-direction.
 * In this case, the 'quads' setting is ignored.
 * @example extrusion2 = make.Extrude(polygon1, [0,5,0], 1, 'quads')
 * @example_info Extrudes polygon1 by 5 in the y-direction, creating a list of quad surfaces.
 */
function Extrude(__model__, entities, dist, divisions, method) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = Array.isArray(entities) ? arrs_1.arrMakeFlat(entities) : entities;
    // --- Error Check ---
    const fn_name = 'make.Extrude';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.VERT, common_1.EEntType.EDGE, common_1.EEntType.WIRE,
            common_1.EEntType.POSI, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
        chk.checkArgs(fn_name, 'dist', dist, [chk.isNum, chk.isXYZ]);
        chk.checkArgs(fn_name, 'divisions', divisions, [chk.isInt]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_make.extrude(ents_arr, dist, divisions, method);
    // create IDs
    if (!Array.isArray(entities) && new_ents_arr.length === 1) {
        return common_id_funcs_1.idsMake(new_ents_arr[0]);
    }
    else {
        return common_id_funcs_1.idsMake(new_ents_arr);
    }
}
exports.Extrude = Extrude;
// ================================================================================================
/**
 * Sweeps a cross section wire along a backbone wire.
 *
 * @param __model__
 * @param entities Wires, or entities from which wires can be extracted.
 * @param xsection Cross section wire to sweep, or entity from which a wire can be extracted.
 * @param divisions Segment length or number of segments.
 * @param method Enum, select the method for sweeping.
 * @returns Entities, a list of new polygons or polylines resulting from the sweep.
 */
function Sweep(__model__, entities, x_section, divisions, method) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'make.Sweep';
    let backbone_ents;
    let xsection_ent;
    if (__model__.debug) {
        backbone_ents = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        xsection_ent = _check_ids_1.checkIDs(__model__, fn_name, 'xsextion', x_section, [_check_ids_1.ID.isID], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        chk.checkArgs(fn_name, 'divisions', divisions, [chk.isInt]);
        if (divisions === 0) {
            throw new Error(fn_name + ' : Divisor cannot be zero.');
        }
    }
    else {
        backbone_ents = common_id_funcs_1.idsBreak(entities);
        xsection_ent = common_id_funcs_1.idsBreak(x_section);
    }
    // --- Error Check ---
    const new_ents = __model__.modeldata.funcs_make.sweep(backbone_ents, xsection_ent, divisions, method);
    return common_id_funcs_1.idsMake(new_ents);
}
exports.Sweep = Sweep;
// ================================================================================================
/**
 * Cuts polygons and polylines using a plane.
 *
 * If the 'keep_above' method is selected, then only the part of the cut entities above the plane are kept.
 * If the 'keep_below' method is selected, then only the part of the cut entities below the plane are kept.
 * If the 'keep_both' method is selected, then both the parts of the cut entities are kept.
 *
 * Currently does not support cutting polygons with holes. TODO
 *
 * If 'keep_both' is selected, returns a list of two lists.
 * [[entities above the plane], [entities below the plane]].
 *
 * @param __model__
 * @param entities Polylines or polygons, or entities from which polyline or polygons can be extracted.
 * @param plane The plane to cut with.
 * @param method Enum, select the method for cutting.
 * @returns Entities, a list of three lists of entities resulting from the cut.

 */
function Cut(__model__, entities, plane, method) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        if (method === _ECutMethod.KEEP_BOTH) {
            return [[], []];
        }
        return [];
    }
    // --- Error Check ---
    const fn_name = 'make.Cut';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        chk.checkArgs(fn_name, 'plane', plane, [chk.isPln]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const [above, below] = __model__.modeldata.funcs_make.cut(ents_arr, plane, method);
    // return the result
    switch (method) {
        case _ECutMethod.KEEP_ABOVE:
            return common_id_funcs_1.idsMake(above);
        case _ECutMethod.KEEP_BELOW:
            return common_id_funcs_1.idsMake(below);
        default:
            return [common_id_funcs_1.idsMake(above), common_id_funcs_1.idsMake(below)];
    }
}
exports.Cut = Cut;
// ================================================================================================
/**
 * Adds a new copy of specified entities to the model.
 *
 * @param __model__
 * @param entities Entity or lists of entities to be copied. Entities can be positions, points, polylines, polygons and collections.
 * @param vector A vector to move the entities by after copying, can be `null`.
 * @returns Entities, the copied entity or a list of copied entities.
 * @example copies = make.Copy([position1,polyine1,polygon1])
 * @example_info Creates a copy of position1, polyine1, and polygon1.
 */
function Copy(__model__, entities, vector) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'make.Copy';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
        chk.checkArgs(fn_name, 'vector', vector, [chk.isXYZ, chk.isNull]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // copy the list of entities
    const new_ents_arr = __model__.modeldata.funcs_common.copyGeom(ents_arr, true);
    // copy the positions that belong to the list of entities
    if (vector === null) {
        __model__.modeldata.funcs_common.clonePosisInEnts(new_ents_arr, true);
    }
    else {
        __model__.modeldata.funcs_common.clonePosisInEntsAndMove(new_ents_arr, true, vector);
    }
    // return only the new entities
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Copy = Copy;
// ================================================================================================
/**
 * Adds a new copy of specified entities to the model, and deletes teh original entity.
 *
 * @param __model__
 * @param entities Entity or lists of entities to be copied. Entities can be positions, points, polylines, polygons and collections.
 * @returns Entities, the cloned entity or a list of cloned entities.
 * @example copies = make.Copy([position1,polyine1,polygon1])
 * @example_info Creates a copy of position1, polyine1, and polygon1.
 */
function Clone(__model__, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'make.Clone';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // copy the list of entities
    const new_ents_arr = __model__.modeldata.funcs_common.copyGeom(ents_arr, true);
    __model__.modeldata.funcs_common.clonePosisInEnts(new_ents_arr, true);
    // delete the existing entities
    __model__.modeldata.funcs_edit.delete(ents_arr, false);
    // return the new entities
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Clone = Clone;
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvbWFrZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUVoRCx3REFBMEM7QUFHMUMsa0RBQWlGO0FBQ2pGLDJFQUEwRTtBQUMxRSxpREFBOEU7QUFHOUUsUUFBUTtBQUNSLElBQVksT0FHWDtBQUhELFdBQVksT0FBTztJQUNmLHdCQUFhLENBQUE7SUFDYiwwQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFIVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFHbEI7QUFDRCxJQUFZLFlBUVg7QUFSRCxXQUFZLFlBQVk7SUFDcEIseUNBQTBCLENBQUE7SUFDMUIsNkNBQStCLENBQUE7SUFDL0IsaURBQWtDLENBQUE7SUFDbEMscURBQXVDLENBQUE7SUFDdkMsdUNBQXVCLENBQUE7SUFDdkIsMkNBQTJCLENBQUE7SUFDM0IsaUNBQWlCLENBQUE7QUFDckIsQ0FBQyxFQVJXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBUXZCO0FBQ0QsSUFBWSxlQUtYO0FBTEQsV0FBWSxlQUFlO0lBQ3ZCLGtDQUFnQixDQUFBO0lBQ2hCLDBDQUF1QixDQUFBO0lBQ3ZCLGdDQUFhLENBQUE7SUFDYixvQ0FBaUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFLMUI7QUFDRCxJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDbkIsd0NBQTBCLENBQUE7SUFDMUIsd0NBQXlCLENBQUE7SUFDekIsc0NBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUpXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBSXRCO0FBRUQsbUdBQW1HO0FBQ25HOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLFNBQWtCLEVBQUUsTUFB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