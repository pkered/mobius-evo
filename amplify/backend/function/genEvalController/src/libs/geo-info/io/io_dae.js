"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GIModel_1 = require("../GIModel");
const common_1 = require("../common");
const triangle_1 = require("@libs/geom/triangle");
const distance_1 = require("@libs/geom/distance");
/**
 * Import obj
 */
function importDae(obj_str) {
    const model = new GIModel_1.GIModel();
    throw new Error('Not implemented');
    return model;
}
exports.importDae = importDae;
function getInstGeom(id, material_id) {
    return `
                <instance_geometry url="#${id}">
                    <bind_material>
                        <technique_common>
                            <instance_material symbol="instance_material_${material_id}" target="#${material_id}">
                                <bind_vertex_input semantic="UVSET0" input_semantic="TEXCOORD" input_set="0" />
                            </instance_material>
                        </technique_common>
                    </bind_material>
                </instance_geometry>
                `;
}
function getGeomMeshPgon(id, num_posis, xyz_str, num_tri, indices_str, material_id) {
    return `
        <geometry id="${id}">
            <mesh>
                <source id="${id}_positions">
                    <float_array id="${id}_positions_array" count="${num_posis}">${xyz_str}</float_array>
                    <technique_common>
                        <accessor count="${num_posis / 3}" source="#${id}_positions_array" stride="3">
                            <param name="X" type="float" />
                            <param name="Y" type="float" />
                            <param name="Z" type="float" />
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="${id}_vertices">
                    <input semantic="POSITION" source="#${id}_positions" />
                </vertices>
                <triangles count="${num_tri}" material="instance_material_${material_id}">
                    <input offset="0" semantic="VERTEX" source="#${id}_vertices" />
                    <p>${indices_str}</p>
                </triangles>
            </mesh>
        </geometry>
        `;
}
function getGeomMeshPline(id, num_posis, xyz_str, num_lines, indices_str, material_id) {
    return `
        <geometry id="${id}">
            <mesh>
                <source id="${id}_positions">
                    <float_array id="${id}_positions_array" count="${num_posis}">${xyz_str}</float_array>
                    <technique_common>
                        <accessor count="${num_posis / 3}" source="#${id}_positions_array" stride="3">
                            <param name="X" type="float" />
                            <param name="Y" type="float" />
                            <param name="Z" type="float" />
                        </accessor>
                    </technique_common>
                </source>
                <vertices id="${id}_vertices">
                    <input semantic="POSITION" source="#${id}_positions" />
                </vertices>
                <lines count="${num_lines}" material="instance_material_${material_id}">
                    <input offset="0" semantic="VERTEX" source="#${id}_vertices" />
                    <p>${indices_str}</p>
                </lines>
            </mesh>
        </geometry>
        `;
}
function getMaterial(id, effect_id) {
    return `
            <material id="${id}" name="material_${id}">
                <instance_effect url="#${effect_id}" />
            </material>
        `;
}
function getPgonEffect(id, color) {
    return `
            <effect id="${id}">
                <profile_COMMON>
                    <technique sid="COMMON">
                        <lambert>
                            <diffuse>
                                <color>${color} 1</color>
                            </diffuse>
                        </lambert>
                    </technique>
                </profile_COMMON>
            </effect>
            `;
}
function getPlineEffect(id, color) {
    return `
            <effect id="${id}">
                <profile_COMMON>
                    <technique sid="COMMON">
                        <constant>
                            <transparent opaque="A_ONE">
                                <color>${color} 1</color>
                            </transparent>
                            <transparency>
                                <float>1</float>
                            </transparency>
                        </constant>
                    </technique>
                </profile_COMMON>
            </effect>
            `;
}
function getVisualSceneNode(id) {
    return `
                <node id="${id}" name="vs_node_${id}">
                    <matrix>1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1</matrix>
                    <instance_node url="#node_${id}" />
                </node>
                `;
}
function getNodesWithInstGeoms(id, inst_geoms) {
    return `
        <node id="node_${id}" name="lib_node_${id}">
            ${inst_geoms}
        </node>
        `;
}
/**
 * Process polygons
 */
function processColls(model) {
    const ssid = this.modeldata.active_ssid;
    const colls_map = new Map();
    // go through the collections
    const colls_i = model.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.COLL);
    for (const coll_i of colls_i) {
        const parent = model.modeldata.geom.snapshot.getCollParent(ssid, coll_i);
        // const pgons_i: number[] = model.modeldata.geom.nav.navCollToPgon(coll_i);
        // const plines_i: number[] = model.modeldata.geom.nav.navCollToPline(coll_i);
        if (!colls_map.has(parent)) {
            colls_map.set(parent, []);
        }
        colls_map.get(parent).push(coll_i);
    }
    for (const coll_i of colls_map.get(null)) {
        // TODO
    }
}
function processPgonInColl(model, pgon_i) {
    // TODO
}
/**
 * Process polygons
 */
function processMaterialPgon(model, pgon_i, has_color_attrib, materials_map, material_effects_map, materials_rev_map) {
    const pgon_verts_i = model.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PGON, pgon_i);
    let material_id = 'default_pgon_material';
    if (has_color_attrib) {
        let color = [0, 0, 0];
        for (const pgon_vert_i of pgon_verts_i) {
            let vert_color = model.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.VERT, pgon_vert_i, common_1.EAttribNames.COLOR);
            if (vert_color === null || vert_color === undefined) {
                vert_color = [1, 1, 1];
            }
            color = [color[0] + vert_color[0], color[1] + vert_color[1], color[2] + vert_color[2]];
        }
        const num_verts = pgon_verts_i.length;
        color = [color[0] / num_verts, color[1] / num_verts, color[2] / num_verts];
        const color_str = color.join(' ');
        if (materials_rev_map.has(color_str)) {
            material_id = materials_rev_map.get(color_str);
        }
        else {
            material_id = 'mat_' + materials_rev_map.size;
            const effect_id = material_id + '_eff';
            materials_map.set(material_id, getMaterial(material_id, effect_id));
            material_effects_map.set(effect_id, getPgonEffect(effect_id, color_str));
            materials_rev_map.set(color_str, material_id);
        }
    }
    return material_id;
}
function processGeomMeshPgon(model, pgon_i, material_id, geom_meshes_map) {
    const id = 'pg' + pgon_i;
    let xyz_str = '';
    const pgon_verts_i = model.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PGON, pgon_i);
    const vert_map = new Map();
    for (let i = 0; i < pgon_verts_i.length; i++) {
        const vert_i = pgon_verts_i[i];
        const posi_i = model.modeldata.geom.nav.navVertToPosi(vert_i);
        const xyz = model.modeldata.attribs.posis.getPosiCoords(posi_i);
        xyz_str += ' ' + xyz.join(' ');
        vert_map.set(posi_i, i);
    }
    let indices = '';
    const pgon_tris_i = model.modeldata.geom.nav_tri.navPgonToTri(pgon_i);
    let num_tris = 0;
    for (const tri_i of pgon_tris_i) {
        const tri_posis_i = model.modeldata.geom.nav_tri.navTriToPosi(tri_i);
        const corners_xyzs = tri_posis_i.map(tri_posi_i => model.modeldata.attribs.posis.getPosiCoords(tri_posi_i));
        const tri_area = triangle_1.area(corners_xyzs[0], corners_xyzs[1], corners_xyzs[2]);
        if (tri_area > 0) {
            for (const tri_posi_i of tri_posis_i) {
                indices += ' ' + vert_map.get(tri_posi_i);
            }
            num_tris++;
        }
    }
    geom_meshes_map.set(id, getGeomMeshPgon(id, pgon_verts_i.length * 3, xyz_str, num_tris, indices, material_id));
}
/**
 * Process polylines
 */
function processMaterialPline(model, pline_i, has_color_attrib, materials_map, material_effects_map, materials_rev_map) {
    const pline_verts_i = model.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PLINE, pline_i);
    let material_id = 'default_pline_material';
    if (has_color_attrib) {
        let color = [0, 0, 0];
        for (const pline_vert_i of pline_verts_i) {
            let vert_color = model.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.VERT, pline_vert_i, common_1.EAttribNames.COLOR);
            if (vert_color === null || vert_color === undefined) {
                vert_color = [1, 1, 1];
            }
            color = [color[0] + vert_color[0], color[1] + vert_color[1], color[2] + vert_color[2]];
        }
        const num_verts = pline_verts_i.length;
        color = [color[0] / num_verts, color[1] / num_verts, color[2] / num_verts];
        const color_str = color.join(' ');
        if (materials_map.has(color_str)) {
            material_id = materials_map.get(color_str);
        }
        else {
            material_id = 'mat_' + materials_map.size;
            const effect_id = material_id + '_eff';
            materials_map.set(material_id, getMaterial(material_id, effect_id));
            material_effects_map.set(effect_id, getPlineEffect(effect_id, color_str));
            materials_rev_map.set(color_str, material_id);
        }
    }
    return material_id;
}
function processGeomMeshPline(model, pline_i, material_id, geom_meshes_map) {
    const id = 'pl' + pline_i;
    let xyz_str = '';
    const pline_verts_i = model.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PLINE, pline_i);
    const vert_map = new Map();
    for (let i = 0; i < pline_verts_i.length; i++) {
        const vert_i = pline_verts_i[i];
        const posi_i = model.modeldata.geom.nav.navVertToPosi(vert_i);
        const xyz = model.modeldata.attribs.posis.getPosiCoords(posi_i);
        xyz_str += ' ' + xyz.join(' ');
        vert_map.set(posi_i, i);
    }
    let indices = '';
    const pline_edges_i = model.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.PLINE, pline_i);
    let num_edges = 0;
    for (const edge_i of pline_edges_i) {
        const edge_posis_i = model.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
        const ends_xyzs = edge_posis_i.map(tri_posi_i => model.modeldata.attribs.posis.getPosiCoords(tri_posi_i));
        const edge_length = distance_1.distance(ends_xyzs[0], ends_xyzs[1]);
        if (edge_length > 0) {
            for (const edge_posi_i of edge_posis_i) {
                indices += ' ' + vert_map.get(edge_posi_i);
            }
            num_edges++;
        }
    }
    geom_meshes_map.set(id, getGeomMeshPline(id, pline_verts_i.length * 3, xyz_str, num_edges, indices, material_id));
}
/**
 * Export to dae collada file
 */
function exportDae(model, ssid) {
    // do we have color, texture, normal?
    const has_color_attrib = model.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.VERT, common_1.EAttribNames.COLOR);
    const has_normal_attrib = model.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.VERT, common_1.EAttribNames.NORMAL);
    const has_texture_attrib = model.modeldata.attribs.query.hasEntAttrib(common_1.EEntType.VERT, common_1.EAttribNames.TEXTURE);
    // create maps to store all the data
    const scene_inst_geoms_map = new Map();
    const nodes_inst_geoms_map = new Map();
    const visual_scene_nodes_map = new Map();
    const geom_meshes_map = new Map();
    const materials_map = new Map();
    const material_effectss_map = new Map();
    // create a rev map to look up colours
    const materials_pgons_rev_map = new Map();
    const materials_plines_rev_map = new Map();
    // process the polygons that are not in a collection
    const pgons_i = model.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.PGON);
    for (const pgon_i of pgons_i) {
        const material_id = processMaterialPgon(model, pgon_i, has_color_attrib, materials_map, material_effectss_map, materials_pgons_rev_map);
        const id = 'pg' + pgon_i;
        processGeomMeshPgon(model, pgon_i, material_id, geom_meshes_map);
        const inst_geom = getInstGeom(id, material_id);
        const colls_i = model.modeldata.geom.nav.navPgonToColl(pgon_i);
        if (colls_i === undefined) {
            scene_inst_geoms_map.set(id, inst_geom);
        }
        else {
            const coll_id = 'co' + colls_i[0];
            if (!visual_scene_nodes_map.has(coll_id)) {
                visual_scene_nodes_map.set(coll_id, getVisualSceneNode(coll_id));
            }
            if (!nodes_inst_geoms_map.has(coll_id)) {
                nodes_inst_geoms_map.set(coll_id, []);
            }
            nodes_inst_geoms_map.get(coll_id).push(inst_geom);
        }
    }
    // process the polylines that are not in a collection
    const plines_i = model.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.PLINE);
    for (const pline_i of plines_i) {
        const material_id = processMaterialPline(model, pline_i, has_color_attrib, materials_map, material_effectss_map, materials_plines_rev_map);
        const id = 'pl' + pline_i;
        processGeomMeshPline(model, pline_i, material_id, geom_meshes_map);
        const inst_geom = getInstGeom(id, material_id);
        const colls_i = model.modeldata.geom.nav.navPlineToColl(pline_i);
        if (colls_i === undefined) {
            scene_inst_geoms_map.set(id, inst_geom);
        }
        else {
            const coll_id = 'co' + colls_i[0];
            if (!visual_scene_nodes_map.has(coll_id)) {
                visual_scene_nodes_map.set(coll_id, getVisualSceneNode(coll_id));
            }
            if (!nodes_inst_geoms_map.has(coll_id)) {
                nodes_inst_geoms_map.set(coll_id, []);
            }
            nodes_inst_geoms_map.get(coll_id).push(inst_geom);
        }
    }
    // create the strings for insertion into the template
    let inst_geoms = Array.from(scene_inst_geoms_map.values()).join('');
    const geom_meshes = Array.from(geom_meshes_map.values()).join('');
    const materials = Array.from(materials_map.values()).join('');
    const material_effects = Array.from(material_effectss_map.values()).join('');
    // create the strings for the collections
    inst_geoms = inst_geoms + Array.from(visual_scene_nodes_map.values()).join('');
    let nodes = '';
    const ids = Array.from(nodes_inst_geoms_map.keys());
    for (const id of ids) {
        const node_inst_geoms = nodes_inst_geoms_map.get(id).join('');
        nodes = nodes + getNodesWithInstGeoms(id, node_inst_geoms);
    }
    // main template for a dae file, returned by this function
    const template = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
    <asset>
        <contributor>
            <authoring_tool>Mobius Modeller</authoring_tool>
        </contributor>
        <unit meter="1" name="meter" />
        <up_axis>Z_UP</up_axis>
    </asset>
	<library_materials>
		<material id="default_pgon_material" name="material">
			<instance_effect url="#default_pgon_effect" />
        </material>
        <material id="default_pline_material" name="material">
			<instance_effect url="#default_pline_effect" />
        </material>
        ${materials}
	</library_materials>
    <library_effects>
        <effect id="default_pgon_effect">
            <profile_COMMON>
                <technique sid="COMMON">
                    <lambert>
                        <diffuse>
                            <color>1 1 1 1</color>
                        </diffuse>
                    </lambert>
                </technique>
            </profile_COMMON>
        </effect>
        <effect id="default_pline_effect">
            <profile_COMMON>
                <technique sid="COMMON">
                    <constant>
                        <transparent opaque="A_ONE">
                            <color>0 0 0 1</color>
                        </transparent>
                        <transparency>
                            <float>1</float>
                        </transparency>
                    </constant>
                </technique>
            </profile_COMMON>
        </effect>
        ${material_effects}
    </library_effects>
    <scene>
        <instance_visual_scene url="#visual_scene" />
    </scene>
    <library_visual_scenes>
        <visual_scene id="visual_scene">
            <node name="mobius_modeller">
                ${inst_geoms}
            </node>
        </visual_scene>
    </library_visual_scenes>
    <library_nodes>
        ${nodes}
    </library_nodes>
    <library_geometries>
        ${geom_meshes}
    </library_geometries>
</COLLADA>
`;
    return template;
}
exports.exportDae = exportDae;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW9fZGFlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdHMvc3JjL2xpYnMvZ2VvLWluZm8vaW8vaW9fZGFlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXFDO0FBQ3JDLHNDQUFzRztBQUN0RyxrREFBMkM7QUFDM0Msa0RBQStDO0FBRS9DOztHQUVHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLE9BQWU7SUFDckMsTUFBTSxLQUFLLEdBQVksSUFBSSxpQkFBTyxFQUFFLENBQUM7SUFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ25DLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFKRCw4QkFJQztBQUVELFNBQVMsV0FBVyxDQUFDLEVBQVUsRUFBRSxXQUFtQjtJQUNoRCxPQUFPOzJDQUNnQyxFQUFFOzs7MkVBRzhCLFdBQVcsY0FBYyxXQUFXOzs7Ozs7aUJBTTlGLENBQUM7QUFDbEIsQ0FBQztBQUNELFNBQVMsZUFBZSxDQUFDLEVBQVUsRUFDM0IsU0FBaUIsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsV0FBbUI7SUFDakcsT0FBTzt3QkFDYSxFQUFFOzs4QkFFSSxFQUFFO3VDQUNPLEVBQUUsNEJBQTRCLFNBQVMsS0FBSyxPQUFPOzsyQ0FFL0MsU0FBUyxHQUFHLENBQUMsY0FBYyxFQUFFOzs7Ozs7O2dDQU94QyxFQUFFOzBEQUN3QixFQUFFOztvQ0FFeEIsT0FBTyxpQ0FBaUMsV0FBVzttRUFDcEIsRUFBRTt5QkFDNUMsV0FBVzs7OztTQUkzQixDQUFDO0FBQ1YsQ0FBQztBQUNELFNBQVMsZ0JBQWdCLENBQUMsRUFBVSxFQUM1QixTQUFpQixFQUFFLE9BQWUsRUFBRSxTQUFpQixFQUFFLFdBQW1CLEVBQUUsV0FBbUI7SUFDbkcsT0FBTzt3QkFDYSxFQUFFOzs4QkFFSSxFQUFFO3VDQUNPLEVBQUUsNEJBQTRCLFNBQVMsS0FBSyxPQUFPOzsyQ0FFL0Ms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