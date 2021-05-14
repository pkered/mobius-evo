"use strict";
/**
 * The `edit` module has functions for editing entities in the model.
 * These function modify the topology of objects: vertices, edges, wires and faces.
 * Some functions return the IDs of the entities that are created or modified.
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
const arrs_1 = require("@libs/util/arrs");
// Enums
var _EDivisorMethod;
(function (_EDivisorMethod) {
    _EDivisorMethod["BY_NUMBER"] = "by_number";
    _EDivisorMethod["BY_LENGTH"] = "by_length";
    _EDivisorMethod["BY_MAX_LENGTH"] = "by_max_length";
    _EDivisorMethod["BY_MIN_LENGTH"] = "by_min_length";
})(_EDivisorMethod = exports._EDivisorMethod || (exports._EDivisorMethod = {}));
var _EWeldMethod;
(function (_EWeldMethod) {
    _EWeldMethod["MAKE_WELD"] = "make_weld";
    _EWeldMethod["BREAK_WELD"] = "break_weld";
})(_EWeldMethod = exports._EWeldMethod || (exports._EWeldMethod = {}));
var _ERingMethod;
(function (_ERingMethod) {
    _ERingMethod["OPEN"] = "open";
    _ERingMethod["CLOSE"] = "close";
})(_ERingMethod = exports._ERingMethod || (exports._ERingMethod = {}));
var _EDeleteMethod;
(function (_EDeleteMethod) {
    _EDeleteMethod["DELETE_SELECTED"] = "delete_selected";
    _EDeleteMethod["KEEP_SELECTED"] = "keep_selected";
})(_EDeleteMethod = exports._EDeleteMethod || (exports._EDeleteMethod = {}));
// ================================================================================================
/**
 * Divides edges into a set of shorter edges.
 * \n
 * - If the `by_number` method is selected, then each edge is divided into
 * a fixed number of equal length shorter edges.
 * - If the `by_length` method is selected, then each edge is divided into
 * shorter edges of the specified length.
 * - The length of the last segment will be the remainder.
 * - If the `by_min_length` method is selected,
 * then the edge is divided into the number of shorter edges
 * with lengths equal to or greater than the minimum length specified.
 * - If the `by_max_length` method is selected,
 * then the edge is divided into the number of shorter edges
 * with lengths equal to or less than the maximum length specified.
 * \n
 * @param __model__
 * @param entities Edges, or entities from which edges can be extracted.
 * @param divisor Segment length or number of segments.
 * @param method Enum, select the method for dividing edges.
 * @returns Entities, a list of new edges resulting from the divide operation.
 * @example `segments1 = make.Divide(edge1, 5, by_number)`
 * @example_info Creates a list of 5 equal length edges from edge1.
 * @example `segments2 = make.Divide(edge1, 5, by_length)`
 * @example_info If edge1 has length 13, creates two new edges of length 5 and one new edge of length 3.
 */
function Divide(__model__, entities, divisor, method) {
    entities = arrs_1.arrMakeFlat(entities);
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'edit.Divide';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.EDGE, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        chk.checkArgs(fn_name, 'divisor', divisor, [chk.isNum]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_edit.divide(ents_arr, divisor, method);
    // return the ids
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Divide = Divide;
// ================================================================================================
/**
 * Makes one or more holes in a polygon.
 * \n
 * The holes are specified by lists of positions.
 * The positions must be on the polygon, i.e. they must be co-planar with the polygon and
 * they must be within the boundary of the polygon. (Even positions touching the edge of the polygon
 * can result in no hole being generated.)
 * \n
 * Multiple holes can be created.
 * - If the positions is a single list, then a single hole will be generated.
 * - If the positions is a list of lists, then multiple holes will be generated.
 * \n
 * @param __model__
 * @param pgon A polygon to make holes in.
 * @param entities List of positions, or nested lists of positions, or entities from which positions
 * can be extracted.
 * @returns Entities, a list of wires resulting from the hole(s).
 */
function Hole(__model__, pgon, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    if (!Array.isArray(entities)) {
        entities = [entities];
    }
    // --- Error Check ---
    const fn_name = 'edit.Hole';
    let ent_arr;
    let holes_ents_arr;
    if (__model__.debug) {
        ent_arr = _check_ids_1.checkIDs(__model__, fn_name, 'pgon', pgon, [_check_ids_1.ID.isID], [common_1.EEntType.PGON]);
        holes_ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], [common_1.EEntType.POSI, common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
    }
    else {
        ent_arr = common_id_funcs_1.idsBreak(pgon);
        holes_ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_edit.hole(ent_arr, holes_ents_arr);
    // make and return the IDs of the hole wires
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Hole = Hole;
// ================================================================================================
/**
 * Make or break welds between vertices.
 * If two vertices are welded, then they share the same position.
 * \n
 * - When making a weld between vertices, a new position is created. The new position is calculate
 * as the average of all the existing positions of the vertices. The vertices will then be linked
 * to the new position. This means that if the position is later moved, then all vertices will be
 * affected. The new position is returned. The positions that become shared are returned.
 * - When breaking a weld between vetices, existing positions are duplicated. Each vertex is then
 * linked to one of these duplicate positions. If these positions are later moved, then only one
 * vertex will be affected.  The new positions that get generated are returned.
 * \n
 * @param __model__
 * @param entities Entities, a list of vertices, or entities from which vertices can be extracted.
 * @param method Enum; the method to use, either `make_weld` or `break_weld`.
 * @returns void
 */
function Weld(__model__, entities, method) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'edit.Weld';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.VERT, common_1.EEntType.EDGE, common_1.EEntType.WIRE,
            common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_edit.weld(ents_arr, method);
    // make and return the IDs of the new posis
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Weld = Weld;
// ================================================================================================
/**
 * Fuse positions that lie within a certain tolerance of one another.
 * New positions will be created.
 * \n
 * The existing positions are analysed and clustered into groups of positions that lie with the
 * tolerance distance from one another. For each cluster, a new position is created at the centre
 * of the cluster. The xyz coordinates of the new position will be calculated as the average of all
 * the existing positions in the cluster.
 * \n
 * If the positions that are fuse have vertices attached, then the vertices will become welded.
 * (Note that when using the `edit.Weld()` function, there is no threshold tolerance. Even vertices
 * that are far apart can be welded together. Fusing allows only vertices that are close together
 * to be welded.)
 * \n
 * In some cases, if edges are shorter than the tolerance, this can result in edges being deleted.
 * The deletion of edges may also result in polylines or polygons being deleted. (It is therefore
 * advisable to filter out deleted entities after applying the `edit.Fuse()` function. For example,
 * if you have a list of polygons, after fusing, you can filter the list like this:
 * `pgons = pgons#pg`.)
 * \n
 * The new positions that get generated are returned.
 * \n
 * @param __model__
 * @param entities Entities, a list of positions, or entities from which positions can be extracted.
 * @param tolerance The distance tolerance for fusing positions.
 * @returns void
 */
function Fuse(__model__, entities, tolerance) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'edit.Fuse';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    const new_ents_arr = __model__.modeldata.funcs_edit.fuse(ents_arr, tolerance);
    // make and return the IDs of the new posis
    return common_id_funcs_1.idsMake(new_ents_arr);
}
exports.Fuse = Fuse;
// ================================================================================================
/**
 * Opens or closes a polyline.
 * \n
 * A polyline can be open or closed. A polyline consists of a sequence of vertices and edges.
 * Edges connect pairs of vertices.
 * - An open polyline has no edge connecting the first and last vertices. Closing a polyline
 * adds this edge.
 * - A closed polyline has an edge connecting the first and last vertices. Opening a polyline
 * deletes this edge.
 * \n
 * @param __model__
 * @param entities Polyline(s).
 * @param method Enum; the method to use, either `open` or `close`.
 * @returns void
 * @example `edit.Ring([polyline1,polyline2,...], method='close')`
 * @example_info If open, polylines are changed to closed; if already closed, nothing happens.
 */
function Ring(__model__, entities, method) {
    entities = arrs_1.arrMakeFlat(entities);
    if (!arrs_1.isEmptyArr(entities)) {
        // --- Error Check ---
        const fn_name = 'edit.Ring';
        let ents_arr;
        if (__model__.debug) {
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE]);
        }
        else {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        // --- Error Check ---
        __model__.modeldata.funcs_edit.ring(ents_arr, method);
    }
}
exports.Ring = Ring;
// ================================================================================================
/**
 * Shifts the order of the edges in a closed wire.
 * \n
 * In a closed wire (either a closed polyline or polygon), the edges form a closed ring. Any edge
 * (or vertex) could be the first edge of the ring. In some cases, it is useful to have an edge in
 * a particular position in a ring. This function allows the edges to be shifted either forwards or
 * backwards around the ring. The order of the edges in the ring will remain unchanged.
 * \n
 * - An offset of zero has no effect.
 * - An offset of 1 will shift the edges so that the second edge becomes the first edge.
 * - An offset of 2 will shift the edges so that the third edge becomes the first edge.
 * - An offset of -1 will shift the edges so that the last edge becomes the first edge.
 * \n
 * @param __model__
 * @param entities Wire, face, polyline, polygon.
 * @param offset The offset, a positive or negative integer.
 * @returns void
 * @example `modify.Shift(polygon1, 1)`
 * @example_info Shifts the edges in the polygon wire, so that the every edge moves back by one position
 * in the ring. The first edge will become the last edge.
 * @example `edit.Shift(polyline1, -1)`
 * @example_info Shifts the edges in the closed polyline wire, so that every edge moves up by one position
 * in the ring. The last edge will become the first edge.
 */
function Shift(__model__, entities, offset) {
    entities = arrs_1.arrMakeFlat(entities);
    if (!arrs_1.isEmptyArr(entities)) {
        // --- Error Check ---
        let ents_arr;
        if (__model__.debug) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'edit.Reverse', 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        }
        else {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        // --- Error Check ---
        __model__.modeldata.funcs_edit.shift(ents_arr, offset);
    }
}
exports.Shift = Shift;
// ================================================================================================
/**
 * Reverses direction of wires, polylines or polygons.
 * \n
 * The order of vertices and edges in the wires will be reversed.
 * \n
 * For polygons this also means that they will face in the opposite direction. The back face and
 * front face will be flipped. If the normal is calculated, it will face in the opposite direction.
 * \n
 * @param __model__
 * @param entities Wire,polyline, polygon.
 * @returns void
 * @example `modify.Reverse(polygon1)`
 * @example_info Flips polygon and reverses its normal.
 * @example `edit.Reverse(polyline1)`
 * @example_info Reverses the order of vertices and edges in the polyline.
 */
function Reverse(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    if (!arrs_1.isEmptyArr(entities)) {
        // --- Error Check ---
        let ents_arr;
        if (__model__.debug) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'edit.Reverse', 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.WIRE, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        }
        else {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        // --- Error Check ---
        __model__.modeldata.funcs_edit.reverse(ents_arr);
    }
}
exports.Reverse = Reverse;
// ================================================================================================
/**
 * Deletes geometric entities: positions, points, polylines, polygons, and collections.
 * \n
 * - When deleting positions, any topology that requires those positions will also be deleted.
 * (For example, any vertices linked to the deleted position will also be deleted,
 * which may in turn result in some edges being deleted, and so forth.)
 * - When deleting objects (points, polylines, and polygons), topology is also deleted.
 * - When deleting collections, the objects and other collections in the collection are also deleted.
 * \n
 * Topological entities inside objects  (wires, edges, vertices) cannot be deleted.
 * If a topological entity needs to be deleted, then the current approach is create a new object
 * with the desired topology, and then to delete the original object.
 * \n
 * @param __model__
 * @param entities Positions, points, polylines, polygons, collections.
 * @param method Enum, delete or keep unused positions.
 * @returns void
 * @example `edit.Delete(polygon1, 'delete_selected')`
 * @example_info Deletes `polygon1` from the model. The topology for
 * `polygon1` will be deleted. In addition, any positions being used by `polygon1` will be deleted
 * only if they are not being used by other objects.
 * @example `edit.Delete(polygon1, 'keep_selected')`
 * @example_info Deletes everything except `polygon1` from the model. The topology and positions for
 * `polygon1` will not be deleted.
 */
function Delete(__model__, entities, method) {
    if (entities === null) {
        if (method === _EDeleteMethod.KEEP_SELECTED) {
            return;
        }
        if (method === _EDeleteMethod.DELETE_SELECTED) {
            __model__.modeldata.funcs_edit.delete(null, false);
            return;
        }
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'edit.Delete';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.POSI, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    switch (method) {
        case _EDeleteMethod.DELETE_SELECTED:
            if (arrs_1.isEmptyArr(entities)) {
                return;
            }
            __model__.modeldata.funcs_edit.delete(ents_arr, false); // do not invert
            return;
        case _EDeleteMethod.KEEP_SELECTED:
            if (arrs_1.isEmptyArr(entities)) {
                __model__.modeldata.funcs_edit.delete(null, false);
                return;
            }
            __model__.modeldata.funcs_edit.delete(ents_arr, true); // invert
            return;
        default:
            throw new Error(fn_name + ' : Method not recognised.');
    }
}
exports.Delete = Delete;
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL2VkaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0dBSUc7Ozs7Ozs7OztBQUVIOztHQUVHO0FBQ0gsaURBQWdEO0FBRWhELHdEQUEwQztBQUcxQyxrREFBNkU7QUFDN0UsMkVBQTBFO0FBQzFFLDBDQUEwRDtBQUUxRCxRQUFRO0FBQ1IsSUFBWSxlQUtYO0FBTEQsV0FBWSxlQUFlO0lBQ3ZCLDBDQUF3QixDQUFBO0lBQ3hCLDBDQUF5QixDQUFBO0lBQ3pCLGtEQUFpQyxDQUFBO0lBQ2pDLGtEQUFpQyxDQUFBO0FBQ3JDLENBQUMsRUFMVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUsxQjtBQUNELElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUNwQix1Q0FBd0IsQ0FBQTtJQUN4Qix5Q0FBMkIsQ0FBQTtBQUMvQixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFDRCxJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDcEIsNkJBQWMsQ0FBQTtJQUNkLCtCQUFpQixDQUFBO0FBQ3JCLENBQUMsRUFIVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUd2QjtBQUNELElBQVksY0FHWDtBQUhELFdBQVksY0FBYztJQUN0QixxREFBcUMsQ0FBQTtJQUNyQyxpREFBZ0MsQ0FBQTtBQUNwQyxDQUFDLEVBSFcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFHekI7QUFFRCxtR0FBbUc7QUFDbkc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNILFNBQWdCLE1BQU0sQ0FBQyxTQUFrQixFQUFFLFFBQW1CLEVBQUUsT0FBZSxFQUFFLE1BQXVCO0lBQ3BHLFFBQVEsR0FBRyxrQkFBVyxDQUFD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