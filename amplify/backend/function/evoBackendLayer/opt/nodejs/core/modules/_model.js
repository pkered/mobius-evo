"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GIModel_1 = require("@libs/geo-info/GIModel");
const common_1 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
//  ===============================================================================================
//  Functions used by Mobius
//  ===============================================================================================
/**
 * Creates a new empty model.
 *
 * @returns New model empty.
 */
function __new__() {
    const model = new GIModel_1.GIModel();
    // model.modeldata.attribs.add.addAttrib(EEntType.POSI, EAttribNames.COORDS, EAttribDataTypeStrs.LIST);
    return model;
}
exports.__new__ = __new__;
//  ===============================================================================================
/**
 * A function to preprocess the model, before it enters the node.
 * In cases where there is more than one model connected to a node,
 * the preprocess function will be called before the merge function.
 *
 * @param model The model to preprocess.
 */
function __preprocess__(__model__) {
}
exports.__preprocess__ = __preprocess__;
//  ===============================================================================================
/**
 * A function to postprocess the model, after it enters the node.
 *
 * @param model The model to postprocess.
 */
function __postprocess__(__model__) {
    // TODO
    // Remove all undefined values for the arrays
}
exports.__postprocess__ = __postprocess__;
//  ===============================================================================================
/**
 * Merges the second model into the first model. The geometry, attribues, and groups are all merged.
 * If the models contain contain groups with the same names, then the groups will be merged.
 *
 * @param model1 The model to merge into.
 * @param model2 The model to merge from    .
 */
function __merge__(model1, model2) {
    // model1.merge(model2);
    throw new Error('Deprecated');
}
exports.__merge__ = __merge__;
//  ===============================================================================================
/**
 * Clone a model.
 *
 * @param model The model to clone.
 */
function __clone__(model) {
    // return model.clone();
    throw new Error('Deprecated');
}
exports.__clone__ = __clone__;
//  ===============================================================================================
/**
 * Returns a string representation of this model.
 * @param __model__
 */
function __stringify__(__model__) {
    // return JSON.stringify(__model__.getModelData());
    throw new Error('Not implemented');
}
exports.__stringify__ = __stringify__;
//  ===============================================================================================
/**
 * Select entities in the model.
 * @param __model__
 */
function __select__(__model__, ents_id, var_name) {
    const start = performance.now();
    __model__.modeldata.geom.selected[__model__.getActiveSnapshot()] = [];
    const activeSelected = __model__.modeldata.geom.selected[__model__.getActiveSnapshot()];
    ents_id = ((Array.isArray(ents_id)) ? ents_id : [ents_id]);
    const [ents_id_flat, ents_indices] = _flatten(ents_id);
    const ents_arr = common_id_funcs_1.idsBreak(ents_id_flat);
    const attrib_name = '_' + var_name;
    for (let i = 0; i < ents_arr.length; i++) {
        const ent_arr = ents_arr[i];
        const ent_indices = ents_indices[i];
        const attrib_value = var_name + '[' + ent_indices.join('][') + ']';
        activeSelected.push(ent_arr);
        if (!__model__.modeldata.attribs.query.hasEntAttrib(ent_arr[0], attrib_name)) {
            __model__.modeldata.attribs.add.addAttrib(ent_arr[0], attrib_name, common_1.EAttribDataTypeStrs.STRING);
        }
        __model__.modeldata.attribs.set.setCreateEntsAttribVal(ent_arr[0], ent_arr[1], attrib_name, attrib_value);
    }
}
exports.__select__ = __select__;
function _flatten(arrs) {
    const arr_flat = [];
    const arr_indices = [];
    let count = 0;
    for (const item of arrs) {
        if (Array.isArray(item)) {
            const [arr_flat2, arr_indices2] = _flatten(item);
            for (let i = 0; i < arr_flat2.length; i++) {
                if (arr_flat.indexOf(arr_flat2[i]) !== -1) {
                    continue;
                }
                arr_flat.push(arr_flat2[i]);
                arr_indices2[i].unshift(count);
                arr_indices.push(arr_indices2[i]);
            }
        }
        else {
            arr_flat.push(item);
            arr_indices.push([count]);
        }
        count += 1;
    }
    return [arr_flat, arr_indices];
}
//  ===============================================================================================
/**
 * Checks the model for internal consistency.
 * @param __model__
 */
function __checkModel__(__model__) {
    return __model__.check();
}
exports.__checkModel__ = __checkModel__;
// Moved to attrib.ts
//  ===============================================================================================
/**
//  * Sets an attribute value in the model.
//  * @param __model__
//  */
// export function __setAttrib__(__model__: GIModel, entities: TId|TId[]|TId[][],
//                               attrib_name: string, attrib_values: TAttribDataTypes|TAttribDataTypes[], attrib_index?: number): void {
//     // @ts-ignore
//     if (entities !== null && getArrDepth(entities) === 2) { entities = __.flatten(entities); }
//     // --- Error Check ---
//     const fn_name = 'entities@' + attrib_name;
//     let ents_arr: TEntTypeIdx|TEntTypeIdx[] = null;
//     if (entities !== null && entities !== undefined) {
//         ents_arr = checkIDs(__model__, fn_name, 'entities', entities, [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx|TEntTypeIdx[];
//     }
//     checkAttribName(fn_name , attrib_name);
//     // --- Error Check ---
//     _setAttrib(__model__, ents_arr, attrib_name, attrib_values, attrib_index);
// }
// function _setAttrib(__model__: GIModel, ents_arr: TEntTypeIdx|TEntTypeIdx[],
//         attrib_name: string, attrib_values: TAttribDataTypes|TAttribDataTypes[], attrib_index?: number): void {
//     // check the ents_arr
//     if (ents_arr === null) {
//         _setModelAttrib(__model__, attrib_name, attrib_values as TAttribDataTypes, attrib_index);
//         return;
//     } else if (ents_arr.length === 0) {
//         return;
//     } else if (getArrDepth(ents_arr) === 1) {
//         ents_arr = [ents_arr] as TEntTypeIdx[];
//     }
//     ents_arr = ents_arr as TEntTypeIdx[];
//     // check attrib_values
//     // are we setting a list of ents to a list of values?
//     const attrib_values_depth: number = getArrDepth(attrib_values);
//     if (attrib_values_depth === 2) {
//         // attrib values is a list of lists
//         // we assume that we are trying to set a different value for each ent
//         // so we expect the list lengths to be equal
//         _setEachEntDifferentAttribValue(__model__, ents_arr, attrib_name, attrib_values as TAttribDataTypes[], attrib_index);
//         return;
//     } else if (attrib_values_depth === 1) {
//         // check if ents_arr.length equals attrib_values.length
//         // then check if the first ent already has an attrib with the specified name
//         // if both are true, then we assume we are trying to set each ent to each value
//         const attrib_values_arr: number[]|string[] = attrib_values as number[]|string[];
//         if (ents_arr.length === attrib_values_arr.length) {
//             const first_ent_type: number = ents_arr[0][0];
//             if (__model__.modeldata.attribs.query.hasAttrib(first_ent_type, attrib_name)) {
//                 _setEachEntDifferentAttribValue(__model__, ents_arr, attrib_name, attrib_values as TAttribDataTypes[], attrib_index);
//                 return;
//             }
//         }
//     }
//     // all ents get the same attribute value
//     _setEachEntSameAttribValue(__model__, ents_arr, attrib_name, attrib_values as TAttribDataTypes, attrib_index);
//     return;
// }
// function _setModelAttrib(__model__: GIModel, attrib_name: string, attrib_value: TAttribDataTypes, idx_or_key?: number): void {
//     if (typeof idx_or_key === 'number') {
//         __model__.modeldata.attribs.set.setModelAttribListIdxVal(attrib_name, idx_or_key, attrib_value);
//     } if (typeof idx_or_key === 'string') {
//         __model__.modeldata.attribs.set.setModelAttribDictKeyVal(attrib_name, idx_or_key, attrib_value);
//     } else {
//         __model__.modeldata.attribs.set.setModelAttribVal(attrib_name, attrib_value);
//     }
// }
// function _setEachEntDifferentAttribValue(__model__: GIModel, ents_arr: TEntTypeIdx[],
//         attrib_name: string, attrib_values: TAttribDataTypes[], attrib_index?: number): void {
//     if (ents_arr.length !== attrib_values.length) {
//         throw new Error(
//             'If multiple attributes are being set to multiple values, then the number of entities must match the number of values.');
//     }
//     const ent_type: number = ents_arr[0][0];
//     const ents_i: number[] = _getEntsIndices(__model__, ents_arr);
//     for (let i = 0; i < ents_arr.length; i++) {
//         // --- Error Check ---
//         const fn_name = 'entities@' + attrib_name;
//         checkAttribValue(fn_name , attrib_values[i], attrib_index);
//         // --- Error Check ---
//         if (attrib_index !== null && attrib_index !== undefined) {
//             __model__.modeldata.attribs.set.setAttribListIdxVal(ent_type, ents_i[i], attrib_name, attrib_index, attrib_values[i] as number|string);
//         } else {
//             __model__.modeldata.attribs.set.setAttribVal(ent_type, ents_i[i], attrib_name, attrib_values[i]);
//         }
//     }
// }
// function _setEachEntSameAttribValue(__model__: GIModel, ents_arr: TEntTypeIdx[],
//         attrib_name: string, attrib_value: TAttribDataTypes, attrib_index?: number): void {
//     // --- Error Check ---
//     const fn_name = 'entities@' + attrib_name;
//     checkAttribValue(fn_name , attrib_value, attrib_index);
//     // --- Error Check ---
//     const ent_type: number = ents_arr[0][0];
//     const ents_i: number[] = _getEntsIndices(__model__, ents_arr);
//     if (attrib_index !== null && attrib_index !== undefined) {
//         __model__.modeldata.attribs.set.setAttribListIdxVal(ent_type, ents_i, attrib_name, attrib_index, attrib_value as number|string);
//     } else {
//         __model__.modeldata.attribs.set.setAttribVal(ent_type, ents_i, attrib_name, attrib_value);
//     }
// }
// function _getEntsIndices(__model__: GIModel, ents_arr: TEntTypeIdx[]): number[] {
//     const ent_type: number = ents_arr[0][0];
//     const ents_i: number[] = [];
//     for (let i = 0; i < ents_arr.length; i++) {
//         if (ents_arr[i][0] !== ent_type) {
//             throw new Error('If an attribute is being set for multiple entities, then they must all be of the same type.');
//         }
//         ents_i.push(ents_arr[i][1]);
//     }
//     return ents_i;
// }
// //  ===============================================================================================
// /**
//  * Gets an attribute value from the model.
//  * @param __model__
//  */
// export function __getAttrib__(__model__: GIModel, entities: TId|TId[]|TId[][],
//         attrib_name: string, idx_or_key?: number|string): TAttribDataTypes|TAttribDataTypes[] {
//     // @ts-ignore
//     if (entities !== null && getArrDepth(entities) === 2) { entities = __.flatten(entities); }
//     // --- Error Check ---
//     const fn_name = 'Inline.__getAttrib__';
//     let ents_arr: TEntTypeIdx|TEntTypeIdx[] = null;
//     if (entities !== null && entities !== undefined) {
//         ents_arr = checkIDs(__model__, fn_name, 'entities', entities, [IDcheckObj.isID, IDcheckObj.isIDList], null) as TEntTypeIdx|TEntTypeIdx[];
//     }
//     checkCommTypes(fn_name, 'attrib_name', attrib_name, [TypeCheckObj.isString]);
//     if (idx_or_key !== null && idx_or_key !== undefined) {
//         checkCommTypes(fn_name, 'attrib_index', idx_or_key, [TypeCheckObj.isNumber, TypeCheckObj.isString]);
//     }
//     // --- Error Check ---
//     return _getAttrib(__model__, ents_arr, attrib_name, idx_or_key);
// }
// function _getAttrib(__model__: GIModel, ents_arr: TEntTypeIdx|TEntTypeIdx[],
//         attrib_name: string, idx_or_key?: number|string): TAttribDataTypes|TAttribDataTypes[] {
//     const has_idx_or_key: boolean = idx_or_key !== null && idx_or_key !== undefined;
//     if (ents_arr === null) {
//         if (has_idx_or_key && typeof idx_or_key === 'number') {
//             return __model__.modeldata.attribs.get.getModelAttribListIdxVal(attrib_name, idx_or_key);
//         } else if (has_idx_or_key && typeof idx_or_key === 'string') {
//             return __model__.modeldata.attribs.get.getModelAttribDictKeyVal(attrib_name, idx_or_key);
//         } else {
//             return __model__.modeldata.attribs.get.getModelAttribVal(attrib_name);
//         }
//     } else if (ents_arr.length === 0) {
//         return;
//     } else if (getArrDepth(ents_arr) === 1) {
//         const [ent_type, ent_i]: TEntTypeIdx = ents_arr as TEntTypeIdx;
//         if (attrib_name === 'id') {
//             if (has_idx_or_key) { throw new Error('The "id" attribute does have an index or key.'); }
//             return EEntTypeStr[ent_type] + ent_i as TAttribDataTypes;
//         } else if (has_idx_or_key && typeof idx_or_key === 'number') {
//             return __model__.modeldata.attribs.get.getAttribListIdxVal(ent_type, attrib_name, ent_i, idx_or_key);
//         } else if (has_idx_or_key && typeof idx_or_key === 'string') {
//             return __model__.modeldata.attribs.get.getAttribDictKeyVal(ent_type, attrib_name, ent_i, idx_or_key);
//         } else {
//             return __model__.modeldata.attribs.get.getAttribVal(ent_type, attrib_name, ent_i);
//         }
//     } else {
//         return (ents_arr as TEntTypeIdx[]).map( ent_arr =>
//             _getAttrib(__model__, ent_arr, attrib_name, idx_or_key) ) as TAttribDataTypes[];
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX21vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9jb3JlL21vZHVsZXMvX21vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQWlEO0FBQ2pELGtEQUF5RTtBQUN6RSwyRUFBaUU7QUFFakUsbUdBQW1HO0FBQ25HLDRCQUE0QjtBQUM1QixtR0FBbUc7QUFDbkc7Ozs7R0FJRztBQUNILFNBQWdCLE9BQU87SUFDbkIsTUFBTSxLQUFLLEdBQVksSUFBSSxpQkFBTyxFQUFFLENBQUM7SUFDckMsdUdBQXVHO0lBQ3ZHLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFKRCwwQkFJQztBQUNELG1HQUFtRztBQUNuRzs7Ozs7O0dBTUc7QUFDSCxTQUFnQixjQUFjLENBQUMsU0FBa0I7QUFFakQsQ0FBQztBQUZELHdDQUVDO0FBQ0QsbUdBQW1HO0FBQ25HOzs7O0dBSUc7QUFDSCxTQUFnQixlQUFlLENBQUMsU0FBa0I7SUFDOUMsT0FBTztJQUNQLDZDQUE2QztBQUNqRCxDQUFDO0FBSEQsMENBR0M7QUFDRCxtR0FBbUc7QUFDbkc7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE1BQWUsRUFBRSxNQUFlO0lBQ3RELHdCQUF3QjtJQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFIRCw4QkFHQztBQUNELG1HQUFtRztBQUNuRzs7OztHQUlHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLEtBQWM7SUFDcEMsd0JBQXdCO0lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUhELDhCQUdDO0FBQ0QsbUdBQW1HO0FBQ25HOzs7R0FHRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxTQUFrQjtJQUM1QyxtREFBbUQ7SUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FB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