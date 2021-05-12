"use strict";
/**
 * The `material` module has functions for defining materials.
 * The material definitions are saved as attributes at the model level.
 * For more informtion, see the threejs docs: https://threejs.org/
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
const THREE = __importStar(require("three"));
const common_2 = require("@libs/geo-info/common");
const common_id_funcs_1 = require("@assets/libs/geo-info/common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
// ================================================================================================
var _ESide;
(function (_ESide) {
    _ESide["FRONT"] = "front";
    _ESide["BACK"] = "back";
    _ESide["BOTH"] = "both";
})(_ESide = exports._ESide || (exports._ESide = {}));
function _convertSelectESideToNum(select) {
    switch (select) {
        case _ESide.FRONT:
            return THREE.FrontSide;
        case _ESide.BACK:
            return THREE.BackSide;
        default:
            return THREE.DoubleSide;
    }
}
var _Ecolors;
(function (_Ecolors) {
    _Ecolors["NO_VERT_COLORS"] = "none";
    _Ecolors["VERT_COLORS"] = "apply_rgb";
})(_Ecolors = exports._Ecolors || (exports._Ecolors = {}));
function _convertSelectEcolorsToNum(select) {
    switch (select) {
        case _Ecolors.NO_VERT_COLORS:
            return THREE.NoColors;
        default:
            return THREE.VertexColors;
    }
}
function _clamp01(val) {
    val = (val > 1) ? 1 : val;
    val = (val < 0) ? 0 : val;
    return val;
}
function _clamp0100(val) {
    val = (val > 100) ? 100 : val;
    val = (val < 0) ? 0 : val;
    return val;
}
function _clampArr01(vals) {
    for (let i = 0; i < vals.length; i++) {
        vals[i] = _clamp01(vals[i]);
    }
}
function _getTjsColor(col) {
    return new THREE.Color(col[0], col[1], col[2]);
}
var _ELineMaterialType;
(function (_ELineMaterialType) {
    _ELineMaterialType["BASIC"] = "LineBasicMaterial";
    _ELineMaterialType["DASHED"] = "LineDashedMaterial";
})(_ELineMaterialType || (_ELineMaterialType = {}));
var _EMeshMaterialType;
(function (_EMeshMaterialType) {
    _EMeshMaterialType["BASIC"] = "MeshBasicMaterial";
    _EMeshMaterialType["LAMBERT"] = "MeshLambertMaterial";
    _EMeshMaterialType["PHONG"] = "MeshPhongMaterial";
    _EMeshMaterialType["STANDARD"] = "MeshStandardMaterial";
    _EMeshMaterialType["PHYSICAL"] = "MeshPhysicalMaterial";
})(_EMeshMaterialType || (_EMeshMaterialType = {}));
function _setMaterialModelAttrib(__model__, name, settings_obj) {
    // if the material already exists, then existing settings will be added
    // but new settings will take precedence
    if (__model__.modeldata.attribs.query.hasModelAttrib(name)) {
        const exist_settings_obj = __model__.modeldata.attribs.get.getModelAttribVal(name);
        // check that the existing material is a Basic one
        if (exist_settings_obj['type'] !== _EMeshMaterialType.BASIC) {
            if (settings_obj['type'] !== exist_settings_obj['type']) {
                throw new Error('Error creating material: non-basic material with this name already exists.');
            }
        }
        // copy the settings from the existing material to the new material
        for (const key of Object.keys(exist_settings_obj)) {
            if (settings_obj[key] === undefined) {
                settings_obj[key] = exist_settings_obj[key];
            }
        }
    }
    else {
        __model__.modeldata.attribs.add.addAttrib(common_2.EEntType.MOD, name, common_1.EAttribDataTypeStrs.DICT);
    }
    // const settings_str: string = JSON.stringify(settings_obj);
    __model__.modeldata.attribs.set.setModelAttribVal(name, settings_obj);
}
// ================================================================================================
/**
 * Sets material by creating a polygon attribute called 'material' and setting the value.
 * The value is a sitring, which is the name of the material.
 * The properties of this material must be defined at the model level, using one of the material functions.
 * \n
 * @param entities The entities for which to set the material.
 * @param material The name of the material.
 * @returns void
 */
function Set(__model__, entities, material) {
    entities = arrs_1.arrMakeFlat(entities);
    if (!arrs_1.isEmptyArr(entities)) {
        // --- Error Check ---
        const fn_name = 'matrial.Set';
        let ents_arr;
        if (__model__.debug) {
            ents_arr = _check_ids_1.checkIDs(__model__, fn_name, 'entities', entities, [_check_ids_1.ID.isID, _check_ids_1.ID.isIDL1, _check_ids_1.ID.isIDL2], null);
            chk.checkArgs(fn_name, 'material', material, [chk.isStr, chk.isStrL]);
        }
        else {
            ents_arr = common_id_funcs_1.idsBreak(entities);
        }
        // --- Error Check ---
        let material_dict;
        let is_list = false;
        if (Array.isArray(material)) {
            is_list = true;
            material_dict = __model__.modeldata.attribs.get.getModelAttribVal(material[0]);
        }
        else {
            material_dict = __model__.modeldata.attribs.get.getModelAttribVal(material);
        }
        if (!material_dict) {
            throw new Error('Material does not exist: ' + material);
        }
        const material_type = material_dict['type'];
        if (material_type === undefined) {
            throw new Error('Material is not valid: ' + material_dict);
        }
        if (material_type === _ELineMaterialType.BASIC || material_type === _ELineMaterialType.DASHED) {
            if (is_list) {
                throw new Error('A line can only have a single material: ' + material_dict);
            }
            _lineMaterial(__model__, ents_arr, material);
        }
        else {
            if (is_list) {
                if (material.length > 2) {
                    throw new Error('A maximum of materials can be specified, for the front and back of the polygon : ' + material);
                }
            }
            else {
                material = [material];
            }
            _meshMaterial(__model__, ents_arr, material);
        }
    }
}
exports.Set = Set;
function _lineMaterial(__model__, ents_arr, material) {
    if (!__model__.modeldata.attribs.query.hasEntAttrib(common_2.EEntType.PLINE, common_1.EAttribNames.MATERIAL)) {
        __model__.modeldata.attribs.add.addAttrib(common_2.EEntType.PLINE, common_1.EAttribNames.MATERIAL, common_1.EAttribDataTypeStrs.STRING);
    }
    for (const ent_arr of ents_arr) {
        const [ent_type, ent_i] = ent_arr;
        const plines_i = __model__.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
        for (const pline_i of plines_i) {
            __model__.modeldata.attribs.set.setEntAttribVal(common_2.EEntType.PLINE, pline_i, common_1.EAttribNames.MATERIAL, material);
        }
    }
}
function _meshMaterial(__model__, ents_arr, material) {
    if (!__model__.modeldata.attribs.query.hasEntAttrib(common_2.EEntType.PGON, common_1.EAttribNames.MATERIAL)) {
        __model__.modeldata.attribs.add.addAttrib(common_2.EEntType.PGON, common_1.EAttribNames.MATERIAL, common_1.EAttribDataTypeStrs.LIST);
    }
    for (const ent_arr of ents_arr) {
        const [ent_type, ent_i] = ent_arr;
        const pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
        for (const pgon_i of pgons_i) {
            __model__.modeldata.attribs.set.setEntAttribVal(common_2.EEntType.PGON, pgon_i, common_1.EAttribNames.MATERIAL, material);
        }
    }
}
// ================================================================================================
/**
 * Creates a line material and saves it in the model attributes.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/LineBasicMaterial)
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/LineDashedMaterial)
 * \n
 * The color of the material can either ignore or apply the vertex rgb colors.
 * If 'apply' id selected, then the actual color will be a combination of the material color
 * and the vertex colors, as specified by the a vertex attribute called 'rgb'.
 * In such a case, if material color is set to white, then it will
 * have no effect, and the color will be defined by the vertex [r,g,b] values.
 * \n
 * In order to assign a material to polylines in the model, a polyline attribute called 'material'.
 * will be created. The value for each polyline must either be null, or must be a material name.
 * \n
 * For dashed lines, the 'dash_gap_scale' parameter can be set.
 * - If 'dash_gap_scale' is null will result in a continouse line.
 * - If 'dash_gap_scale' is a single number: dash = gap = dash_gap_scale, scale = 1.
 * - If 'dash_gap_scale' is a list of two numbers: dash = dash_gap_scale[0], gap = dash_gap_scale[1], scale = 1.
 * - If 'dash_gap_scale' is a list of three numbers: dash = dash_gap_scale[0], gap = dash_gap_scale[1], scale = dash_gap_scale[2].
 * \n
 * Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms,
 * line widths cannot be rendered. As a result, lines width will always be set to 1.
 * \n
 * @param name The name of the material.
 * @param color The diffuse color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param dash_gap_scale Size of the dash and gap, and a scale factor. (The gap and scale are optional.)
 * @param select_vert_colors Enum, select whether to use vertex colors if they exist.
 * @returns void
 */
function LineMat(__model__, name, color, dash_gap_scale, select_vert_colors) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.LineMat';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'color', color, [chk.isColor]);
        chk.checkArgs(fn_name, 'dash_gap_scale', dash_gap_scale, [chk.isNull, chk.isNum, chk.isNumL]);
    }
    // --- Error Check ---
    const vert_colors = _convertSelectEcolorsToNum(select_vert_colors);
    _clampArr01(color);
    let settings_obj;
    if (dash_gap_scale === null) {
        settings_obj = {
            // type: _ELineMaterialType.BASIC,
            // color: _getTjsColor(color),
            // vertexColors: vert_colors
            type: _ELineMaterialType.DASHED,
            color: _getTjsColor(color),
            vertexColors: vert_colors,
            dashSize: 0,
            gapSize: 0,
            scale: 1
        };
    }
    else {
        dash_gap_scale = Array.isArray(dash_gap_scale) ? dash_gap_scale : [dash_gap_scale];
        const dash = dash_gap_scale[0] === undefined ? 0 : dash_gap_scale[0];
        const gap = dash_gap_scale[1] === undefined ? dash : dash_gap_scale[1];
        const scale = dash_gap_scale[2] === undefined ? 1 : dash_gap_scale[2];
        settings_obj = {
            type: _ELineMaterialType.DASHED,
            color: _getTjsColor(color),
            vertexColors: vert_colors,
            dashSize: dash,
            gapSize: gap,
            scale: scale
        };
    }
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.LineMat = LineMat;
// ================================================================================================
/**
 * Creates a basic mesh material and saves it in the model attributes.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
 * \n
 * The color of the material can either ignore or apply the vertex rgb colors.
 * If 'apply' id selected, then the actual color will be a combination of the material color
 * and the vertex colors, as specified by the a vertex attribute called 'rgb'.
 * In such a case, if material color is set to white, then it will
 * have no effect, and the color will be defined by the vertex [r,g,b] values.
 * \n
 * Additional material properties can be set by calling the functions for the more advanced materials.
 * These include LambertMaterial, PhongMaterial, StandardMaterial, and Physical Material.
 * Each of these more advanced materials allows you to specify certain additional settings.
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'.
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param color The diffuse color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param opacity The opacity of the glass, between 0 (totally transparent) and 1 (totally opaque).
 * @param select_side Enum, select front, back, or both.
 * @param select_vert_colors Enum, select whether to use vertex colors if they exist.
 * @returns void
 */
function MeshMat(__model__, name, color, opacity, select_side, select_vert_colors) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.MeshMat';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'color', color, [chk.isColor]);
        chk.checkArgs(fn_name, 'opacity', opacity, [chk.isNum01]);
    }
    // --- Error Check ---
    const side = _convertSelectESideToNum(select_side);
    const vert_colors = _convertSelectEcolorsToNum(select_vert_colors);
    opacity = _clamp01(opacity);
    const transparent = opacity < 1;
    _clampArr01(color);
    const settings_obj = {
        type: _EMeshMaterialType.BASIC,
        side: side,
        vertexColors: vert_colors,
        opacity: opacity,
        transparent: transparent,
        color: _getTjsColor(color)
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.MeshMat = MeshMat;
// ================================================================================================
/**
 * Creates a glass material with an opacity setting. The material will default to a Phong material.
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param opacity The opacity of the glass, between 0 (totally transparent) and 1 (totally opaque).
 * @returns void
 */
function Glass(__model__, name, opacity) {
    // --- Error Check ---
    const fn_name = 'material.Glass';
    if (__model__.debug) {
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'opacity', opacity, [chk.isNum01]);
    }
    // --- Error Check ---
    opacity = _clamp01(opacity);
    const transparent = opacity < 1;
    const settings_obj = {
        type: _EMeshMaterialType.PHONG,
        opacity: opacity,
        transparent: transparent,
        shininess: 90,
        color: new THREE.Color(1, 1, 1),
        emissive: new THREE.Color(0, 0, 0),
        side: THREE.DoubleSide
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.Glass = Glass;
// ================================================================================================
/**
 * Creates a Lambert material and saves it in the model attributes.
 * If a material with the same name already exits, these settings will be added to the existing material.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial)
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param emissive The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @returns void
 */
function Lambert(__model__, name, emissive) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.Lambert';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'emissive', emissive, [chk.isXYZ]);
    }
    // --- Error Check ---
    _clampArr01(emissive);
    const settings_obj = {
        type: _EMeshMaterialType.LAMBERT,
        emissive: _getTjsColor(emissive)
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.Lambert = Lambert;
// ================================================================================================
/**
 * Creates a Phong material and saves it in the model attributes.
 * If a material with the same name already exits, these settings will be added to the existing material.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial)
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param emissive The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param specular The specular color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param shininess The shininess, between 0 and 100.
 * @returns void
 */
function Phong(__model__, name, emissive, specular, shininess) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.Phong';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'emissive', emissive, [chk.isXYZ]);
        chk.checkArgs(fn_name, 'emissive', specular, [chk.isXYZ]);
        chk.checkArgs(fn_name, 'shininess', shininess, [chk.isNum]);
    }
    // --- Error Check ---
    _clampArr01(emissive);
    _clampArr01(specular);
    shininess = Math.floor(_clamp0100(shininess));
    const settings_obj = {
        type: _EMeshMaterialType.PHONG,
        emissive: _getTjsColor(emissive),
        specular: _getTjsColor(specular),
        shininess: shininess
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.Phong = Phong;
// ================================================================================================
/**
 * Creates a Standard material and saves it in the model attributes.
 * If a material with the same name already exits, these settings will be added to the existing material.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param emissive The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param roughness The roughness, between 0 (smooth) and 1 (rough).
 * @param metalness The metalness, between 0 (non-metalic) and 1 (metalic).
 * @param reflectivity The reflectivity, between 0 (non-reflective) and 1 (reflective).
 * @returns void
 */
function Standard(__model__, name, emissive, roughness, metalness) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.Standard';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'emissive', emissive, [chk.isXYZ]);
        chk.checkArgs(fn_name, 'roughness', roughness, [chk.isNum]);
        chk.checkArgs(fn_name, 'metalness', metalness, [chk.isNum]);
    }
    // --- Error Check ---
    _clampArr01(emissive);
    roughness = _clamp01(roughness);
    metalness = _clamp01(metalness);
    const settings_obj = {
        type: _EMeshMaterialType.STANDARD,
        emissive: _getTjsColor(emissive),
        roughness: roughness,
        metalness: metalness
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.Standard = Standard;
// ================================================================================================
/**
 * Creates a Physical material and saves it in the model attributes.
 * If a material with the same name already exits, these settings will be added to the existing material.
 * \n
 * [See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial)
 * \n
 * In order to assign a material to polygons in the model, a polygon attribute called 'material'
 * needs to be created. The value for each polygon must either be null, or must be a material name.
 * \n
 * @param name The name of the material.
 * @param emissive The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].
 * @param roughness The roughness, between 0 (smooth) and 1 (rough).
 * @param metalness The metalness, between 0 (non-metalic) and 1 (metalic).
 * @param reflectivity The reflectivity, between 0 (non-reflective) and 1 (reflective).
 * @returns void
 */
function Physical(__model__, name, emissive, roughness, metalness, reflectivity) {
    // --- Error Check ---
    if (__model__.debug) {
        const fn_name = 'material.Physical';
        chk.checkArgs(fn_name, 'name', name, [chk.isStr]);
        chk.checkArgs(fn_name, 'emissive', emissive, [chk.isXYZ]);
        chk.checkArgs(fn_name, 'roughness', roughness, [chk.isNum]);
        chk.checkArgs(fn_name, 'metalness', metalness, [chk.isNum]);
        chk.checkArgs(fn_name, 'reflectivity', reflectivity, [chk.isNum]);
    }
    // --- Error Check ---
    _clampArr01(emissive);
    roughness = _clamp01(roughness);
    metalness = _clamp01(metalness);
    reflectivity = _clamp01(reflectivity);
    const settings_obj = {
        type: _EMeshMaterialType.PHYSICAL,
        emissive: _getTjsColor(emissive),
        roughness: roughness,
        metalness: metalness,
        reflectivity: reflectivity
    };
    _setMaterialModelAttrib(__model__, name, settings_obj);
}
exports.Physical = Physical;
// ================================================================================================
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvbW9kdWxlcy9iYXNpYy9tYXRlcmlhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7R0FJRzs7Ozs7Ozs7O0FBRUg7O0dBRUc7QUFDSCxpREFBZ0Q7QUFFaEQsd0RBQTBDO0FBRzFDLGtEQUFnRjtBQUNoRiw2Q0FBK0I7QUFDL0Isa0RBQW1FO0FBQ25FLDJFQUFpRTtBQUNqRSxpREFBaUU7QUFFakUsbUdBQW1HO0FBQ25HLElBQVksTUFJWDtBQUpELFdBQVksTUFBTTtJQUNkLHlCQUFpQixDQUFBO0lBQ2pCLHVCQUFlLENBQUE7SUFDZix1QkFBZSxDQUFBO0FBQ25CLENBQUMsRUFKVyxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFJakI7QUFDRCxTQUFTLHdCQUF3QixDQUFDLE1BQWM7SUFDNUMsUUFBUSxNQUFNLEVBQUU7UUFDWixLQUFLLE1BQU0sQ0FBQyxLQUFLO1lBQ2IsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQzNCLEtBQUssTUFBTSxDQUFDLElBQUk7WUFDWixPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDMUI7WUFDSSxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUM7S0FDL0I7QUFDTCxDQUFDO0FBQ0QsSUFBWSxRQUdYO0FBSEQsV0FBWSxRQUFRO0lBQ2hCLG1DQUF5QixDQUFBO0lBQ3pCLHFDQUEyQixDQUFBO0FBQy9CLENBQUMsRUFIVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQUduQjtBQUNELFNBQVMsMEJBQTBCLENBQUMsTUFBZ0I7SUFDaEQsUUFBUSxNQUFNLEVBQUU7UUFDWixLQUFLLFFBQVEsQ0FBQyxjQUFjO1lBQ3hCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUMxQjtZQUNJLE9BQU8sS0FBSyxDQUFDLFlBQVks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