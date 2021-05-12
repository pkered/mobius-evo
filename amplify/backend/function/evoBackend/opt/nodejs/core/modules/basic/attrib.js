"use strict";
/**
 * The `attrib` module has functions for working with attributes in teh model.
 * Note that attributes can also be set and retrieved using the "@" symbol.
 * \n
 * \n
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const _check_attribs_1 = require("../../_check_attribs");
const underscore_1 = __importDefault(require("underscore"));
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const lodash = __importStar(require("lodash"));
// ================================================================================================
var _EEntType;
(function (_EEntType) {
    _EEntType["POSI"] = "ps";
    _EEntType["VERT"] = "_v";
    _EEntType["EDGE"] = "_e";
    _EEntType["WIRE"] = "_w";
    _EEntType["FACE"] = "_f";
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
    _EEntTypeAndMod["FACE"] = "_f";
    _EEntTypeAndMod["POINT"] = "pt";
    _EEntTypeAndMod["PLINE"] = "pl";
    _EEntTypeAndMod["PGON"] = "pg";
    _EEntTypeAndMod["COLL"] = "co";
    _EEntTypeAndMod["MOD"] = "mo";
})(_EEntTypeAndMod = exports._EEntTypeAndMod || (exports._EEntTypeAndMod = {}));
var _EAttribPushTarget;
(function (_EAttribPushTarget) {
    _EAttribPushTarget["POSI"] = "ps";
    _EAttribPushTarget["VERT"] = "_v";
    _EAttribPushTarget["EDGE"] = "_e";
    _EAttribPushTarget["WIRE"] = "_w";
    _EAttribPushTarget["FACE"] = "_f";
    _EAttribPushTarget["POINT"] = "pt";
    _EAttribPushTarget["PLINE"] = "pl";
    _EAttribPushTarget["PGON"] = "pg";
    _EAttribPushTarget["COLL"] = "co";
    _EAttribPushTarget["COLLP"] = "cop";
    _EAttribPushTarget["COLLC"] = "coc";
    _EAttribPushTarget["MOD"] = "mo";
})(_EAttribPushTarget = exports._EAttribPushTarget || (exports._EAttribPushTarget = {}));
var _EDataType;
(function (_EDataType) {
    _EDataType["NUMBER"] = "number";
    _EDataType["STRING"] = "string";
    _EDataType["BOOLEAN"] = "boolean";
    _EDataType["LIST"] = "list";
    _EDataType["DICT"] = "dict";
})(_EDataType = exports._EDataType || (exports._EDataType = {}));
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
function _getAttribPushTarget(ent_type_str) {
    switch (ent_type_str) {
        case _EAttribPushTarget.POSI:
            return common_1.EEntType.POSI;
        case _EAttribPushTarget.VERT:
            return common_1.EEntType.VERT;
        case _EAttribPushTarget.EDGE:
            return common_1.EEntType.EDGE;
        case _EAttribPushTarget.WIRE:
            return common_1.EEntType.WIRE;
        case _EAttribPushTarget.POINT:
            return common_1.EEntType.POINT;
        case _EAttribPushTarget.PLINE:
            return common_1.EEntType.PLINE;
        case _EAttribPushTarget.PGON:
            return common_1.EEntType.PGON;
        case _EAttribPushTarget.COLL:
            return common_1.EEntType.COLL;
        case _EAttribPushTarget.COLLC:
            return 'coll_children';
        case _EAttribPushTarget.COLLP:
            return 'coll_parent';
        case _EAttribPushTarget.MOD:
            return common_1.EEntType.MOD;
        default:
            break;
    }
}
// ================================================================================================
/**
 * Set an attribute value for one or more entities.
 * \n
 * If entities is null, then model level attributes will be set.
 * \n
 * @param __model__
 * @param entities Entities, the entities to set the attribute value for.
 * @param attrib The attribute. Can be `name`, `[name, index]`, or `[name, key]`.
 * @param value The attribute value, or list of values.
 * @param method Enum
 */
function Set(__model__, entities, attrib, value, method) {
    // if entities is null, then we are setting model attributes
    // @ts-ignore
    if (entities !== null && arrs_1.getArrDepth(entities) === 2) {
        entities = underscore_1.default.flatten(entities);
    }
    // --- Error Check ---
    const fn_name = 'attrib.Set';
    let ents_arr = null;
    let attrib_name;
    let attrib_idx_key;
    if (__model__.debug) {
        if (value === undefined) {
            throw new Error(fn_name + ': value is undefined');
        }
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isNull, _check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        [attrib_name, attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, attrib);
        _check_attribs_1.checkAttribName(fn_name, attrib_name);
    }
    else {
        if (entities !== null) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        [attrib_name, attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, attrib);
    }
    // --- Error Check ---
    _setAttrib(__model__, ents_arr, attrib_name, value, attrib_idx_key, method);
}
exports.Set = Set;
var _ESet;
(function (_ESet) {
    _ESet["ONE_VALUE"] = "one_value";
    _ESet["MANY_VALUES"] = "many_values";
})(_ESet = exports._ESet || (exports._ESet = {}));
function _setAttrib(__model__, ents_arr, attrib_name, attrib_values, idx_or_key, method) {
    // check the ents_arr
    if (ents_arr === null) {
        _setModelAttrib(__model__, attrib_name, attrib_values, idx_or_key);
        return;
    }
    else if (ents_arr.length === 0) {
        return;
    }
    else if (arrs_1.getArrDepth(ents_arr) === 1) {
        ents_arr = [ents_arr];
    }
    ents_arr = ents_arr;
    if (method === _ESet.MANY_VALUES) {
        // all ents get different attribute value
        _setEachEntDifferentAttribValue(__model__, ents_arr, attrib_name, attrib_values, idx_or_key);
    }
    else {
        // all ents get the same attribute value
        _setEachEntSameAttribValue(__model__, ents_arr, attrib_name, attrib_values, idx_or_key);
    }
    return;
}
function _setModelAttrib(__model__, attrib_name, attrib_value, idx_or_key) {
    if (typeof idx_or_key === 'number') {
        __model__.modeldata.attribs.set.setModelAttribListIdxVal(attrib_name, idx_or_key, attrib_value);
    }
    if (typeof idx_or_key === 'string') {
        __model__.modeldata.attribs.set.setModelAttribDictKeyVal(attrib_name, idx_or_key, attrib_value);
    }
    else {
        __model__.modeldata.attribs.set.setModelAttribVal(attrib_name, attrib_value);
    }
}
function _setEachEntDifferentAttribValue(__model__, ents_arr, attrib_name, attrib_values, idx_or_key) {
    if (ents_arr.length !== attrib_values.length) {
        throw new Error('If multiple entities are being set to multiple values, then the number of entities must match the number of values.');
    }
    const ent_type = ents_arr[0][0];
    const ents_i = _getEntsIndices(__model__, ents_arr);
    for (let i = 0; i < ents_arr.length; i++) {
        // --- Error Check ---
        if (__model__.debug) {
            const fn_name = 'entities@' + attrib_name;
            _check_attribs_1.checkAttribValue(fn_name, attrib_values[i]);
            if (idx_or_key !== null) {
                _check_attribs_1.checkAttribIdxKey(fn_name, idx_or_key);
            }
        }
        // --- Error Check ---
        // if this is a complex type, make a deep copy
        let val = attrib_values[i];
        if (val instanceof Object) {
            val = lodash.cloneDeep(val);
        }
        if (typeof idx_or_key === 'number') {
            __model__.modeldata.attribs.set.setEntsAttribListIdxVal(ent_type, ents_i[i], attrib_name, idx_or_key, val);
        }
        if (typeof idx_or_key === 'string') {
            __model__.modeldata.attribs.set.setEntsAttribDictKeyVal(ent_type, ents_i[i], attrib_name, idx_or_key, val);
        }
        else {
            __model__.modeldata.attribs.set.setCreateEntsAttribVal(ent_type, ents_i[i], attrib_name, val);
        }
    }
}
function _setEachEntSameAttribValue(__model__, ents_arr, attrib_name, attrib_value, idx_or_key) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'entities@' + attrib_name;
        _check_attribs_1.checkAttribValue(fn_name, attrib_value);
    }
    // --- Error Check ---
    // if this is a complex type, make a deep copy
    if (attrib_value instanceof Object) {
        attrib_value = lodash.cloneDeep(attrib_value);
    }
    const ent_type = ents_arr[0][0];
    const ents_i = _getEntsIndices(__model__, ents_arr);
    if (typeof idx_or_key === 'number') {
        __model__.modeldata.attribs.set.setEntsAttribListIdxVal(ent_type, ents_i, attrib_name, idx_or_key, attrib_value);
    }
    else if (typeof idx_or_key === 'string') {
        __model__.modeldata.attribs.set.setEntsAttribDictKeyVal(ent_type, ents_i, attrib_name, idx_or_key, attrib_value);
    }
    else {
        __model__.modeldata.attribs.set.setCreateEntsAttribVal(ent_type, ents_i, attrib_name, attrib_value);
    }
}
function _getEntsIndices(__model__, ents_arr) {
    const ent_type = ents_arr[0][0];
    const ents_i = [];
    for (let i = 0; i < ents_arr.length; i++) {
        if (ents_arr[i][0] !== ent_type) {
            throw new Error('If an attribute is being set for multiple entities, then they must all be of the same type.');
        }
        ents_i.push(ents_arr[i][1]);
    }
    return ents_i;
}
// ================================================================================================
/**
 * Get attribute values for one or more entities.
 * \n
 * If entities is null, then model level attributes will be returned.
 * \n
 * @param __model__
 * @param entities Entities, the entities to get the attribute values for.
 * @param attrib The attribute. Can be `name`, `[name, index]`, or `[name, key]`.
 * @returns One attribute value, or a list of attribute values.
 */
function Get(__model__, entities, attrib) {
    // @ts-ignore
    if (entities !== null && arrs_1.getArrDepth(entities) === 2) {
        entities = underscore_1.default.flatten(entities);
    }
    // --- Error Check ---
    let ents_arr = null;
    let attrib_name;
    let attrib_idx_key;
    const fn_name = 'attrib.Get';
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        }
        [attrib_name, attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, attrib);
        _check_attribs_1.checkAttribName(fn_name, attrib_name);
    }
    else {
        if (entities !== null && entities !== undefined) {
            // ents_arr = splitIDs(fn_name, 'entities', entities,
            // [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx|TEntTypeIdx[];
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        [attrib_name, attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, attrib);
    }
    // --- Error Check ---
    return _get(__model__, ents_arr, attrib_name, attrib_idx_key);
}
exports.Get = Get;
function _get(__model__, ents_arr, attrib_name, attrib_idx_key) {
    const has_idx_key = attrib_idx_key !== null && attrib_idx_key !== undefined;
    if (ents_arr === null) {
        // get the attrib values from the model
        if (typeof attrib_idx_key === 'number') {
            return __model__.modeldata.attribs.get.getModelAttribListIdxVal(attrib_name, attrib_idx_key);
        }
        else if (typeof attrib_idx_key === 'string') {
            return __model__.modeldata.attribs.get.getModelAttribDictKeyVal(attrib_name, attrib_idx_key);
        }
        else {
            return __model__.modeldata.attribs.get.getModelAttribVal(attrib_name);
        }
    }
    else if (ents_arr.length === 0) {
        return [];
    }
    else if (arrs_1.getArrDepth(ents_arr) === 1) {
        const [ent_type, ent_i] = ents_arr;
        // check if this is ID
        if (attrib_name === '_id') {
            if (has_idx_key) {
                throw new Error('The "_id" attribute does have an index.');
            }
            return common_1.EEntTypeStr[ent_type] + ent_i;
        }
        // get the attrib values from the ents
        let val;
        if (typeof attrib_idx_key === 'number') {
            val = __model__.modeldata.attribs.get.getEntAttribListIdxVal(ent_type, ent_i, attrib_name, attrib_idx_key);
        }
        else if (typeof attrib_idx_key === 'string') {
            val = __model__.modeldata.attribs.get.getEntAttribDictKeyVal(ent_type, ent_i, attrib_name, attrib_idx_key);
        }
        else {
            val = __model__.modeldata.attribs.get.getEntAttribVal(ent_type, ent_i, attrib_name);
        }
        // if this is a complex type, make a deep copy
        if (val instanceof Object) {
            val = lodash.cloneDeep(val);
        }
        return val;
    }
    else {
        return ents_arr.map(ent_arr => _get(__model__, ent_arr, attrib_name, attrib_idx_key));
    }
}
// ================================================================================================
/**
 * Add one or more attributes to the model.
 * The attribute will appear as a new column in the attribute table.
 * (At least one entity must have a value for the column to be visible in the attribute table).
 * All attribute values will be set to null.
 * \n
 * @param __model__
 * @param ent_type_sel Enum, the attribute entity type.
 * @param data_type_sel Enum, the data type for this attribute
 * @param attribs A single attribute name, or a list of attribute names.
 */
function Add(__model__, ent_type_sel, data_type_sel, attribs) {
    // --- Error Check ---
    const fn_name = 'attrib.Add';
    const arg_name = 'ent_type_sel';
    let ent_type;
    if (__model__.debug) {
        if (ent_type_sel === 'ps' && attribs === 'xyz') {
            throw new Error(fn_name + ': ' + arg_name + ' The xyz attribute already exists.');
        }
        // convert the ent_type_str to an ent_type
        ent_type = _getEntTypeFromStr(ent_type_sel);
        if (ent_type === undefined) {
            throw new Error(fn_name + ': ' + arg_name + ' is not one of the following valid types - ' +
                'ps, _v, _e, _w, _f, pt, pl, pg, co, mo.');
        }
        // create an array of attrib names
        if (!Array.isArray(attribs)) {
            attribs = [attribs];
        }
        attribs = attribs;
        for (const attrib of attribs) {
            _check_attribs_1.checkAttribName(fn_name, attrib);
        }
    }
    else {
        // convert the ent_type_str to an ent_type
        ent_type = _getEntTypeFromStr(ent_type_sel);
        // create an array of attrib names
        if (!Array.isArray(attribs)) {
            attribs = [attribs];
        }
        attribs = attribs;
    }
    // --- Error Check ---
    // set the data type
    let data_type = null;
    switch (data_type_sel) {
        case _EDataType.NUMBER:
            data_type = common_1.EAttribDataTypeStrs.NUMBER;
            break;
        case _EDataType.STRING:
            data_type = common_1.EAttribDataTypeStrs.STRING;
            break;
        case _EDataType.BOOLEAN:
            data_type = common_1.EAttribDataTypeStrs.BOOLEAN;
            break;
        case _EDataType.LIST:
            data_type = common_1.EAttribDataTypeStrs.LIST;
            break;
        case _EDataType.DICT:
            data_type = common_1.EAttribDataTypeStrs.DICT;
            break;
        default:
            throw new Error('Data type not recognised.');
            break;
    }
    // create the attribute
    for (const attrib of attribs) {
        __model__.modeldata.attribs.add.addAttrib(ent_type, attrib, data_type);
    }
}
exports.Add = Add;
// ================================================================================================
/**
 * Delete one or more attributes from the model.
 * The column in the attribute table will be deleted.
 * All values will also be deleted.
 * \n
 * @param __model__
 * @param ent_type_sel Enum, the attribute entity type.
 * @param attribs A single attribute name, or a list of attribute names. In 'null' all attributes will be deleted.
 */
function Delete(__model__, ent_type_sel, attribs) {
    // --- Error Check ---
    const fn_name = 'attrib.Delete';
    const arg_name = 'ent_type_sel';
    let ent_type;
    if (__model__.debug) {
        if (ent_type_sel === 'ps' && attribs === 'xyz') {
            throw new Error(fn_name + ': ' + arg_name + ' Deleting xyz attribute is not allowed.');
        }
        // convert the ent_type_str to an ent_type
        ent_type = _getEntTypeFromStr(ent_type_sel);
        if (ent_type === undefined) {
            throw new Error(fn_name + ': ' + arg_name + ' is not one of the following valid types - ' +
                'ps, _v, _e, _w, _f, pt, pl, pg, co, mo.');
        }
        // create an array of attrib names
        if (attribs === null) {
            attribs = __model__.modeldata.attribs.getAttribNamesUser(ent_type);
        }
        if (!Array.isArray(attribs)) {
            attribs = [attribs];
        }
        attribs = attribs;
        for (const attrib of attribs) {
            _check_attribs_1.checkAttribName(fn_name, attrib);
        }
    }
    else {
        // convert the ent_type_str to an ent_type
        ent_type = _getEntTypeFromStr(ent_type_sel);
        // create an array of attrib names
        if (attribs === null) {
            attribs = __model__.modeldata.attribs.getAttribNamesUser(ent_type);
        }
        if (!Array.isArray(attribs)) {
            attribs = [attribs];
        }
        attribs = attribs;
    }
    // --- Error Check ---
    // delete the attributes
    for (const attrib of attribs) {
        __model__.modeldata.attribs.del.delEntAttrib(ent_type, attrib);
    }
}
exports.Delete = Delete;
// ================================================================================================
/**
 * Rename an attribute in the model.
 * The header for column in the attribute table will be renamed.
 * All values will remain the same.
 * \n
 * @param __model__
 * @param ent_type_sel Enum, the attribute entity type.
 * @param old_attrib The old attribute name.
 * @param new_attrib The old attribute name.
 */
function Rename(__model__, ent_type_sel, old_attrib, new_attrib) {
    if (ent_type_sel === 'ps' && old_attrib === 'xyz') {
        return;
    }
    // --- Error Check ---
    const fn_name = 'attrib.Rename';
    const arg_name = 'ent_type_sel';
    const ent_type = _getEntTypeFromStr(ent_type_sel);
    if (__model__.debug) {
        _check_attribs_1.checkAttribName(fn_name, old_attrib);
        _check_attribs_1.checkAttribName(fn_name, new_attrib);
        // --- Error Check ---
        // convert the ent_type_str to an ent_type
        if (ent_type === undefined) {
            throw new Error(fn_name + ': ' + arg_name + ' is not one of the following valid types - ' +
                'ps, _v, _e, _w, _f, pt, pl, pg, co, mo.');
        }
    }
    // create the attribute
    __model__.modeldata.attribs.renameAttrib(ent_type, old_attrib, new_attrib);
}
exports.Rename = Rename;
// ================================================================================================
/**
 * Push attributes up or down the hierarchy. The original attribute is not changed.
 * \n
 * @param __model__
 * @param entities Entities, the entities to push the attribute values for.
 * @param attrib The attribute. Can be `name`, `[name, index_or_key]`,
 * `[source_name, source_index_or_key, target_name]` or `[source_name, source_index_or_key, target_name, target_index_or_key]`.
 * @param ent_type_sel Enum, the target entity type where the attribute values should be pushed to.
 * @param method_sel Enum, the method for aggregating attribute values in cases where aggregation is necessary.
 */
function Push(__model__, entities, attrib, ent_type_sel, method_sel) {
    if (entities !== null) {
        const depth = arrs_1.getArrDepth(entities);
        if (depth === 0) {
            entities = [entities];
        }
        else if (depth === 2) {
            // @ts-ignore
            entities = underscore_1.default.flatten(entities);
        }
    }
    // --- Error Check ---
    const fn_name = 'attrib.Push';
    let ents_arr = null;
    let source_attrib_name;
    let source_attrib_idx_key;
    let target_attrib_name;
    let target_attrib_idx_key;
    let source_ent_type;
    const indices = [];
    let target;
    let source_attrib = null;
    let target_attrib = null;
    if (Array.isArray(attrib)) {
        // set source attrib
        source_attrib = [
            attrib[0],
            (attrib.length > 1 ? attrib[1] : null)
        ];
        // set target attrib
        target_attrib = [
            (attrib.length > 2 ? attrib[2] : attrib[0]),
            (attrib.length > 3 ? attrib[3] : null)
        ];
    }
    else {
        source_attrib = [attrib, null];
        target_attrib = [attrib, null];
    }
    if (__model__.debug) {
        if (entities !== null && entities !== undefined) {
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], null);
        }
        [source_attrib_name, source_attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, source_attrib);
        [target_attrib_name, target_attrib_idx_key] = _check_attribs_1.checkAttribNameIdxKey(fn_name, target_attrib);
        // --- Error Check ---
        // get the source ent_type and indices
        source_ent_type = ents_arr[0][0];
        for (const ent_arr of ents_arr) {
            if (ent_arr[0] !== source_ent_type) {
                throw new Error('The entities must all be of the same type.');
            }
            indices.push(ent_arr[1]);
        }
        // check the names
        _check_attribs_1.checkAttribName(fn_name, source_attrib_name);
        _check_attribs_1.checkAttribName(fn_name, target_attrib_name);
        // get the target ent_type
        target = _getAttribPushTarget(ent_type_sel);
        if (source_ent_type === target) {
            throw new Error('The new attribute is at the same level as the existing attribute.');
        }
    }
    else {
        if (entities !== null && entities !== undefined) {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        [source_attrib_name, source_attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, source_attrib);
        [target_attrib_name, target_attrib_idx_key] = _check_attribs_1.splitAttribNameIdxKey(fn_name, target_attrib);
        // get the source ent_type and indices
        source_ent_type = ents_arr[0][0];
        for (const ent_arr of ents_arr) {
            indices.push(ent_arr[1]);
        }
        // get the target ent_type
        target = _getAttribPushTarget(ent_type_sel);
    }
    // get the method
    const method = _convertPushMethod(method_sel);
    // do the push
    __model__.modeldata.attribs.push.pushAttribVals(source_ent_type, source_attrib_name, source_attrib_idx_key, indices, target, target_attrib_name, target_attrib_idx_key, method);
}
exports.Push = Push;
var _EPushMethodSel;
(function (_EPushMethodSel) {
    _EPushMethodSel["FIRST"] = "first";
    _EPushMethodSel["LAST"] = "last";
    _EPushMethodSel["AVERAGE"] = "average";
    _EPushMethodSel["MEDIAN"] = "median";
    _EPushMethodSel["SUM"] = "sum";
    _EPushMethodSel["MIN"] = "min";
    _EPushMethodSel["MAX"] = "max";
})(_EPushMethodSel = exports._EPushMethodSel || (exports._EPushMethodSel = {}));
function _convertPushMethod(select) {
    switch (select) {
        case _EPushMethodSel.AVERAGE:
            return common_1.EAttribPush.AVERAGE;
        case _EPushMethodSel.MEDIAN:
            return common_1.EAttribPush.MEDIAN;
        case _EPushMethodSel.SUM:
            return common_1.EAttribPush.SUM;
        case _EPushMethodSel.MIN:
            return common_1.EAttribPush.MIN;
        case _EPushMethodSel.MAX:
            return common_1.EAttribPush.MAX;
        case _EPushMethodSel.FIRST:
            return common_1.EAttribPush.FIRST;
        case _EPushMethodSel.LAST:
            return common_1.EAttribPush.LAST;
        default:
            break;
    }
}
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvYXR0cmliLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7R0FLRzs7Ozs7Ozs7Ozs7O0FBRUg7O0dBRUc7QUFDSCxpREFBZ0Q7QUFFaEQseURBQ2tHO0FBRWxHLDREQUFnQztBQUVoQyxrREFDbUc7QUFDbkcsMkVBQWlFO0FBQ2pFLGlEQUFxRDtBQUNyRCwrQ0FBaUM7QUFDakMsbUdBQW1HO0FBRW5HLElBQVksU0FVWDtBQVZELFdBQVksU0FBUztJQUNqQix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHlCQUFhLENBQUE7SUFDYix5QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7QUFDakIsQ0FBQyxFQVZXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBVXBCO0FBQ0QsSUFBWSxlQVdYO0FBWEQsV0FBWSxlQUFlO0lBQ3ZCLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsK0JBQWEsQ0FBQTtJQUNiLCtCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLDZCQUFhLENBQUE7QUFDakIsQ0FBQyxFQVhXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBVzFCO0FBQ0QsSUFBWSxrQkFhWDtBQWJELFdBQVksa0JBQWtCO0lBQzFCLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2IsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2Isa0NBQWEs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