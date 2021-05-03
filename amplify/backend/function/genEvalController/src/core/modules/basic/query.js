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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cy9zcmMvY29yZS9tb2R1bGVzL2Jhc2ljL3F1ZXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7R0FLRzs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUNoRCx5REFBc0c7QUFHdEcsa0RBQWlIO0FBQ2pILDJFQUEyRjtBQUMzRixpREFBOEU7QUFDOUUsbUdBQW1HO0FBQ25HLElBQVksU0FTWDtBQVRELFdBQVksU0FBUztJQUNqQix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2IseUJBQWEsQ0FBQTtJQUNiLHlCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtBQUNqQixDQUFDLEVBVFcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFTcEI7QUFDRCxJQUFZLGVBVVg7QUFWRCxXQUFZLGVBQWU7SUFDdkIsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLCtCQUFhLENBQUE7SUFDYiwrQkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw2QkFBYSxDQUFBO0FBQ2pCLENBQUMsRUFWVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQVUxQjtBQUNELFNBQVMsa0JBQWtCLENBQUMsWUFBdUM7SUFDL0QsUUFBUSxZQUFZLEVBQUU7UUFDbEIsS0FBSyxlQUFlLENBQUMsSUFBSTtZQUNyQixPQUFPLGlCQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLEtBQUssZUFBZSxDQUFDLElBQUk7WUFDckIsT0FBTyxpQkFBUSxDQUFDLElBQUksQ0FBQztRQUN6QixLQUFLLGVBQWUsQ0FBQyxJQUFJO1lBQ3JCLE9BQU8saUJBQVEsQ0FBQyxJQUFJLENBQUM7UUFDekIsS0FB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