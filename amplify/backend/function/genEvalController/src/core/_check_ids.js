"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const _check_types_1 = require("./_check_types");
exports.ID = {
    isNull: -1,
    isID: 0,
    isIDL1: 1,
    isIDL2: 2,
    isIDL3: 3,
    isIDL4: 4,
};
/**
 *
 * @param __model__
 * @param fn_name
 * @param arg_name
 * @param arg
 * @param id_types
 * @param ent_types
 * @param check_exists
 */
function checkIDs(__model__, fn_name, arg_name, arg, id_types, ent_types, check_exists = true) {
    if (arg === undefined) {
        const err_msg = _errorMsg(fn_name, arg_name, arg, id_types, ent_types);
        throw new Error(err_msg + 'The argument "' + arg_name + '" is undefined.' + '<br>');
    }
    // check for null case
    if (arg === null) {
        if (id_types.indexOf(exports.ID.isNull) === -1) {
            const err_msg = _errorMsg(fn_name, arg_name, arg, id_types, ent_types);
            throw new Error(err_msg + 'The argument "' + arg_name + '" cannot be null.<br>');
        }
        else {
            return null;
        }
    }
    // check list depths
    const arg_depth = arrs_1.getArrDepth(arg);
    if (id_types.indexOf(arg_depth) === -1) {
        const max_depth = Math.max(...id_types);
        const err_msg = _errorMsg(fn_name, arg_name, arg, id_types, ent_types);
        if (max_depth === 0 && arg_depth > 0) {
            throw new Error(err_msg +
                'The argument "' + arg_name + '" has the wrong structure. ' +
                'A single entity ID is expected. ' +
                'However, the argument is a list of depth ' + arg_depth + '. ');
        }
        throw new Error(err_msg +
            'The argument "' + arg_name + '" has the wrong structure. ' +
            'The maximum depth of the list structure is ' + max_depth + '. ' +
            'However, the argument is a list of depth ' + arg_depth + '. ');
    }
    // create a set of allowable entity types
    let ent_types_set;
    if (ent_types === null) {
        ent_types_set = new Set([
            common_1.EEntType.POSI,
            common_1.EEntType.VERT,
            common_1.EEntType.TRI,
            common_1.EEntType.EDGE,
            common_1.EEntType.WIRE,
            common_1.EEntType.POINT,
            common_1.EEntType.PLINE,
            common_1.EEntType.PGON,
            common_1.EEntType.COLL
        ]);
    }
    else {
        ent_types_set = new Set(ent_types);
    }
    // check the IDs
    let ents;
    try {
        ents = _checkIdsAreValid(__model__, arg, ent_types_set, check_exists, 0, arg_depth);
    }
    catch (err) {
        const err_msg = _errorMsg(fn_name, arg_name, arg, id_types, ent_types);
        throw new Error(err_msg + 'The argument "' + arg_name + '" contains bad IDs:' + err.message + '<br>');
    }
    // return the ents
    return ents; // returns TEntTypeIdx|TEntTypeIdx[]|TEntTypeIdx[][]; depends on which passes
}
exports.checkIDs = checkIDs;
/**
 *
 * @param __model__
 * @param arg
 * @param ent_types_set
 * @param check_exists
 */
function _checkIdsAreValid(__model__, arg, ent_types_set, check_exists, curr_depth, req_depth) {
    if (!Array.isArray(arg)) {
        // check array is homogeneous
        if (curr_depth !== req_depth) {
            throw new Error('<ul><li>The entity with the ID "' + arg + '" is in a list that has an inconsistent depth. ' +
                'For this entity, the depth of the list is ' + curr_depth + ', while previous entities were in lists with a depth of ' + req_depth + '.' +
                '</li></ul>');
        }
        let ent_arr;
        try {
            ent_arr = common_id_funcs_1.idsBreak(arg); // split
        }
        catch (err) {
            throw new Error('<ul><li>The entity ID "' + arg + '" is not a valid Entity ID.</li></ul>'); // check valid id
        }
        // check entity exists
        if (check_exists && !__model__.modeldata.geom.snapshot.hasEnt(__model__.modeldata.active_ssid, ent_arr[0], ent_arr[1])) {
            throw new Error('<ul><li>The entity with the ID "' + arg + '" has been deleted.</li></ul>'); // check id exists
        }
        // check entity type
        if (!ent_types_set.has(ent_arr[0])) {
            throw new Error('<ul><li>The entity with the ID "' + arg + '" is not one of the perimtted types.</li></ul>');
        }
        // return the ent array
        return ent_arr;
    }
    else {
        return arg.map(a_arg => _checkIdsAreValid(__model__, a_arg, ent_types_set, check_exists, curr_depth + 1, req_depth));
    }
}
/**
 *
 * @param fn_name
 * @param arg_name
 * @param arg
 * @param id_types
 * @param ent_types
 */
function _errorMsg(fn_name, arg_name, arg, id_types, ent_types) {
    let err_msg = 'One of the arguments passed to the ' + fn_name + ' function is invalid. ' +
        '<ul>' +
        '<li>Function name: "' + fn_name + '" </li>' +
        '<li>Parameter name: "' + arg_name + '" </li>' +
        '<li>Argument value: ' + JSON.stringify(arg) + ' </li>' +
        '<li>Argument value data type: ' + _check_types_1.getDataTypeStrFromValue(arg) + ' </li>' +
        '</ul>' +
        'The "' + arg_name + '" parameter accepts geometric entity IDs in the following structures:' +
        '<ul>';
    for (const id_type of id_types) {
        err_msg += '<li>' + _getDataTypeStrFromIDType(id_type) + ' </li>';
    }
    err_msg +=
        '</ul>' +
            'The entity IDs can be of the following types:' +
            '<ul>';
    for (const ent_type of ent_types) {
        err_msg +=
            '<li>' +
                _getIDTypeStr(ent_type) +
                '</li>';
    }
    err_msg += '</ul>';
    return err_msg;
}
/**
 *
 * @param check_fn
 */
function _getDataTypeStrFromIDType(id_type) {
    switch (id_type) {
        case exports.ID.isID:
            return 'an entity ID';
        case exports.ID.isIDL1:
            return 'a list of entity IDs (with a depth of 1)';
        case exports.ID.isIDL2:
            return 'a nested list of entity IDs (with a depth of 2)';
        case exports.ID.isIDL3:
            return 'a nested list of entity IDs (with a depth of 3)';
        case exports.ID.isNull:
            return 'a null value';
        default:
            return 'sorry... arg type not found';
    }
}
/**
 *
 * @param ent_type
 */
function _getIDTypeStr(ent_type) {
    switch (ent_type) {
        case common_1.EEntType.POSI:
            return 'positions (ps)';
        case common_1.EEntType.VERT:
            return 'vertices (_v)';
        case common_1.EEntType.EDGE:
            return 'edges (_e)';
        case common_1.EEntType.WIRE:
            return 'wires (_w)';
        case common_1.EEntType.POINT:
            return 'points (pt)';
        case common_1.EEntType.PLINE:
            return 'polylines (pl)';
        case common_1.EEntType.PGON:
            return 'polgons (pg)';
        case common_1.EEntType.COLL:
            return 'collections (co)';
        case null:
            return 'a null value';
        default:
            return 'Internal error... entitiy type not found';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NoZWNrX2lkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3NyYy9jb3JlL19jaGVja19pZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxrREFBOEQ7QUFDOUQsMkVBQWlFO0FBQ2pFLGlEQUFxRDtBQUNyRCxpREFBeUQ7QUFFNUMsUUFBQSxFQUFFLEdBQUc7SUFDZCxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ1YsSUFBSSxFQUFFLENBQUM7SUFDUCxNQUFNLEVBQUUsQ0FBQztJQUNULE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7SUFDVCxNQUFNLEVBQUUsQ0FBQztDQUNaLENBQUM7QUFDRjs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixRQUFRLENBQUMsU0FBa0IsRUFBRSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxHQUFRLEVBQUUsUUFBa0IsRUFDbkYsU0FBMEIsRUFBRSxZQUFZLEdBQUcsSUFBSTtJQUNwRSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7UUFDbkIsTUFBTSxPQUFPLEdBQVcsU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMvRSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLENBQUM7S0FDdkY7SUFDRCxzQkFBc0I7SUFDdEIsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ2QsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNwQyxNQUFNLE9BQU8sR0FBVyxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxHQUFHLGdCQUFnQixH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