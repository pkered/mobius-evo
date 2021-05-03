"use strict";
/**
 * The `util` module has some utility functions used for debugging.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const _check_ids_1 = require("../../_check_ids");
const GIModel_1 = require("@libs/geo-info/GIModel");
const common_1 = require("@libs/geo-info/common");
const arrs_1 = require("@assets/libs/util/arrs");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const io_1 = require("./io");
// ================================================================================================
/**
 * Select entities in the model.
 *
 * @param __model__
 * @param entities
 * @returns void
 */
function Select(__model__, entities) {
    __model__.modeldata.geom.selected[__model__.getActiveSnapshot()] = [];
    const activeSelected = __model__.modeldata.geom.selected[__model__.getActiveSnapshot()];
    entities = ((Array.isArray(entities)) ? entities : [entities]);
    const [ents_id_flat, ents_indices] = _flatten(entities);
    const ents_arr = common_id_funcs_1.idsBreak(ents_id_flat);
    const attrib_name = '_selected';
    for (let i = 0; i < ents_arr.length; i++) {
        const ent_arr = ents_arr[i];
        const ent_indices = ents_indices[i];
        const attrib_value = 'selected[' + ent_indices.join('][') + ']';
        activeSelected.push(ent_arr);
        if (!__model__.modeldata.attribs.query.hasEntAttrib(ent_arr[0], attrib_name)) {
            __model__.modeldata.attribs.add.addAttrib(ent_arr[0], attrib_name, common_1.EAttribDataTypeStrs.STRING);
        }
        __model__.modeldata.attribs.set.setCreateEntsAttribVal(ent_arr[0], ent_arr[1], attrib_name, attrib_value);
    }
}
exports.Select = Select;
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
// ================================================================================================
/**
 * Returns am html string representation of the parameters in this model
 *
 * @param __model__
 * @param __constList__
 * @returns Text that summarises what is in the model.
 */
function ParamInfo(__model__, __constList__) {
    return JSON.stringify(__constList__);
}
exports.ParamInfo = ParamInfo;
// ================================================================================================
/**
 * Returns an html string representation of one or more entities in the model.
 *
 * @param __model__
 * @param entities One or more objects ot collections.
 * @returns void
 */
function EntityInfo(__model__, entities) {
    entities = arrs_1.arrMakeFlat(entities);
    // --- Error Check ---
    const fn_name = 'collection.Info';
    let ents_arr;
    if (__model__.debug) {
        ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'coll', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1], [common_1.EEntType.COLL, common_1.EEntType.PGON, common_1.EEntType.PLINE, common_1.EEntType.POINT]);
    }
    else {
        // ents_arr = splitIDs(fn_name, 'coll', entities,
        //     [IDcheckObj.isID, IDcheckObj.isIDList],
        //     [EEntType.COLL, EEntType.PGON, EEntType.PLINE, EEntType.POINT]) as TEntTypeIdx[];
        ents_arr = common_id_funcs_1.idsBreak(entities);
    }
    // --- Error Check ---
    let result = '<h4>Entity Information:</h4>';
    for (const ent_arr of ents_arr) {
        const [ent_type, ent_i] = ent_arr;
        switch (ent_type) {
            case common_1.EEntType.COLL:
                result += _collInfo(__model__, ent_i);
                break;
            case common_1.EEntType.PGON:
                result += _pgonInfo(__model__, ent_i);
                break;
            case common_1.EEntType.PLINE:
                result += _plineInfo(__model__, ent_i);
                break;
            case common_1.EEntType.POINT:
                result += _pointInfo(__model__, ent_i);
                break;
            default:
                break;
        }
    }
    return result;
}
exports.EntityInfo = EntityInfo;
function _getAttribs(__model__, ent_type, ent_i) {
    const names = __model__.modeldata.attribs.getAttribNames(ent_type);
    const attribs_with_vals = [];
    for (const name of names) {
        const val = __model__.modeldata.attribs.get.getEntAttribVal(ent_type, ent_i, name);
        if (val !== undefined) {
            attribs_with_vals.push(name);
        }
    }
    return attribs_with_vals;
}
function _getColls(__model__, ent_type, ent_i) {
    const ssid = __model__.modeldata.active_ssid;
    let colls_i = [];
    if (ent_type === common_1.EEntType.COLL) {
        const parent = __model__.modeldata.geom.snapshot.getCollParent(ssid, ent_i);
        if (parent !== -1) {
            colls_i = [parent];
        }
    }
    else {
        colls_i = __model__.modeldata.geom.nav.navAnyToColl(ent_type, ent_i);
    }
    const colls_names = [];
    for (const coll_i of colls_i) {
        let coll_name = 'No name';
        if (__model__.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.COLL, common_1.EAttribNames.COLL_NAME)) {
            coll_name = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.COLL, coll_i, common_1.EAttribNames.COLL_NAME);
        }
        colls_names.push(coll_name);
    }
    return colls_names;
}
function _pointInfo(__model__, point_i) {
    let info = '';
    // get the data
    const attribs = _getAttribs(__model__, common_1.EEntType.POINT, point_i);
    const colls_names = _getColls(__model__, common_1.EEntType.POINT, point_i);
    // make str
    info += '<ul>';
    info += '<li>Type: <b>Point</b></li>';
    info += '<ul>';
    if (attribs.length !== 0) {
        info += '<li>Attribs: ' + attribs.join(', ') + '</li>';
    }
    if (colls_names.length === 1) {
        info += '<li>In collection: ' + colls_names[0] + '</li>';
    }
    else if (colls_names.length > 1) {
        info += '<li>In ' + colls_names.length + ' collections: ' + colls_names.join(', ') + '</li>';
    }
    info += '</ul>';
    info += '</ul>';
    return info;
}
function _plineInfo(__model__, pline_i) {
    let info = '';
    // get the data
    const attribs = _getAttribs(__model__, common_1.EEntType.PLINE, pline_i);
    const num_verts = __model__.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PLINE, pline_i).length;
    const num_edges = __model__.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.PLINE, pline_i).length;
    const colls_names = _getColls(__model__, common_1.EEntType.PLINE, pline_i);
    // make str
    info += '<ul>';
    info += '<li>Type: <b>Polyline</b></li>';
    info += '<ul>';
    if (attribs.length !== 0) {
        info += '<li>Attribs: ' + attribs.join(', ') + '</li>';
    }
    if (num_verts) {
        info += '<li>Num verts: ' + num_verts + '</li>';
    }
    if (num_edges) {
        info += '<li>Num edges: ' + num_edges + '</li>';
    }
    if (colls_names.length === 1) {
        info += '<li>In collection: ' + colls_names[0] + '</li>';
    }
    else if (colls_names.length > 1) {
        info += '<li>In ' + colls_names.length + ' collections: ' + colls_names.join(', ') + '</li>';
    }
    info += '</ul>';
    info += '</ul>';
    return info;
}
function _pgonInfo(__model__, pgon_i) {
    let info = '';
    // get the data
    const attribs = _getAttribs(__model__, common_1.EEntType.PGON, pgon_i);
    const num_verts = __model__.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PGON, pgon_i).length;
    const num_edges = __model__.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.PGON, pgon_i).length;
    const num_wires = __model__.modeldata.geom.nav.navAnyToWire(common_1.EEntType.PGON, pgon_i).length;
    const colls_i = __model__.modeldata.geom.nav.navPgonToColl(pgon_i);
    const colls_names = _getColls(__model__, common_1.EEntType.PGON, pgon_i);
    // make str
    info += '<ul>';
    info += '<li>Type: <b>Polygon</b></li>';
    info += '<ul>';
    if (attribs.length !== 0) {
        info += '<li>Attribs: ' + attribs.join(', ') + '</li>';
    }
    if (num_verts) {
        info += '<li>Num verts: ' + num_verts + '</li>';
    }
    if (num_edges) {
        info += '<li>Num edges: ' + num_edges + '</li>';
    }
    if (num_wires) {
        info += '<li>Num wires: ' + num_wires + '</li>';
    }
    if (colls_i.length === 1) {
        info += '<li>In collection: ' + colls_names[0] + '</li>';
    }
    else if (colls_i.length > 1) {
        info += '<li>In ' + colls_i.length + ' collections: ' + colls_names.join(', ') + '</li>';
    }
    info += '</ul>';
    info += '</ul>';
    return info;
}
function _collInfo(__model__, coll_i) {
    const ssid = __model__.modeldata.active_ssid;
    let info = '';
    // get the data
    let coll_name = 'None';
    if (__model__.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.COLL, common_1.EAttribNames.COLL_NAME)) {
        coll_name = __model__.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.COLL, coll_i, common_1.EAttribNames.COLL_NAME);
    }
    const attribs = _getAttribs(__model__, common_1.EEntType.COLL, coll_i);
    const num_pgons = __model__.modeldata.geom.nav.navCollToPgon(coll_i).length;
    const num_plines = __model__.modeldata.geom.nav.navCollToPline(coll_i).length;
    const num_points = __model__.modeldata.geom.nav.navCollToPoint(coll_i).length;
    const colls_names = _getColls(__model__, common_1.EEntType.COLL, coll_i);
    // make str
    info += '<ul>';
    info += '<li>Type: <b>Collection</b></li>';
    info += '<ul>';
    info += '<li>Name: <b>' + coll_name + '</b></li>';
    if (attribs.length !== 0) {
        info += '<li>Attribs: ' + attribs.join(', ') + '</li>';
    }
    if (num_pgons) {
        info += '<li>Num pgons: ' + num_pgons + '</li>';
    }
    if (num_plines) {
        info += '<li>Num plines: ' + num_plines + '</li>';
    }
    if (num_points) {
        info += '<li>Num points: ' + num_points + '</li>';
    }
    if (colls_names.length === 1) {
        info += '<li>In collection: ' + colls_names[0] + '</li>';
    }
    else if (colls_names.length > 1) {
        info += '<li>In ' + colls_names.length + ' collections: ' + colls_names.join(', ') + '</li>';
    }
    const children = __model__.modeldata.geom.snapshot.getCollChildren(ssid, coll_i);
    if (children.length > 0) {
        info += '<li>Child collections: </li>';
        for (const child of children) {
            info += _collInfo(__model__, child);
        }
    }
    info += '</ul>';
    info += '</ul>';
    return info;
}
// ================================================================================================
/**
 * Returns an html string representation of the contents of this model
 *
 * @param __model__
 * @returns Text that summarises what is in the model, click print to see this text.
 */
function ModelInfo(__model__) {
    let info = '<h4>Model Information:</h4>';
    info += '<ul>';
    // model attribs
    const model_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.MOD);
    if (model_attribs.length !== 0) {
        info += '<li>Model attribs: ' + model_attribs.join(', ') + '</li>';
    }
    // collections
    const num_colls = __model__.modeldata.geom.query.numEnts(common_1.EEntType.COLL);
    const coll_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.COLL);
    info += '<li>';
    info += '<b>Collections</b>: ' + num_colls; // + ' (Deleted: ' + num_del_colls + ') ';
    if (coll_attribs.length !== 0) {
        info += 'Attribs: ' + coll_attribs.join(', ');
    }
    info += '</li>';
    // pgons
    const num_pgons = __model__.modeldata.geom.query.numEnts(common_1.EEntType.PGON);
    const pgon_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.PGON);
    info += '<li>';
    info += '<b>Polygons</b>: ' + num_pgons; // + ' (Deleted: ' + num_del_pgons + ') ';
    if (pgon_attribs.length !== 0) {
        info += 'Attribs: ' + pgon_attribs.join(', ');
    }
    info += '</li>';
    // plines
    const num_plines = __model__.modeldata.geom.query.numEnts(common_1.EEntType.PLINE);
    const pline_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.PLINE);
    info += '<li>';
    info += '<b>Polylines</b>: ' + num_plines; // + ' (Deleted: ' + num_del_plines + ') ';
    if (pline_attribs.length !== 0) {
        info += 'Attribs: ' + pline_attribs.join(', ');
    }
    info += '</li>';
    // points
    const num_points = __model__.modeldata.geom.query.numEnts(common_1.EEntType.POINT);
    const point_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.POINT);
    info += '<li>';
    info += '<b>Points</b>: ' + num_points; // + ' (Deleted: ' + num_del_points + ') ';
    if (point_attribs.length !== 0) {
        info += 'Attribs: ' + point_attribs.join(', ');
    }
    info += '</li>';
    // wires
    const num_wires = __model__.modeldata.geom.query.numEnts(common_1.EEntType.WIRE);
    const wire_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.WIRE);
    info += '<li>';
    info += '<b>Wires</b>: ' + num_wires; // + ' (Deleted: ' + num_del_wires + ') ';
    if (wire_attribs.length !== 0) {
        info += 'Attribs: ' + wire_attribs.join(', ');
    }
    info += '</li>';
    // edges
    const num_edges = __model__.modeldata.geom.query.numEnts(common_1.EEntType.EDGE);
    const edge_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.EDGE);
    info += '<li>';
    info += '<b>Edges</b>: ' + num_edges; // + ' (Deleted: ' + num_del_edges + ') ';
    if (edge_attribs.length !== 0) {
        info += 'Attribs: ' + edge_attribs.join(', ');
    }
    info += '</li>';
    // verts
    const num_verts = __model__.modeldata.geom.query.numEnts(common_1.EEntType.VERT);
    const vert_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.VERT);
    info += '<li>';
    info += '<b>Vertices</b>: ' + num_verts; // + ' (Deleted: ' + num_del_verts + ') ';
    if (vert_attribs.length !== 0) {
        info += 'Attribs: ' + vert_attribs.join(', ');
    }
    info += '</li>';
    // posis
    const num_posis = __model__.modeldata.geom.query.numEnts(common_1.EEntType.POSI);
    const posi_attribs = __model__.modeldata.attribs.getAttribNames(common_1.EEntType.POSI);
    info += '<li>';
    info += '<b>Positions</b>: ' + num_posis; // + ' (Deleted: ' + num_del_posis + ') ';
    if (posi_attribs.length !== 0) {
        info += 'Attribs: ' + posi_attribs.join(', ');
    }
    info += '</li>';
    // end
    info += '</ul>';
    // return the string
    return info;
}
exports.ModelInfo = ModelInfo;
// ================================================================================================
/**
 * Checks the internal consistency of the model.
 *
 * @param __model__
 * @returns Text that summarises what is in the model, click print to see this text.
 */
function ModelCheck(__model__) {
    console.log('==== ==== ==== ====');
    console.log('MODEL GEOM\n', __model__.modeldata.geom.toStr());
    // console.log('MODEL ATTRIBS\n', __model__.modeldata.attribs.toStr());
    console.log('META\n', __model__.metadata.toDebugStr());
    console.log('==== ==== ==== ====');
    console.log(__model__);
    const check = __model__.check();
    if (check.length > 0) {
        return String(check);
    }
    return 'No internal inconsistencies have been found.';
}
exports.ModelCheck = ModelCheck;
// ================================================================================================
/**
 * Compares two models.
 * Checks that every entity in this model also exists in the input_data.
 *
 * Additional entitis in the input data will not affect the score.
 *
 * Attributes at the model level are ignored except for the `material` attributes.
 *
 * For grading, this model is assumed to be the answer model, and the input model is assumed to be
 * the model submitted by the student.
 *
 * The order or entities in this model may be modified in the comparison process.
 *
 * For specifying the location of the GI Model, you can either specify a URL, or the name of a file in LocalStorage.
 * In the latter case, you do not specify a path, you just specify the file name, e.g. 'my_model.gi'
 *
 * @param __model__
 * @param input_data The location of the GI Model to compare this model to.
 * @returns Text that summarises the comparison between the two models.
 */
async function ModelCompare(__model__, input_data) {
    const input_data_str = await io_1._getFile(input_data);
    if (!input_data_str) {
        throw new Error('Invalid imported model data');
    }
    const input_model = new GIModel_1.GIModel();
    input_model.importGI(input_data_str);
    const result = __model__.compare(input_model, true, false, false);
    return result.comment;
}
exports.ModelCompare = ModelCompare;
// ================================================================================================
/**
 * Merges data from another model into this model.
 * This is the same as importing the model, except that no collection is created.
 *
 * For specifying the location of the GI Model, you can either specify a URL, or the name of a file in LocalStorage.
 * In the latter case, you do not specify a path, you just specify the file name, e.g. 'my_model.gi'
 *
 * @param __model__
 * @param input_data The location of the GI Model to import into this model to.
 * @returns Text that summarises the comparison between the two models.
 */
async function ModelMerge(__model__, input_data) {
    const input_data_str = await io_1._getFile(input_data);
    if (!input_data_str) {
        throw new Error('Invalid imported model data');
    }
    const ents_arr = __model__.importGI(input_data_str);
    return common_id_funcs_1.idsMake(ents_arr);
}
exports.ModelMerge = ModelMerge;
// ================================================================================================
/**
 * Post a message to the parent window.
 *
 * @param __model__
 * @param data The data to send, a list or a dictionary.
 * @returns Text that summarises what is in the model, click print to see this text.
 */
function SendData(__model__, data) {
    window.parent.postMessage(data, '*');
}
exports.SendData = SendData;
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9jb3JlL21vZHVsZXMvYmFzaWMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUg7O0dBRUc7QUFDSCxpREFBZ0Q7QUFDaEQsb0RBQWlEO0FBQ2pELGtEQUFzSDtBQUN0SCxpREFBcUQ7QUFDckQsMkVBQTBFO0FBQzFFLDZCQUFnQztBQUVoQyxtR0FBbUc7QUFDbkc7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsTUFBTSxDQUFDLFNBQWtCLEVBQUUsUUFBb0M7SUFDM0UsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3RFLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ3hGLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQWEsQ0FBQztJQUMzRSxNQUFNLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4RCxNQUFNLFFBQVEsR0FBa0IsMEJBQVEsQ0FBQyxZQUFZLENBQWtCLENBQUM7SUFDeEUsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3RDLE1BQU0sT0FBTyxHQUFnQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsTUFBTSxXQUFXLEdBQWEsWUFBWSxD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