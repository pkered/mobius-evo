"use strict";
/**
 * The `io` module has functions for importing and exporting.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
const _check_ids_1 = require("../../_check_ids");
const chk = __importStar(require("../../_check_types"));
const io_obj_1 = require("@assets/libs/geo-info/io/io_obj");
const io_geojson_1 = require("@assets/libs/geo-info/io/io_geojson");
const download_1 = require("@libs/filesys/download");
const common_1 = require("@libs/geo-info/common");
// import { __merge__ } from '../_model';
// import { _model } from '..';
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const jszip_1 = __importDefault(require("jszip"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const io_gltf_1 = require("@assets/libs/geo-info/io/io_gltf");
const requestedBytes = 1024 * 1024 * 200; // 200 MB local storage quota
// ================================================================================================
// Import / Export data types
var _EIODataFormat;
(function (_EIODataFormat) {
    _EIODataFormat["GI"] = "gi";
    _EIODataFormat["OBJ"] = "obj";
    _EIODataFormat["GEOJSON"] = "geojson";
})(_EIODataFormat = exports._EIODataFormat || (exports._EIODataFormat = {}));
var _EIODataSource;
(function (_EIODataSource) {
    _EIODataSource["DEFAULT"] = "From URL";
    _EIODataSource["FILESYS"] = "From Local Storage";
})(_EIODataSource = exports._EIODataSource || (exports._EIODataSource = {}));
var _EIODataTarget;
(function (_EIODataTarget) {
    _EIODataTarget["DEFAULT"] = "Save to Hard Disk";
    _EIODataTarget["FILESYS"] = "Save to Local Storage";
})(_EIODataTarget = exports._EIODataTarget || (exports._EIODataTarget = {}));
// ================================================================================================
/**
 * Read data from a Url or from local storage.
 *
 * @param data The data to be read (from URL or from Local Storage).
 * @returns the data.
 */
async function Read(__model__, data) {
    return _getFile(data);
}
exports.Read = Read;
// ================================================================================================
/**
 * Write data to the hard disk or to the local storage.
 *
 * @param data The data to be saved (can be the url to the file).
 * @param file_name The name to be saved in the file system (file extension should be included).
 * @param data_target Enum, where the data is to be exported to.
 * @returns whether the data is successfully saved.
 */
async function Write(__model__, data, file_name, data_target) {
    try {
        if (data_target === _EIODataTarget.DEFAULT) {
            return download_1.download(data, file_name);
        }
        return saveResource(data, file_name);
    }
    catch (ex) {
        return false;
    }
}
exports.Write = Write;
// ================================================================================================
/**
 * Imports data into the model.
 * \n
 * There are two ways of specifying the file location to be imported:
 * - A url, e.g. "https://www.dropbox.com/xxxx/my_data.obj"
 * - A file name in the local storage, e.g. "my_data.obj".
 * \n
 * To place a file in local storage, go to the Mobius menu, and select 'Local Storage' from the dropdown.
 * Note that a codescript using a file in local storage may fail when others try to open the file.
 * \n
 * @param model_data The model data
 * @param data_format Enum, the file format.
 * @returns A list of the positions, points, polylines, polygons and collections added to the model.
 * @example io.Import ("my_data.obj", obj)
 * @example_info Imports the data from my_data.obj, from local storage.
 */
async function Import(__model__, input_data, data_format) {
    const model_data = await _getFile(input_data);
    if (!model_data) {
        throw new Error('Invalid imported model data');
    }
    // zip file
    if (model_data.constructor === {}.constructor) {
        const coll_results = {};
        for (const data_name in model_data) {
            if (model_data[data_name]) {
                coll_results[data_name] = _import(__model__, model_data[data_name], data_format);
            }
        }
        return coll_results;
    }
    // single file
    return _import(__model__, model_data, data_format);
}
exports.Import = Import;
function _import(__model__, model_data, data_format) {
    switch (data_format) {
        case _EIODataFormat.GI:
            const gi_coll_i = _importGI(__model__, model_data);
            return common_id_funcs_1.idMake(common_1.EEntType.COLL, gi_coll_i);
        case _EIODataFormat.OBJ:
            const obj_coll_i = _importObj(__model__, model_data);
            return common_id_funcs_1.idMake(common_1.EEntType.COLL, obj_coll_i);
        case _EIODataFormat.GEOJSON:
            const gj_coll_i = _importGeojson(__model__, model_data);
            return common_id_funcs_1.idMake(common_1.EEntType.COLL, gj_coll_i);
        default:
            throw new Error('Import type not recognised');
    }
}
exports._import = _import;
function _importGI(__model__, json_str) {
    const ssid = __model__.modeldata.active_ssid;
    // import
    const ents = __model__.importGI(json_str);
    const container_coll_i = __model__.modeldata.geom.add.addColl();
    for (const [ent_type, ent_i] of ents) {
        switch (ent_type) {
            case common_1.EEntType.POINT:
                __model__.modeldata.geom.snapshot.addCollPoints(ssid, container_coll_i, ent_i);
                break;
            case common_1.EEntType.PLINE:
                __model__.modeldata.geom.snapshot.addCollPlines(ssid, container_coll_i, ent_i);
                break;
            case common_1.EEntType.PGON:
                __model__.modeldata.geom.snapshot.addCollPgons(ssid, container_coll_i, ent_i);
                break;
            case common_1.EEntType.COLL:
                __model__.modeldata.geom.snapshot.addCollChildren(ssid, container_coll_i, ent_i);
                break;
        }
    }
    __model__.modeldata.attribs.set.setEntAttribVal(common_1.EEntType.COLL, container_coll_i, 'name', 'import GI');
    // return the result
    return container_coll_i;
}
exports._importGI = _importGI;
function _importObj(__model__, model_data) {
    // get number of ents before merge
    const num_ents_before = __model__.metadata.getEntCounts();
    // import
    io_obj_1.importObj(__model__, model_data);
    // get number of ents after merge
    const num_ents_after = __model__.metadata.getEntCounts();
    // return the result
    const container_coll_i = _createColl(__model__, num_ents_before, num_ents_after);
    __model__.modeldata.attribs.set.setEntAttribVal(common_1.EEntType.COLL, container_coll_i, 'name', 'import OBJ');
    return container_coll_i;
}
function _importGeojson(__model__, model_data) {
    // get number of ents before merge
    const num_ents_before = __model__.metadata.getEntCounts();
    // import
    io_geojson_1.importGeojson(__model__, model_data, 0);
    // get number of ents after merge
    const num_ents_after = __model__.metadata.getEntCounts();
    // return the result
    const container_coll_i = _createColl(__model__, num_ents_before, num_ents_after);
    __model__.modeldata.attribs.set.setEntAttribVal(common_1.EEntType.COLL, container_coll_i, 'name', 'import GEOJSON');
    return container_coll_i;
}
// function _createGIColl(__model__: GIModel, before: number[], after: number[]): number {
//     throw new Error('Not implemented');
//     // const points_i: number[] = [];
//     // const plines_i: number[] = [];
//     // const pgons_i: number[] = [];
//     // for (let point_i = before[1]; point_i < after[1]; point_i++) {
//     //     if (__model__.modeldata.geom.query.entExists(EEntType.POINT, point_i)) {
//     //         points_i.push( point_i );
//     //     }
//     // }
//     // for (let pline_i = before[2]; pline_i < after[2]; pline_i++) {
//     //     if (__model__.modeldata.geom.query.entExists(EEntType.PLINE, pline_i)) {
//     //         plines_i.push( pline_i );
//     //     }
//     // }
//     // for (let pgon_i = before[3]; pgon_i < after[3]; pgon_i++) {
//     //     if (__model__.modeldata.geom.query.entExists(EEntType.PGON, pgon_i)) {
//     //         pgons_i.push( pgon_i );
//     //     }
//     // }
//     // if (points_i.length + plines_i.length + pgons_i.length === 0) { return null; }
//     // const container_coll_i: number = __model__.modeldata.geom.add.addColl(null, points_i, plines_i, pgons_i);
//     // for (let coll_i = before[4]; coll_i < after[4]; coll_i++) {
//     //     if (__model__.modeldata.geom.query.entExists(EEntType.COLL, coll_i)) {
//     //         __model__.modeldata.geom.modify_coll.setCollParent(coll_i, container_coll_i);
//     //     }
//     // }
//     // return container_coll_i;
// }
function _createColl(__model__, before, after) {
    const ssid = __model__.modeldata.active_ssid;
    const points_i = [];
    const plines_i = [];
    const pgons_i = [];
    const colls_i = [];
    for (let point_i = before[1]; point_i < after[1]; point_i++) {
        points_i.push(point_i);
    }
    for (let pline_i = before[2]; pline_i < after[2]; pline_i++) {
        plines_i.push(pline_i);
    }
    for (let pgon_i = before[3]; pgon_i < after[3]; pgon_i++) {
        pgons_i.push(pgon_i);
    }
    for (let coll_i = before[4]; coll_i < after[4]; coll_i++) {
        colls_i.push(coll_i);
    }
    if (points_i.length + plines_i.length + pgons_i.length === 0) {
        return null;
    }
    const container_coll_i = __model__.modeldata.geom.add.addColl();
    __model__.modeldata.geom.snapshot.addCollPoints(ssid, container_coll_i, points_i);
    __model__.modeldata.geom.snapshot.addCollPlines(ssid, container_coll_i, plines_i);
    __model__.modeldata.geom.snapshot.addCollPgons(ssid, container_coll_i, pgons_i);
    __model__.modeldata.geom.snapshot.addCollChildren(ssid, container_coll_i, colls_i);
    return container_coll_i;
}
// ================================================================================================
var _EIOExportDataFormat;
(function (_EIOExportDataFormat) {
    _EIOExportDataFormat["GI"] = "gi";
    _EIOExportDataFormat["OBJ_VERT"] = "obj_v";
    _EIOExportDataFormat["OBJ_POSI"] = "obj_ps";
    // DAE = 'dae',
    _EIOExportDataFormat["GEOJSON"] = "geojson";
    _EIOExportDataFormat["GLTF"] = "gltf";
})(_EIOExportDataFormat = exports._EIOExportDataFormat || (exports._EIOExportDataFormat = {}));
/**
 * Export data from the model as a file.
 * \n
 * If you expore to your  hard disk,
 * it will result in a popup in your browser, asking you to save the file.
 * \n
 * If you export to Local Storage, there will be no popup.
 * \n
 * @param __model__
 * @param entities Optional. Entities to be exported. If null, the whole model will be exported.
 * @param file_name Name of the file as a string.
 * @param data_format Enum, the file format.
 * @param data_target Enum, where the data is to be exported to.
 * @returns void.
 * @example io.Export (#pg, 'my_model.obj', obj)
 * @example_info Exports all the polgons in the model as an OBJ.
 */
async function Export(__model__, entities, file_name, data_format, data_target) {
    if (typeof localStorage === 'undefined') {
        return;
    }
    // --- Error Check ---
    const fn_name = 'io.Export';
    let ents_arr = null;
    if (__model__.debug) {
        if (entities !== null) {
            entities = arrs_1.arrMakeFlat(entities);
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isIDL1], [common_1.EEntType.PLINE, common_1.EEntType.PGON, common_1.EEntType.COLL]);
        }
        chk.checkArgs(fn_name, 'file_name', file_name, [chk.isStr, chk.isStrL]);
    }
    else {
        if (entities !== null) {
            entities = arrs_1.arrMakeFlat(entities);
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
    }
    // --- Error Check ---
    await _export(__model__, ents_arr, file_name, data_format, data_target);
}
exports.Export = Export;
async function _export(__model__, ents_arr, file_name, data_format, data_target) {
    const ssid = __model__.modeldata.active_ssid;
    switch (data_format) {
        case _EIOExportDataFormat.GI:
            {
                let model_data = '';
                model_data = __model__.exportGI(ents_arr);
                // gi_data = gi_data.replace(/\\\"/g, '\\\\\\"'); // TODO temporary fix
                model_data = model_data.replace(/\\/g, '\\\\\\'); // TODO temporary fix
                // === save the file ===
                if (data_target === _EIODataTarget.DEFAULT) {
                    return download_1.download(model_data, file_name);
                }
                return saveResource(model_data, file_name);
            }
        case _EIOExportDataFormat.OBJ_VERT:
            {
                const obj_verts_data = io_obj_1.exportVertBasedObj(__model__, ents_arr, ssid);
                // obj_data = obj_data.replace(/#/g, '%23'); // TODO temporary fix
                if (data_target === _EIODataTarget.DEFAULT) {
                    return download_1.download(obj_verts_data, file_name);
                }
                return saveResource(obj_verts_data, file_name);
            }
        case _EIOExportDataFormat.OBJ_POSI:
            {
                const obj_posis_data = io_obj_1.exportPosiBasedObj(__model__, ents_arr, ssid);
                // obj_data = obj_data.replace(/#/g, '%23'); // TODO temporary fix
                if (data_target === _EIODataTarget.DEFAULT) {
                    return download_1.download(obj_posis_data, file_name);
                }
                return saveResource(obj_posis_data, file_name);
            }
        // case _EIOExportDataFormat.DAE:
        //     const dae_data: string = exportDae(__model__);
        //     // dae_data = dae_data.replace(/#/g, '%23'); // TODO temporary fix
        //     if (data_target === _EIODataTarget.DEFAULT) {
        //         return download(dae_data, file_name);
        //     }
        //     return saveResource(dae_data, file_name);
        //     break;
        case _EIOExportDataFormat.GEOJSON:
            {
                const geojson_data = io_geojson_1.exportGeojson(__model__, ents_arr, true, ssid); // flatten
                if (data_target === _EIODataTarget.DEFAULT) {
                    return download_1.download(geojson_data, file_name);
                }
                return saveResource(geojson_data, file_name);
            }
        case _EIOExportDataFormat.GLTF:
            {
                const gltf_data = await io_gltf_1.exportGltf(__model__, ents_arr, ssid);
                if (data_target === _EIODataTarget.DEFAULT) {
                    return download_1.download(gltf_data, file_name);
                }
                return saveResource(gltf_data, file_name);
            }
        default:
            throw new Error('Data type not recognised');
    }
}
// ================================================================================================
/**
 * Functions for saving and loading resources to file system.
 */
async function saveResource(file, name) {
    const itemstring = localStorage.getItem('mobius_backup_list');
    if (!itemstring) {
        localStorage.setItem('mobius_backup_list', `["${name}"]`);
        localStorage.setItem('mobius_backup_date_dict', `{ "${name}": "${(new Date()).toLocaleString()}"}`);
    }
    else {
        const items = JSON.parse(itemstring);
        let check = false;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item === name) {
                items.splice(i, 1);
                items.unshift(item);
                check = true;
                break;
            }
        }
        if (!check) {
            items.unshift(name);
            // if (items.length > 10) {
            //     const item = items.pop();
            //     localStorage.removeItem(item);
            // }
        }
        localStorage.setItem('mobius_backup_list', JSON.stringify(items));
        const itemDates = JSON.parse(localStorage.getItem('mobius_backup_date_dict'));
        itemDates[itemstring] = (new Date()).toLocaleString();
        localStorage.setItem('mobius_backup_date_dict', JSON.stringify(itemDates));
    }
    // window['_code__'] = name;
    // window['_file__'] = file;
    function saveToFS(fs) {
        const code = name;
        // console.log(code)
        fs.root.getFile(code, { create: true }, function (fileEntry) {
            fileEntry.createWriter(async function (fileWriter) {
                const bb = new Blob([file + '_|_|_'], { type: 'text/plain;charset=utf-8' });
                await fileWriter.write(bb);
            }, (e) => { console.log(e); });
        }, (e) => { console.log(e.code); });
    }
    navigator.webkitPersistentStorage.requestQuota(requestedBytes, function (grantedBytes) {
        // @ts-ignore
        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, saveToFS, function (e) { throw e; });
    }, function (e) { throw e; });
    return true;
    // localStorage.setItem(code, file);
}
async function getURLContent(url) {
    url = url.replace('http://', 'https://');
    if (url.indexOf('dropbox') !== -1) {
        url = url.replace('www', 'dl').replace('dl=0', 'dl=1');
    }
    if (url[0] === '"' || url[0] === '\'') {
        url = url.substring(1);
    }
    if (url[url.length - 1] === '"' || url[url.length - 1] === '\'') {
        url = url.substring(0, url.length - 1);
    }
    const p = new Promise((resolve) => {
        const fetchObj = node_fetch_1.default(url);
        fetchObj.catch(err => {
            resolve('HTTP Request Error: Unable to retrieve file from ' + url);
        });
        fetchObj.then(res => {
            if (!res.ok) {
                resolve('HTTP Request Error: Unable to retrieve file from ' + url);
                return '';
            }
            if (url.indexOf('.zip') !== -1) {
                res.blob().then(body => resolve(body));
            }
            else {
                res.text().then(body => resolve(body.replace(/(\\[bfnrtv\'\"\\])/g, '\\$1')));
            }
        });
    });
    return await p;
}
async function openZipFile(zipFile) {
    const result = {};
    await jszip_1.default.loadAsync(zipFile).then(async function (zip) {
        for (const filename of Object.keys(zip.files)) {
            // const splittedNames = filename.split('/').slice(1).join('/');
            await zip.files[filename].async('text').then(function (fileData) {
                result[filename] = fileData;
            });
        }
    });
    return result;
}
async function loadFromFileSystem(filecode) {
    const p = new Promise((resolve) => {
        navigator.webkitPersistentStorage.requestQuota(requestedBytes, function (grantedBytes) {
            // @ts-ignore
            window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function (fs) {
                fs.root.getFile(filecode, {}, function (fileEntry) {
                    fileEntry.file((file) => {
                        const reader = new FileReader();
                        reader.onerror = () => {
                            resolve('error');
                        };
                        reader.onloadend = () => {
                            if ((typeof reader.result) === 'string') {
                                resolve(reader.result.split('_|_|_')[0]);
                                // const splitted = (<string>reader.result).split('_|_|_');
                                // let val = splitted[0];
                                // for (const i of splitted) {
                                //     if (val.length < i.length) {
                                //         val = i;
                                //     }
                                // }
                                // resolve(val);
                            }
                            else {
                                resolve(reader.result);
                            }
                        };
                        reader.readAsText(file, 'text/plain;charset=utf-8');
                    });
                });
            });
        }, function (e) { console.log('Error', e); });
    });
    return await p;
}
async function _getFile(source) {
    if (source.indexOf('__model_data__') !== -1) {
        return source.split('__model_data__').join('');
    }
    else if (source[0] === '{') {
        return source;
    }
    else if (source.indexOf('://') !== -1) {
        const val = source.replace(/ /g, '');
        const result = await getURLContent(val);
        if (result === undefined) {
            return source;
        }
        else if (result.indexOf && result.indexOf('HTTP Request Error') !== -1) {
            throw new Error(result);
        }
        else if (val.indexOf('.zip') !== -1) {
            return await openZipFile(result);
        }
        else {
            return result;
        }
    }
    else {
        if (source.length > 1 && source[0] === '{') {
            return null;
        }
        const val = source.replace(/\"|\'/g, '');
        const backup_list = JSON.parse(localStorage.getItem('mobius_backup_list'));
        if (val.endsWith('.zip')) {
            throw (new Error(`Importing zip files from local storage is not supported`));
        }
        if (val.indexOf('*') !== -1) {
            const splittedVal = val.split('*');
            const start = splittedVal[0] === '' ? null : splittedVal[0];
            const end = splittedVal[1] === '' ? null : splittedVal[1];
            let result = '{';
            for (const backup_name of backup_list) {
                let valid_check = true;
                if (start && !backup_name.startsWith(start)) {
                    valid_check = false;
                }
                if (end && !backup_name.endsWith(end)) {
                    valid_check = false;
                }
                if (valid_check) {
                    const backup_file = await loadFromFileSystem(backup_name);
                    result += `"${backup_name}": \`${backup_file.replace(/\\/g, '\\\\')}\`,`;
                }
            }
            result += '}';
            return result;
        }
        else {
            if (backup_list.indexOf(val) !== -1) {
                const result = await loadFromFileSystem(val);
                if (!result || result === 'error') {
                    throw (new Error(`File named ${val} does not exist in the local storage`));
                    // return source;
                }
                else {
                    return result;
                }
            }
            else {
                throw (new Error(`File named ${val} does not exist in the local storage`));
            }
        }
    }
}
exports._getFile = _getFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9pby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7OztBQUVIOztHQUVHO0FBQ0gsaURBQWdEO0FBRWhELHdEQUEwQztBQUcxQyw0REFBb0c7QUFDcEcsb0VBQW1GO0FBQ25GLHFEQUFrRDtBQUNsRCxrREFBNkU7QUFDN0UseUNBQXlDO0FBQ3pDLCtCQUErQjtBQUMvQiwyRUFBbUc7QUFDbkcsaURBQXFEO0FBQ3JELGtEQUEwQjtBQUMxQiw0REFBK0I7QUFDL0IsOERBQThEO0FBRTlELE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsNkJBQTZCO0FBVXZFLG1HQUFtRztBQUNuRyw2QkFBNkI7QUFDN0IsSUFBWSxjQUlYO0FBSkQsV0FBWSxjQUFjO0lBQ3RCLDJCQUFTLENBQUE7SUFDVCw2QkFBVyxDQUFBO0lBQ1gscUNBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQUpXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBSXpCO0FBQ0QsSUFBWSxjQUdYO0FBSEQsV0FBWSxjQUFjO0lBQ3RCLHNDQUFvQixDQUFBO0lBQ3BCLGdEQUE4QixDQUFBO0FBQ2xDLENBQUMsRUFIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUd6QjtBQUNELElBQVksY0FHWDtBQUhELFdBQVksY0FBYztJQUN0QiwrQ0FBNkIsQ0FBQTtJQUM3QixtREFBaUMsQ0FBQTtBQUNyQyxDQUFDLEVBSFcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFHekI7QUFDRCxtR0FBbUc7QUFDbkc7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLFNBQWtCLEVBQUUsSUFBWTtJQUN2RCxPQUFPLFFBQVEsQ0FB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