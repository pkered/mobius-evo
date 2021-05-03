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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHMvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9hdHRyaWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7Ozs7Ozs7Ozs7QUFFSDs7R0FFRztBQUNILGlEQUFnRDtBQUVoRCx5REFDa0c7QUFFbEcsNERBQWdDO0FBRWhDLGtEQUNtRztBQUNuRywyRUFBaUU7QUFDakUsaURBQXFEO0FBQ3JELCtDQUFpQztBQUNqQyxtR0FBbUc7QUFFbkcsSUFBWSxTQVVYO0FBVkQsV0FBWSxTQUFTO0lBQ2pCLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtJQUNiLHdCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2IseUJBQWEsQ0FBQTtJQUNiLHlCQUFhLENBQUE7SUFDYix3QkFBYSxDQUFBO0lBQ2Isd0JBQWEsQ0FBQTtBQUNqQixDQUFDLEVBVlcsU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUFVcEI7QUFDRCxJQUFZLGVBV1g7QUFYRCxXQUFZLGVBQWU7SUFDdkIsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiwrQkFBYSxDQUFBO0lBQ2IsK0JBQWEsQ0FBQTtJQUNiLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsNkJBQWEsQ0FBQTtBQUNqQixDQUFDLEVBWFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFXMUI7QUFDRCxJQUFZLGtCQWFYO0FBYkQsV0FBWSxrQkFBa0I7SUFDMUIsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7SUFDYixpQ0FBYSxDQUFBO0lBQ2IsaUNBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7SUFDYixrQ0FBYSxDQUFBO0lBQ2Isa0NBQWEsQ0FBQTtJQUNiLGlDQUFhLENBQUE7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