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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NoZWNrX2lkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvY29yZS9fY2hlY2tfaWRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0RBQThEO0FBQzlELDJFQUFpRTtBQUNqRSxpREFBcUQ7QUFDckQsaURBQXlEO0FBRTVDLFFBQUEsRUFBRSxHQUFHO0lBQ2QsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNWLElBQUksRUFBRSxDQUFDO0lBQ1AsTUFBTSxFQUFFLENBQUM7SUFDVCxNQUFNLEVBQUUsQ0FBQztJQUNULE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7Q0FDWixDQUFDO0FBQ0Y7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLFNBQWtCLEVBQUUsT0FBZSxFQUFFLFFBQWdCLEVBQUUsR0FBUSxFQUFFLFFBQWtCLEVBQ25GLFNBQTBCLEVBQUUsWUFBWSxHQUFHLElBQUk7SUFDcEUsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQ25CLE1BQU0sT0FBTyxHQUFXLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDL0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxDQUFDO0tBQ3ZGO0lBQ0Qsc0JBQXNCO0lBQ3RCLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtRQUNkLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxPQUFPLEdBQVcsU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvRSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcsdUJBQXVCLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0gsT0FBTyxJQUFJLENBQUM7U0FDZjtLQUNKO0lBQ0Qsb0JBQW9CO0lBQ3BCLE1BQU0sU0FBUyxHQUFXLGtCQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3BDLE1BQU0sU0FBUyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxRQUFRLENBQUUsQ0FBQztRQUNsRCxNQUFNLE9BQU8sR0FBVyxTQUFTLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9FLElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTztnQkFDbkIsZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLDZCQUE2QjtnQkFDM0Qsa0NBQWtDO2dCQUNsQywyQ0FBMkMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdkU7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU87WUFDbkIsZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLDZCQUE2QjtZQUMzRCw2Q0FBNkMsR0FBRyxTQUFTLEdBQUcsSUFBSTtZQUNoRSwyQ0FBMkMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDdkU7SUFDRCx5Q0FBeUM7SUFDekMsSUFBSSxhQUEwQixDQUFDO0lBQy9CLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtRQUNwQixhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDcEIsaUJBQVEsQ0FBQyxJQUFJO1lBQ2IsaUJBQVEsQ0FBQyxJQUFJO1lBQ2IsaUJBQVEsQ0FBQyxHQUFHO1lBQ1osaUJBQVEsQ0FBQyxJQUFJO1lBQ2IsaUJBQVEsQ0FBQyxJQUFJO1lBQ2IsaUJBQVEsQ0FBQyxLQUFLO1lBQ2QsaUJBQVEsQ0FBQyxLQUFLO1lBQ2QsaUJBQVEsQ0FBQyxJQUFJO1lBQ2IsaUJBQVEsQ0FBQyxJQUFJO1NBQUMsQ0FBQyxDQUFDO0tBQ3ZCO1NBQU07UUFDSCxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdEM7SUFDRCxnQkFBZ0I7SUFDaEIsSUFBSSxJQUErQyxDQUFDO0lBQ3BELElBQUk7UUFDQSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUN2RjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxPQUFPLEdBQVcsU0FBUyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMvRSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcscUJBQXFCLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsQ0FBQztLQUN6RztJQUNELGtCQUFrQjtJQUNsQixPQUFPLElBQUksQ0FBQyxDQUFDLDZFQUE2RTtBQUM5RixDQUFDO0FBekRELDRCQXlEQztBQUNEOzs7Ozs7R0FNRztBQUNILFNBQVMsaUJBQWlCLENBQUMsU0FBa0IsRUFBRSxHQUFRLEVBQUUsYUFBMEIsRUFBRSxZQUFxQixFQUFFLFVBQWtCLEVBQUUsU0FBaUI7SUFFN0ksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDckIsNkJBQTZCO1FBQzdCLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLEdBQUcsR0FBRyxpREFBaUQ7Z0JBQ3hHLDRDQUE0QyxHQUFHLFVBQVUsR0FBRywwREFBMEQsR0FBRyxTQUFTLEdBQUcsR0FBRztnQkFDeEksWUFBWSxDQUFDLENBQUM7U0FDckI7UUFDRCxJQUFJLE9BQU8sQ0FBQztRQUNaLElBQUk7WUFDQSxPQUFPLEdBQUcsMEJBQVEsQ0FBQyxHQUFHLENBQWdCLENBQUMsQ0FBQyxRQUFRO1NBQ25EO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixHQUFHLEdBQUcsR0FBRyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCO1NBQ2hIO1FBQ0Qsc0JBQXNCO1FBQ3RCLElBQUksWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEgsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsR0FBRyxHQUFHLEdBQUcsK0JBQStCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtTQUNsSDtRQUNELG9CQUFvQjtRQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLEdBQUcsR0FBRyxnREFBZ0QsQ0FBQyxDQUFDO1NBQ2hIO1FBQ0QsdUJBQXVCO1FBQ3ZCLE9BQU8sT0FBc0IsQ0FBQztLQUNqQztTQUFNO1FBQ0gsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQW9DLENBQUM7S0FDM0o7QUFDTCxDQUFDO0FBQ0Q7Ozs7Ozs7R0FPRztBQUNILFNBQVMsU0FBUyxDQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFLEdBQVEsRUFBRSxRQUFrQixFQUFFLFNBQTBCO0lBQzFHLElBQUksT0FBTyxHQUNQLHFDQUFxQyxHQUFHLE9BQU8sR0FBRyx3QkFBd0I7UUFDMUUsTUFBTTtRQUNOLHNCQUFzQixHQUFHLE9BQU8sR0FBRyxTQUFTO1FBQzVDLHVCQUF1QixHQUFHLFFBQVEsR0FBRyxTQUFTO1FBQzlDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUTtRQUN2RCxnQ0FBZ0MsR0FBRyxzQ0FBdUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRO1FBQzFFLE9BQU87UUFDUCxPQUFPLEdBQUcsUUFBUSxHQUFHLHVFQUF1RTtRQUM1RixNQUFNLENBQUM7SUFDWCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUM1QixPQUFPLElBQUksTUFBTSxHQUFHLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQztLQUNyRTtJQUNELE9BQU87UUFDSCxPQUFPO1lBQ1AsK0NBQStDO1lBQy9DLE1BQU0sQ0FBQztJQUNYLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO1FBQzlCLE9BQU87WUFDSCxNQUFNO2dCQUNOLGFBQWEsQ0FBQyxRQUFRLENBQUM7Z0JBQ3ZCLE9BQU8sQ0FBQztLQUNmO0lBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FBQztJQUNuQixPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxPQUFZO0lBQzNDLFFBQVEsT0FBTyxFQUFFO1FBQ2IsS0FBSyxVQUFFLENBQUMsSUFBSTtZQUNSLE9BQU8sY0FBYyxDQUFDO1FBQzFCLEtBQUssVUFBRSxDQUFDLE1BQU07WUFDVixPQUFPLDBDQUEwQyxDQUFDO1FBQ3RELEtBQUssVUFBRSxDQUFDLE1BQU07WUFDVixPQUFPLGlEQUFpRCxDQUFDO1FBQzdELEtBQUssVUFBRSxDQUFDLE1BQU07WUFDVixPQUFPLGlEQUFpRCxDQUFDO1FBQzdELEtBQUssVUFBRSxDQUFDLE1BQU07WUFDVixPQUFPLGNBQWMsQ0FBQztRQUMxQjtZQUNJLE9BQU8sNkJBQTZCLENBQUM7S0FDNUM7QUFDTCxDQUFDO0FBQ0Q7OztHQUdHO0FBQ0gsU0FBUyxhQUFhLENBQUMsUUFBa0I7SUFDckMsUUFBUSxRQUFRLEVBQUU7UUFDZCxLQUFLLGlCQUFRLENBQUMsSUFBSTtZQUNkLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsS0FBSyxpQkFBUSxDQUFDLElBQUk7WUFDZCxPQUFPLGVBQWUsQ0FBQztRQUMzQixLQUFLLGlCQUFRLENBQUMsSUFBSTtZQUNkLE9BQU8sWUFBWSxDQUFDO1FBQ3hCLEtBQUssaUJBQVEsQ0FBQyxJQUFJO1lBQ2QsT0FBTyxZQUFZLENBQUM7UUFDeEIsS0FBSyxpQkFBUSxDQUFDLEtBQUs7WUFDZixPQUFPLGFBQWEsQ0FBQztRQUN6QixLQUFLLGlCQUFRLENBQUMsS0FBSztZQUNmLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsS0FBSyxpQkFBUSxDQUFDLElBQUk7WUFDZCxPQUFPLGNBQWMsQ0FBQztRQUMxQixLQUFLLGlCQUFRLENBQUMsSUFBSTtZQUNkLE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsS0FBSyxJQUFJO1lBQ0wsT0FBTyxjQUFjLENBQUM7UUFDMUI7WUFDSSxPQUFPLDBDQUEwQyxDQUFDO0tBQ3pEO0FBQ0wsQ0FBQyJ9