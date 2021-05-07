"use strict";
/**
 * The `query` module has functions for querying entities in the the model.
 * Most of these functions all return a list of IDs of entities in the model.
 * \n
 * \n
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const _check_ids_1 = require("../../_check_ids");
const _check_attribs_1 = require("../../_check_attribs");
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
// ================================================================================================
var _EEntType;
(function (_EEntType) {
    _EEntType["POSI"] = "ps";
    _EEntType["VERT"] = "_v";
    _EEntType["EDGE"] = "_e";
    _EEntType["WIRE"] = "_w";
    _EEntType["POINT"] = "pt";
    _EEntType["PLINE"] = "pl";
    _EEntType["PGON"] = "pg";
    _EEntType["COLL"] = "co";
})(_EEntType = exports._EEntType || (exports._EEntType = {}));
var _EEntTypeAndMod;
(function (_EEntTypeAndMod) {
    _EEntTypeAndMod["POSI"] = "ps";
    _EEntTypeAndMod["VERT"] = "_v";
    _EEntTypeAndMod["EDGE"] = "_e";
    _EEntTypeAndMod["WIRE"] = "_w";
    _EEntTypeAndMod["POINT"] = "pt";
    _EEntTypeAndMod["PLINE"] = "pl";
    _EEntTypeAndMod["PGON"] = "pg";
    _EEntTypeAndMod["COLL"] = "co";
    _EEntTypeAndMod["MOD"] = "mo";
})(_EEntTypeAndMod = exports._EEntTypeAndMod || (exports._EEntTypeAndMod = {}));
function _getEntTypeFromStr(ent_type_str) {
    switch (ent_type_str) {
        case _EEntTypeAndMod.POSI:
            return common_1.EEntType.POSI;
        case _EEntTypeAndMod.VERT:
            return common_1.EEntType.VERT;
        case _EEntTypeAndMod.EDGE:
            return common_1.EEntType.EDGE;
        case _EEntTypeAndMod.WIRE:
            return common_1.EEntType.WIRE;
        case _EEntTypeAndMod.POINT:
            return common_1.EEntType.POINT;
        case _EEntTypeAndMod.PLINE:
            return common_1.EEntType.PLINE;
        case _EEntTypeAndMod.PGON:
            return common_1.EEntType.PGON;
        case _EEntTypeAndMod.COLL:
            return common_1.EEntType.COLL;
        case _EEntTypeAndMod.MOD:
            return common_1.EEntType.MOD;
        default:
            break;
    }
}
// ================================================================================================
var _EDataType;
(function (_EDataType) {
    _EDataType["NUMBER"] = "number";
    _EDataType["STRING"] = "string";
    _EDataType["BOOLEAN"] = "boolean";
    _EDataType["LIST"] = "list";
    _EDataType["DICT"] = "dict";
})(_EDataType = exports._EDataType || (exports._EDataType = {}));
// ================================================================================================
/**
 * Get entities from a list of entities.
 * For example, you can get the position entities from a list of polygon entities.
 * \n
 * The result will always be a list of entities, even if there is only one entity.
 * In a case where you want only one entity, remember to get the first item in the list.
 * \n
 * The resulting list of entities will not contain duplicate entities.
 * \n
 * @param __model__
 * @param ent_type_enum Enum, the type of entity to get.
 * @param entities Optional, list of entities to get entities from, or null to get all entities in the model.
 * @returns Entities, a list of entities.
 * @example positions = query.Get('positions', [polyline1, polyline2])
 * @example_info Returns a list of positions that are part of polyline1 and polyline2.
 */
function Get(__model__, ent_type_enum, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'query.Get';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isNull, _check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], null, false);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    // get the entity type // TODO deal with multiple ent types
    const ent_type = _getEntTypeFromStr(ent_type_enum);
    // if ents_arr is null, then get all entities in the model of type ent_type
    if (ents_arr === null) {
        // return the result
        return common_id_funcs_1.idsMake(_getAll(__model__, ent_type));
    }
    if (arrs_1.isEmptyArr(ents_arr)) {
        return [];
    }
    // make sure that the ents_arr is at least depth 2
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 1) {
        ents_arr = [ents_arr];
    }
    ents_arr = ents_arr;
    // get the entities
    const found_ents_arr = _getFrom(__model__, ent_type, ents_arr);
    // return the result
    return common_id_funcs_1.idsMake(found_ents_arr);
}
exports.Get = Get;
function _getAll(__model__, ent_type) {
    const ssid = __model__.modeldata.active_ssid;
    const ents_i = __model__.modeldata.geom.snapshot.getEnts(ssid, ent_type);
    return ents_i.map(ent_i => [ent_type, ent_i]);
}
function _getFrom(__model__, ent_type, ents_arr) {
    const ssid = __model__.modeldata.active_ssid;
    if (ents_arr.length === 0) {
        return [];
    }
    // do the query
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 2) {
        ents_arr = ents_arr;
        // get the list of entities that are found
        const found_ents_i_set = new Set();
        for (const ent_arr of ents_arr) {
            if (__model__.modeldata.geom.snapshot.hasEnt(ssid, ent_arr[0], ent_arr[1])) {
                // snapshot
                const ents_i = __model__.modeldata.geom.nav.navAnyToAny(ent_arr[0], ent_type, ent_arr[1]);
                if (ents_i) {
                    for (const ent_i of ents_i) {
                        if (ent_i !== undefined) {
                            found_ents_i_set.add(ent_i);
                        }
                    }
                }
            }
        }
        // return the found ents
        const found_ents_i = Array.from(found_ents_i_set);
        return found_ents_i.map(entity_i => [ent_type, entity_i]);
    }
    else { // depth === 3
        // TODO Why do we want this option?
        // TODO I cannot see any reason to return anything buy a flat list
        ents_arr = ents_arr;
        return ents_arr.map(ents_arr_item => _getFrom(__model__, ent_type, ents_arr_item));
    }
}
// ================================================================================================
/**
 * Filter a list of entities based on an attribute value.
 * \n
 * The result will always be a list of entities, even if there is only one entity.
 * In a case where you want only one entity, remember to get the first item in the list.
 * \n
 * @param __model__
 * @param entities List of entities to filter. The entities must all be of the same type
 * @param attrib The attribute to use for filtering. Can be `name`, `[name, index]`, or `[name, key]`.
 * @param operator_enum Enum, the operator to use for filtering
 * @param value The attribute value to use for filtering.
 * @returns Entities, a list of entities that match the conditions specified in 'expr'.
 */
function Filter(__model__, entities, attrib, operator_enum, value) {
    if (entities === null) {
        return [];
    }
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'query.Filter';
    let ents_arr = null;
    let attrib_name, attrib_idx_key;
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], null, false);
        }
        [attrib_name, attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, attrib);
        _check_attribs_1.checkAttribValue(fn_name, value);
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        [attrib_name, attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, attrib);
    }
    // --- Error Check ---
    // make sure that the ents_arr is at least depth 2
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 1) {
        ents_arr = [ents_arr];
    }
    ents_arr = ents_arr;
    // get the oeprator
    const op_type = _filterOperator(operator_enum);
    // do the query
    const found_ents_arr = _filter(__model__, ents_arr, attrib_name, attrib_idx_key, op_type, value);
    // return the result
    return common_id_funcs_1.idsMake(found_ents_arr);
}
exports.Filter = Filter;
var _EFilterOperator;
(function (_EFilterOperator) {
    _EFilterOperator["IS_EQUAL"] = "==";
    _EFilterOperator["IS_NOT_EQUAL"] = "!=";
    _EFilterOperator["IS_GREATER_OR_EQUAL"] = ">=";
    _EFilterOperator["IS_LESS_OR_EQUAL"] = "<=";
    _EFilterOperator["IS_GREATER"] = ">";
    _EFilterOperator["IS_LESS"] = "<";
    _EFilterOperator["EQUAL"] = "=";
})(_EFilterOperator = exports._EFilterOperator || (exports._EFilterOperator = {}));
function _filterOperator(select) {
    switch (select) {
        case _EFilterOperator.IS_EQUAL:
            return common_1.EFilterOperatorTypes.IS_EQUAL;
        case _EFilterOperator.IS_NOT_EQUAL:
            return common_1.EFilterOperatorTypes.IS_NOT_EQUAL;
        case _EFilterOperator.IS_GREATER_OR_EQUAL:
            return common_1.EFilterOperatorTypes.IS_GREATER_OR_EQUAL;
        case _EFilterOperator.IS_LESS_OR_EQUAL:
            return common_1.EFilterOperatorTypes.IS_LESS_OR_EQUAL;
        case _EFilterOperator.IS_GREATER:
            return common_1.EFilterOperatorTypes.IS_GREATER;
        case _EFilterOperator.IS_LESS:
            return common_1.EFilterOperatorTypes.IS_LESS;
        default:
            throw new Error('Query operator type not recognised.');
    }
}
function _filter(__model__, ents_arr, name, idx_or_key, op_type, value) {
    if (ents_arr.length === 0) {
        return [];
    }
    // do the filter
    const depth = arrs_1.getArrDepth(ents_arr);
    if (depth === 2) {
        ents_arr = ents_arr;
        const ent_type = ents_arr[0][0];
        // get the list of entities
        // const found_ents_i: number[] = [];
        // for (const ent_arr of ents_arr) {
        //     found_ents_i.push(...__model__.modeldata.geom.nav.navAnyToAny(ent_arr[0], ent_type, ent_arr[1]));
        // }
        const ents_i = [];
        for (const ent_arr of ents_arr) {
            if (ent_arr[0] !== ent_type) {
                throw new Error('Error filtering list of entities: The entities must all be of the same type.');
            }
            ents_i.push(ent_arr[1]);
        }
        // filter the entities
        const query_result = __model__.modeldata.attribs.query.filterByAttribs(ent_type, ents_i, name, idx_or_key, op_type, value);
        if (query_result.length === 0) {
            return [];
        }
        return query_result.map(entity_i => [ent_type, entity_i]);
    }
    else { // depth === 3
        // TODO Why do we want this option?
        // TODO I cannot see any reason to return anything buy a flat list
        ents_arr = ents_arr;
        return ents_arr.map(ents_arr_item => _filter(__model__, ents_arr_item, name, idx_or_key, op_type, value));
    }
}
// ================================================================================================
/**
 * Returns a list of entities that are not part of the specified entities.
 * For example, you can get the position entities that are not part of a list of polygon entities.
 * \n
 * This function does the opposite of query.Get().
 * While query.Get() gets entities that are part of of the list of entities,
 * this function gets the entities that are not part of the list of entities.
 * \n
 * @param __model__
 * @param ent_type_enum Enum, specifies what type of entities will be returned.
 * @param entities List of entities to be excluded.
 * @returns Entities, a list of entities that match the type specified in 'ent_type_enum', and that are not in entities.
 * @example positions = query.Invert('positions', [polyline1, polyline2])
 * @example_info Returns a list of positions that are not part of polyline1 and polyline2.
 */
function Invert(__model__, ent_type_enum, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    let ents_arr = null;
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'query.Invert', 'entities', entities, [_check_ids_1.ID.isIDL1], null, false);
        }
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
    }
    // --- Error Check ---
    const select_ent_types = _getEntTypeFromStr(ent_type_enum);
    const found_ents_arr = _invert(__model__, select_ent_types, ents_arr);
    return common_id_funcs_1.idsMake(found_ents_arr);
}
exports.Invert = Invert;
function _invert(__model__, select_ent_type, ents_arr) {
    const ssid = __model__.modeldata.active_ssid;
    // get the ents to exclude
    const excl_ents_i = ents_arr
        .filter(ent_arr => ent_arr[0] === select_ent_type).map(ent_arr => ent_arr[1]);
    // get the list of entities
    const found_entities_i = [];
    const ents_i = __model__.modeldata.geom.snapshot.getEnts(ssid, select_ent_type);
    for (const ent_i of ents_i) {
        if (excl_ents_i.indexOf(ent_i) === -1) {
            found_entities_i.push(ent_i);
        }
    }
    return found_entities_i.map(entity_i => [select_ent_type, entity_i]);
}
// ================================================================================================
var _ESortMethod;
(function (_ESortMethod) {
    _ESortMethod["DESCENDING"] = "descending";
    _ESortMethod["ASCENDING"] = "ascending";
})(_ESortMethod = exports._ESortMethod || (exports._ESortMethod = {}));
/**
 * Sorts entities based on an attribute.
 * \n
 * If the attribute is a list, and index can also be specified as follows: #@name1[index].
 * \n
 * @param __model__
 * @param entities List of two or more entities to be sorted, all of the same entity type.
 * @param attrib Attribute name to use for sorting. Can be `name`, `[name, index]`, or `[name, key]`.
 * @param method_enum Enum, sort descending or ascending.
 * @returns Entities, a list of sorted entities.
 * @example sorted_list = query.Sort( [pos1, pos2, pos3], #@xyz[2], descending)
 * @example_info Returns a list of three positions, sorted according to the descending z value.
 */
function Sort(__model__, entities, attrib, method_enum) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'query.Sort';
    let ents_arr;
    let attrib_name, attrib_idx_key;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], null);
        [attrib_name, attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, attrib);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
        [attrib_name, attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, attrib);
    }
    // --- Error Check ---
    const sort_method = (method_enum === _ESortMethod.DESCENDING) ? common_1.ESort.DESCENDING : common_1.ESort.ASCENDING;
    const sorted_ents_arr = _sort(__model__, ents_arr, attrib_name, attrib_idx_key, sort_method);
    return common_id_funcs_1.idsMake(sorted_ents_arr);
}
exports.Sort = Sort;
function _sort(__model__, ents_arr, attrib_name, idx_or_key, method) {
    // get the list of ents_i
    const ent_type = ents_arr[0][0];
    const ents_i = ents_arr.filter(ent_arr => ent_arr[0] === ent_type).map(ent_arr => ent_arr[1]);
    // check if we are sorting by '_id'
    if (attrib_name === '_id') {
        const ents_arr_copy = ents_arr.slice();
        ents_arr_copy.sort(_compareID);
        if (method === common_1.ESort.DESCENDING) {
            ents_arr_copy.reverse();
        }
        return ents_arr_copy;
    }
    // do the sort on the list of entities
    const sort_result = __model__.modeldata.attribs.query.sortByAttribs(ent_type, ents_i, attrib_name, idx_or_key, method);
    return sort_result.map(entity_i => [ent_type, entity_i]);
}
function _compareID(id1, id2) {
    const [ent_type1, index1] = id1;
    const [ent_type2, index2] = id2;
    if (ent_type1 !== ent_type2) {
        return ent_type1 - ent_type2;
    }
    if (index1 !== index2) {
        return index1 - index2;
    }
    return 0;
}
// ================================================================================================
/**
* Returns a list of perimeter entities. In order to qualify as a perimeter entity,
* entities must be part of the set of input entities and must have naked edges.
* \n
* @param __model__
* @param ent_type Enum, select the type of perimeter entities to return
* @param entities List of entities.
* @returns Entities, a list of perimeter entities.
* @example query.Perimeter('edges', [polygon1,polygon2,polygon])
* @example_info Returns list of edges that are at the perimeter of polygon1, polygon2, or polygon3.
*/
function Perimeter(__model__, ent_type, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    let ents_arr = null;
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'query.Perimeter', 'entities', entities, [_check_ids_1.ID.isIDL1], null);
        }
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
    }
    // --- Error Check ---
    const select_ent_type = _getEntTypeFromStr(ent_type);
    const found_ents_arr = _perimeter(__model__, select_ent_type, ents_arr);
    return common_id_funcs_1.idsMake(found_ents_arr);
}
exports.Perimeter = Perimeter;
function _perimeter(__model__, select_ent_type, ents_arr) {
    // get an array of all edges
    const edges_i = [];
    for (const ent_arr of ents_arr) {
        const [ent_type, index] = ent_arr;
        const edges_ent_i = __model__.modeldata.geom.nav.navAnyToEdge(ent_type, index);
        for (const edge_ent_i of edges_ent_i) {
            edges_i.push(edge_ent_i);
        }
    }
    // get the perimeter entities
    const all_perim_ents_i = __model__.modeldata.geom.query.perimeter(select_ent_type, edges_i);
    return all_perim_ents_i.map(perim_ent_i => [select_ent_type, perim_ent_i]);
}
exports._perimeter = _perimeter;
// ================================================================================================
/**
* Returns a list of neighboring entities. In order to qualify as a neighbor,
* entities must not be part of the set of input entities, but must be welded to one or more entities in the input.
* \n
* @param __model__
* @param ent_type_enum Enum, select the types of neighbors to return
* @param entities List of entities.
* @returns Entities, a list of welded neighbors
* @example query.neighbor('edges', [polyline1,polyline2,polyline3])
* @example_info Returns list of edges that are welded to polyline1, polyline2, or polyline3.
*/
function Neighbor(__model__, ent_type_enum, entities) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    let ents_arr = null;
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'query.Neighbor', 'entities', entities, [_check_ids_1.ID.isIDL1], null);
        }
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
    }
    // --- Error Check ---
    const select_ent_type = _getEntTypeFromStr(ent_type_enum);
    const found_ents_arr = _neighbors(__model__, select_ent_type, ents_arr);
    return common_id_funcs_1.idsMake(found_ents_arr);
}
exports.Neighbor = Neighbor;
function _neighbors(__model__, select_ent_type, ents_arr) {
    // get an array of all vertices
    const verts_i = [];
    for (const ent_arr of ents_arr) {
        const [ent_type, index] = ent_arr;
        const verts_ent_i = __model__.modeldata.geom.nav.navAnyToVert(ent_type, index);
        for (const vert_ent_i of verts_ent_i) {
            verts_i.push(vert_ent_i);
        }
    }
    // get the neighbor entities
    const all_nbor_ents_i = __model__.modeldata.geom.query.neighbor(select_ent_type, verts_i);
    return all_nbor_ents_i.map(nbor_ent_i => [select_ent_type, nbor_ent_i]);
}
exports._neighbors = _neighbors;
// ================================================================================================
var _EEdgeMethod;
(function (_EEdgeMethod) {
    _EEdgeMethod["PREV"] = "previous";
    _EEdgeMethod["NEXT"] = "next";
    _EEdgeMethod["PREV_NEXT"] = "both";
    _EEdgeMethod["TOUCH"] = "touching";
})(_EEdgeMethod = exports._EEdgeMethod || (exports._EEdgeMethod = {}));
/**
* Given an edge, returns other edges.
* - If "previous" is selected, it returns the previous edge in the wire or null if there is no previous edge.
* - If "next" is selected, it returns the next edge in the wire or null if there is no next edge.
* - If "both" is selected, it returns a list of two edges, [previous, next]. Either can be null.
* - If "touching" is selected, it returns a list of edges from other wires that share the same start and end positions (in any order).
* @param __model__
* @param entities An edge or list of edges.
* @param edge_query_enum Enum, select the types of edges to return.
* @returns Entities, an edge or list of edges
*/
function Edge(__model__, entities, edge_query_enum) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    let ents_arr = null;
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, 'query.Edge', 'entities', entities, [_check_ids_1.ID.isIDL1], [common_1.EEntType.EDGE]);
        }
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
    }
    // --- Error Check ---
    let edges_i = ents_arr.map(ent => ent[1]);
    switch (edge_query_enum) {
        case _EEdgeMethod.PREV:
            edges_i = _getPrevEdge(__model__, edges_i);
            break;
        case _EEdgeMethod.NEXT:
            edges_i = _getNextEdge(__model__, edges_i);
            break;
        case _EEdgeMethod.PREV_NEXT:
            edges_i = _getPrevNextEdge(__model__, edges_i);
            break;
        case _EEdgeMethod.TOUCH:
            edges_i = _getTouchEdge(__model__, edges_i);
            break;
        default:
            break;
    }
    return common_id_funcs_1.idsMakeFromIdxs(common_1.EEntType.EDGE, edges_i);
}
exports.Edge = Edge;
function _getPrevEdge(__model__, edges_i) {
    if (!Array.isArray(edges_i)) {
        const edge_i = edges_i;
        return __model__.modeldata.geom.query.getPrevEdge(edge_i); // can be null
    }
    else {
        return edges_i.map(edge_i => _getPrevEdge(__model__, edge_i));
    }
}
function _getNextEdge(__model__, edges_i) {
    if (!Array.isArray(edges_i)) {
        const edge_i = edges_i;
        return __model__.modeldata.geom.query.getNextEdge(edge_i); // can be null
    }
    else {
        return edges_i.map(edge_i => _getNextEdge(__model__, edge_i));
    }
}
function _getPrevNextEdge(__model__, edges_i) {
    if (!Array.isArray(edges_i)) {
        const edge_i = edges_i;
        const prev_edge_i = __model__.modeldata.geom.query.getPrevEdge(edge_i); // can be null
        const next_edge_i = __model__.modeldata.geom.query.getNextEdge(edge_i); // can be null
        return [prev_edge_i, next_edge_i];
    }
    else {
        return edges_i.map(edge_i => _getPrevNextEdge(__model__, edge_i));
    }
}
function _getTouchEdge(__model__, edges_i) {
    if (!Array.isArray(edges_i)) {
        const edge_i = edges_i;
        const posis_i = __model__.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
        if (posis_i.length < 2) {
            return [];
        }
        const edges0_i = __model__.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.POSI, posis_i[0]);
        if (edges0_i.length < 2) {
            return [];
        }
        const edges1_i = __model__.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.POSI, posis_i[1]);
        if (edges1_i.length < 2) {
            return [];
        }
        const touch_edges_i = [];
        for (const edge0_i of edges0_i) {
            if (edge0_i === edge_i) {
                continue;
            }
            for (const edge1_i of edges1_i) {
                if (edge0_i === edge1_i) {
                    touch_edges_i.push(edge0_i);
                }
            }
        }
        return touch_edges_i;
    }
    else {
        return edges_i.map(edge_i => _getTouchEdge(__model__, edge_i));
    }
}
// ================================================================================================
/**
 * Checks the type of an entity.
 * \n
 * For is_used_posi, returns true if the entity is a posi, and it is used by at least one vertex.
 * For is_unused_posi, it returns the opposite of is_used_posi.
 * For is_object, returns true if the entity is a point, a polyline, or a polygon.
 * For is_topology, returns true if the entity is a vertex, an edge, a wire, or a face.
 * For is_point_topology, is_polyline_topology, and is_polygon_topology, returns true
 * if the entity is a topological entity, and it is part of an object of the specified type.
 * \n
 * For is_open, returns true if the entity is a wire or polyline and is open. For is_closed, it returns the opposite of is_open.
 * For is_hole, returns ture if the entity is a wire, and it defines a hole in a face.
 * For has_holes, returns true if the entity is a face or polygon, and it has holes.
 * For has_no_holes, it returns the opposite of has_holes.
 *
 * @param __model__
 * @param entities An entity, or a list of entities.
 * @param type_query_enum Enum, select the conditions to test agains.
 * @returns Boolean or list of boolean in input sequence.
 * @example query.Type([polyline1, polyline2, polygon1], is_polyline )
 * @example_info Returns a list [true, true, false] if polyline1 and polyline2 are polylines but polygon1 is not a polyline.
 */
function Type(__model__, entities, type_query_enum) {
    if (arrs_1.isEmptyArr(entities)) {
        return [];
    }
    // --- Error Check ---
    const fn_name = 'query.Type';
    let ents_arr = null;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null, false);
    }
    else {
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    return _type(__model__, ents_arr, type_query_enum);
}
exports.Type = Type;
var _ETypeQueryEnum;
(function (_ETypeQueryEnum) {
    _ETypeQueryEnum["EXISTS"] = "exists";
    _ETypeQueryEnum["IS_POSI"] = "is_position";
    _ETypeQueryEnum["IS_USED_POSI"] = "is_used_posi";
    _ETypeQueryEnum["IS_UNUSED_POSI"] = "is_unused_posi";
    _ETypeQueryEnum["IS_VERT"] = "is_vertex";
    _ETypeQueryEnum["IS_EDGE"] = "is_edge";
    _ETypeQueryEnum["IS_WIRE"] = "is_wire";
    _ETypeQueryEnum["IS_POINT"] = "is_point";
    _ETypeQueryEnum["IS_PLINE"] = "is_polyline";
    _ETypeQueryEnum["IS_PGON"] = "is_polygon";
    _ETypeQueryEnum["IS_COLL"] = "is_collection";
    _ETypeQueryEnum["IS_OBJ"] = "is_object";
    _ETypeQueryEnum["IS_TOPO"] = "is_topology";
    _ETypeQueryEnum["IS_POINT_TOPO"] = "is_point_topology";
    _ETypeQueryEnum["IS_PLINE_TOPO"] = "is_polyline_topology";
    _ETypeQueryEnum["IS_PGON_TOPO"] = "is_polygon_topology";
    _ETypeQueryEnum["IS_OPEN"] = "is_open";
    _ETypeQueryEnum["IS_CLOSED"] = "is_closed";
    _ETypeQueryEnum["IS_HOLE"] = "is_hole";
    _ETypeQueryEnum["HAS_HOLES"] = "has_holes";
    _ETypeQueryEnum["HAS_NO_HOLES"] = "has_no_holes";
})(_ETypeQueryEnum = exports._ETypeQueryEnum || (exports._ETypeQueryEnum = {}));
function _exists(__model__, ent_arr) {
    const ssid = __model__.modeldata.active_ssid;
    const [ent_type, ent_i] = ent_arr;
    return __model__.modeldata.geom.snapshot.hasEnt(ssid, ent_type, ent_i);
}
function _isUsedPosi(__model__, ent_arr) {
    const ssid = __model__.modeldata.active_ssid;
    const [ent_type, ent_i] = ent_arr;
    if (ent_type !== common_1.EEntType.POSI) {
        return false;
    }
    return !this.modeldata.snapshot.isPosiUnused(ssid, ent_i);
    // const verts_i: number[] = __model__.modeldata.geom.nav.navPosiToVert(index);
    // if (verts_i === undefined) {
    //     return false;
    // }
    // return verts_i.length > 0;
}
function _isObj(__model__, ent_arr) {
    const [ent_type, _] = ent_arr;
    if (ent_type === common_1.EEntType.POINT || ent_type === common_1.EEntType.PLINE || ent_type === common_1.EEntType.PGON) {
        return true;
    }
    return false;
}
function _isTopo(__model__, ent_arr) {
    const [ent_type, _] = ent_arr;
    if (ent_type === common_1.EEntType.VERT || ent_type === common_1.EEntType.EDGE || ent_type === common_1.EEntType.WIRE) {
        return true;
    }
    return false;
}
function _isPointTopo(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type === common_1.EEntType.VERT) {
        const points_i = __model__.modeldata.geom.nav.navAnyToPoint(ent_type, ent_i);
        if (points_i !== undefined && points_i.length) {
            return true;
        }
    }
    return false;
}
function _isPlineTopo(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type === common_1.EEntType.VERT || ent_type === common_1.EEntType.EDGE || ent_type === common_1.EEntType.WIRE) {
        const plines_i = __model__.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
        if (plines_i !== undefined && plines_i.length) {
            return true;
        }
    }
    return false;
}
function _isPgonTopo(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type === common_1.EEntType.VERT || ent_type === common_1.EEntType.EDGE || ent_type === common_1.EEntType.WIRE) {
        const pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
        if (pgons_i !== undefined && pgons_i.length) {
            return true;
        }
    }
    return false;
}
function _isClosed2(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type === common_1.EEntType.PGON) {
        return true;
    }
    else if (ent_type !== common_1.EEntType.WIRE && ent_type !== common_1.EEntType.PLINE) {
        return false;
    }
    let wire_i = ent_i;
    if (ent_type === common_1.EEntType.PLINE) {
        wire_i = __model__.modeldata.geom.nav.navPlineToWire(ent_i);
    }
    return __model__.modeldata.geom.query.isWireClosed(wire_i);
}
function _isHole(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type !== common_1.EEntType.WIRE) {
        return false;
    }
    const pgon_i = __model__.modeldata.geom.nav.navWireToPgon(ent_i);
    if (pgon_i === undefined) {
        return false;
    }
    const wires_i = __model__.modeldata.geom.nav.navPgonToWire(pgon_i);
    return wires_i.indexOf(ent_i) > 0;
}
function _hasNoHoles(__model__, ent_arr) {
    const [ent_type, ent_i] = ent_arr;
    if (ent_type !== common_1.EEntType.PGON) {
        return false;
    }
    const wires_i = __model__.modeldata.geom.nav.navPgonToWire(ent_i);
    return wires_i.length === 1;
}
function _type(__model__, ents_arr, query_ent_type) {
    if (arrs_1.getArrDepth(ents_arr) === 1) {
        const ent_arr = ents_arr;
        const [ent_type, _] = ent_arr;
        switch (query_ent_type) {
            case _ETypeQueryEnum.EXISTS:
                return _exists(__model__, ent_arr);
            case _ETypeQueryEnum.IS_POSI:
                return ent_type === common_1.EEntType.POSI;
            case _ETypeQueryEnum.IS_USED_POSI:
                return _isUsedPosi(__model__, ent_arr);
            case _ETypeQueryEnum.IS_UNUSED_POSI:
                return !_isUsedPosi(__model__, ent_arr);
            case _ETypeQueryEnum.IS_VERT:
                return ent_type === common_1.EEntType.VERT;
            case _ETypeQueryEnum.IS_EDGE:
                return ent_type === common_1.EEntType.EDGE;
            case _ETypeQueryEnum.IS_WIRE:
                return ent_type === common_1.EEntType.WIRE;
            case _ETypeQueryEnum.IS_POINT:
                return ent_type === common_1.EEntType.POINT;
            case _ETypeQueryEnum.IS_PLINE:
                return ent_type === common_1.EEntType.PLINE;
            case _ETypeQueryEnum.IS_PGON:
                return ent_type === common_1.EEntType.PGON;
            case _ETypeQueryEnum.IS_COLL:
                return ent_type === common_1.EEntType.COLL;
            case _ETypeQueryEnum.IS_OBJ:
                return _isObj(__model__, ent_arr);
            case _ETypeQueryEnum.IS_TOPO:
                return _isTopo(__model__, ent_arr);
            case _ETypeQueryEnum.IS_POINT_TOPO:
                return _isPointTopo(__model__, ent_arr);
            case _ETypeQueryEnum.IS_PLINE_TOPO:
                return _isPlineTopo(__model__, ent_arr);
            case _ETypeQueryEnum.IS_PGON_TOPO:
                return _isPgonTopo(__model__, ent_arr);
            case _ETypeQueryEnum.IS_OPEN:
                return !_isClosed2(__model__, ent_arr);
            case _ETypeQueryEnum.IS_CLOSED:
                return _isClosed2(__model__, ent_arr);
            case _ETypeQueryEnum.IS_HOLE:
                return _isHole(__model__, ent_arr);
            case _ETypeQueryEnum.HAS_HOLES:
                return !_hasNoHoles(__model__, ent_arr);
            case _ETypeQueryEnum.HAS_NO_HOLES:
                return _hasNoHoles(__model__, ent_arr);
            default:
                break;
        }
    }
    else {
        return ents_arr.map(ent_arr => _type(__model__, ent_arr, query_ent_type));
    }
}
// TODO IS_PLANAR
// TODO IS_QUAD
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9xdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7O0dBS0c7O0FBRUg7O0dBRUc7QUFDSCxpREFBZ0Q7QUFDaEQseURBQXNHO0FBR3RHLGtEQUFpSDtBQUNqSCwyRUFBMkY7QUFDM0YsaURBQThFO0FBQzlFLG1HQUFtRztBQUNuRyxJQUFZLFNBU1g7QUFURCxXQUFZLFNBQVM7SUFDakIsd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHlCQUFhLENBQUE7SUFDYix5QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7QUFDakIsQ0FBQyxFQVRXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBU3BCO0FBQ0QsSUFBWSxlQVVYO0FBVkQsV0FBWSxlQUFlO0lBQ3ZCLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiwrQkFBYSxDQUFBO0lBQ2IsK0JBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsNkJBQWEsQ0FBQTtBQUNqQixDQUFDLEVBVlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFVMUI7QUFDRCxTQUFTLGtCQUFrQixDQUFDLFlBQXVDO0lBQy9ELFFBQVEsWUFBWSxFQUFFO1FBQ2xCLEtBQUssZUFBZSxDQUFDLElBQUk7WUFDckIsT0FBTyxpQkFBUSxDQUFDLElBQUksQ0FBQztRQUN6QixLQUFLLGVBQWUsQ0FBQyxJQUFJO1lBQ3JCLE9BQU8saUJBQVEsQ0FBQyxJQUFJLENBQUM7UUFDekIsS0FBSyxlQUFlLENBQUMsSUFBSTtZQUNy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