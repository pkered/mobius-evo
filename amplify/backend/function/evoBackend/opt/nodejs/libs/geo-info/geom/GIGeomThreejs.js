"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const THREE = __importStar(require("three"));
/**
 * Class for geometry.
 */
class GIGeomThreejs {
    /**
     * Constructor
     */
    constructor(modeldata, geom_maps) {
        this.modeldata = modeldata;
        this._geom_maps = geom_maps;
    }
    /**
     * Returns that data required for threejs triangles.
     * Arguments:
     * 1) ssid: the ssid to return data for
     * 2) vertex_map: a map that maps from gi vertex indicies to threejs vertex indicies
     * Returns:
     * 0) the vertices, as a flat array
     * 1) the select map, that maps from the threejs tri indices to the gi model tri indices
     * 2) the materials array, which is an array of objects
     * 3) the material groups array, which is an array of [ start, count, mat_index ]
     */
    get3jsTris(ssid, vertex_map) {
        // TODO this should not be parsed each time
        let settings = JSON.parse(localStorage.getItem('mpm_settings'));
        if (!settings) {
            settings = {
                'wireframe': {
                    'show': false
                }
            };
        }
        // arrays to store threejs data
        const tri_data_arrs = []; // tri_mat_indices, new_tri_verts_i, tri_i
        // materials
        const mat_front = {
            specular: 0x000000,
            emissive: 0x000000,
            shininess: 0,
            side: THREE.FrontSide,
            wireframe: settings.wireframe.show
        };
        const mat_back = {
            specular: 0x000000,
            emissive: 0x000000,
            shininess: 0,
            side: THREE.BackSide,
            wireframe: settings.wireframe.show
        };
        const materials = [this._getPgonMaterial(mat_front), this._getPgonMaterial(mat_back)];
        const material_names = ['default_front', 'default_back'];
        // get the material attribute from polygons
        const pgon_material_attrib = this.modeldata.attribs.attribs_maps.get(ssid).pg.get('material');
        // loop through all tris
        // get ents from snapshot
        const tris_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.TRI);
        for (const tri_i of tris_i) {
            const tri_verts_i = this._geom_maps.dn_tris_verts.get(tri_i);
            // get the verts, face and the polygon for this tri
            const new_tri_verts_i = tri_verts_i.map(v => vertex_map.get(v));
            // get the materials for this tri from the polygon
            const tri_pgon_i = this._geom_maps.up_tris_pgons.get(tri_i);
            const tri_mat_indices = [];
            if (pgon_material_attrib !== undefined) {
                const mat_attrib_val = pgon_material_attrib.getEntVal(tri_pgon_i);
                if (mat_attrib_val !== undefined) {
                    const pgon_mat_names = (Array.isArray(mat_attrib_val)) ? mat_attrib_val : [mat_attrib_val];
                    for (const pgon_mat_name of pgon_mat_names) {
                        let pgon_mat_index = material_names.indexOf(pgon_mat_name);
                        if (pgon_mat_index === -1) {
                            const mat_settings_obj = this.modeldata.attribs.attribs_maps.get(ssid).mo.get(pgon_mat_name);
                            if (mat_settings_obj !== undefined) {
                                pgon_mat_index = materials.length;
                                material_names.push(pgon_mat_name);
                                materials.push(this._getPgonMaterial(mat_settings_obj));
                            }
                            else {
                                throw new Error('Material not found: ' + pgon_mat_name);
                            }
                        }
                        if (pgon_mat_index !== -1) {
                            tri_mat_indices.push(pgon_mat_index);
                        }
                    }
                }
            }
            if (tri_mat_indices.length === 0) {
                tri_mat_indices.push(0); // default material front
                tri_mat_indices.push(1); // default material back
            }
            // add the data to the data_array
            tri_data_arrs.push([tri_mat_indices, new_tri_verts_i, tri_i]);
        }
        // sort that data_array, so that we get triangls sorted according to their materials
        // for each entry in the data_array, the first item is the material indices, so that they are sorted correctly
        if (pgon_material_attrib !== undefined) {
            tri_data_arrs.sort();
        }
        // loop through the sorted array and create the tris and groups data for threejs
        const tris_verts_i = [];
        const tri_select_map = new Map();
        const mat_groups_map = new Map(); // mat_index -> [start, end][]
        for (const tri_data_arr of tri_data_arrs) {
            // save the tri data
            const tjs_i = tris_verts_i.push(tri_data_arr[1]) - 1;
            tri_select_map.set(tjs_i, tri_data_arr[2]);
            // go through all materials for this tri and add save the mat groups data
            for (const mat_index of tri_data_arr[0]) {
                let start_end_arrs = mat_groups_map.get(mat_index);
                if (start_end_arrs === undefined) {
                    start_end_arrs = [[tjs_i, tjs_i]];
                    mat_groups_map.set(mat_index, start_end_arrs);
                }
                else {
                    const start_end = start_end_arrs[start_end_arrs.length - 1];
                    if (tjs_i === start_end[1] + 1) {
                        start_end[1] = tjs_i;
                    }
                    else {
                        start_end_arrs.push([tjs_i, tjs_i]);
                    }
                }
            }
        }
        // convert the mat_groups_map into the format required for threejs
        // for each material group, we need an array [start, count, mat_index]
        const material_groups = this._convertMatGroups(mat_groups_map, 3);
        // convert the verts list to a flat array
        // tslint:disable-next-line:no-unused-expression
        // @ts-ignore
        const tris_verts_i_flat = tris_verts_i.flat(1);
        // return the data
        // there are four sets of data that are returns
        return [
            tris_verts_i_flat,
            tri_select_map,
            materials,
            material_groups // 3) the material groups array, which is an array of [ start, count, mat_index ]
        ];
    }
    /**
     * Returns that data required for threejs edges.
     * 0) the vertices, as a flat array
     * 1) the select map, that maps from the threejs edge indices to the gi model edge indices
     * 2) the materials array, which is an array of objects
     * 3) the material groups array, which is an array of [ start, count, mat_index ]
     */
    get3jsEdges(ssid, vertex_map) {
        // arrays to store threejs data
        const edge_data_arrs = []; // edge_mat_indices, new_edge_verts_i, edge_i
        // materials
        const line_mat_black = {
            color: 0x000000,
            linewidth: 1
        };
        const line_mat_white = {
            color: 0xffffff,
            linewidth: 1
        };
        const materials = [this._getPlineMaterial(line_mat_black), this._getPlineMaterial(line_mat_white)];
        const material_names = ['black', 'white'];
        // check the hidden edges
        const visibility_attrib = this.modeldata.attribs.attribs_maps.get(ssid)._e.get('visibility');
        let hidden_edges_set;
        if (visibility_attrib) {
            hidden_edges_set = new Set(visibility_attrib.getEntsFromVal('hidden'));
        }
        // get the edge material attrib
        const pline_material_attrib = this.modeldata.attribs.attribs_maps.get(ssid).pl.get('material');
        // loop through all edges
        // get ents from snapshot
        const edges_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.EDGE);
        for (const edge_i of edges_i) {
            const edge_verts_i = this._geom_maps.dn_edges_verts.get(edge_i);
            // check hidden
            const hidden = visibility_attrib && hidden_edges_set.has(edge_i);
            if (!hidden) {
                // get the verts, face and the polygon for this tri
                const new_edge_verts_i = edge_verts_i.map(v => vertex_map.get(v));
                // get the materials for this tri from the polygon
                const edge_wire_i = this._geom_maps.up_edges_wires.get(edge_i);
                const edge_pline_i = this._geom_maps.up_wires_plines.get(edge_wire_i);
                let pline_mat_index = 0; // default black line
                if (pline_material_attrib !== undefined) {
                    const pline_mat_name = pline_material_attrib.getEntVal(edge_pline_i);
                    // check if the polyline has a material?
                    if (pline_mat_name !== undefined) {
                        pline_mat_index = material_names.indexOf(pline_mat_name);
                        // add material
                        if (pline_mat_index === -1) {
                            const mat_settings_obj = this.modeldata.attribs.attribs_maps.get(ssid).mo.get(pline_mat_name);
                            if (mat_settings_obj !== undefined) {
                                pline_mat_index = material_names.push(pline_mat_name) - 1;
                                materials.push(this._getPlineMaterial(mat_settings_obj));
                            }
                            else {
                                throw new Error('Material not found: ' + pline_mat_name);
                            }
                        }
                    }
                }
                // add the data to the data_array
                edge_data_arrs.push([pline_mat_index, new_edge_verts_i, edge_i]);
            }
        }
        // sort that data_array, so that we get edges sorted according to their materials
        // for each entry in the data_array, the first item is the material indices, so that they are sorted correctly
        if (pline_material_attrib !== undefined) {
            edge_data_arrs.sort();
        }
        // loop through the sorted array and create the edge and groups data for threejs
        const edges_verts_i = [];
        const edge_select_map = new Map();
        const mat_groups_map = new Map(); // mat_index -> [start, end][]
        for (const edge_data_arr of edge_data_arrs) {
            // save the tri data
            const tjs_i = edges_verts_i.push(edge_data_arr[1]) - 1;
            edge_select_map.set(tjs_i, edge_data_arr[2]);
            // get the edge material and add save the mat groups data
            const mat_index = edge_data_arr[0];
            let start_end_arrs = mat_groups_map.get(mat_index);
            if (start_end_arrs === undefined) {
                start_end_arrs = [[tjs_i, tjs_i]];
                mat_groups_map.set(mat_index, start_end_arrs);
            }
            else {
                const start_end = start_end_arrs[start_end_arrs.length - 1];
                if (tjs_i === start_end[1] + 1) {
                    start_end[1] = tjs_i;
                }
                else {
                    start_end_arrs.push([tjs_i, tjs_i]);
                }
            }
        }
        // convert the mat_groups_map into the format required for threejs
        // for each material group, we need an array [start, count, mat_index]
        const material_groups = this._convertMatGroups(mat_groups_map, 2);
        // convert the verts list to a flat array
        // tslint:disable-next-line:no-unused-expression
        // @ts-ignore
        const edges_verts_i_flat = edges_verts_i.flat(1);
        // return the data
        // there are four sets of data that are returns
        return [
            edges_verts_i_flat,
            edge_select_map,
            materials,
            material_groups // 3) the material groups array, which is an array of [ start, count, mat_index ]
        ];
    }
    /**
     * Returns a flat list of the sequence of verices for all the points.
     * The indices in the list point to the vertices.
     */
    get3jsPoints(ssid, vertex_map) {
        const points_verts_i_filt = [];
        const point_select_map = new Map();
        // get ents from snapshot
        const points_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.POINT);
        for (const point_i of points_i) {
            const vert_i = this._geom_maps.dn_points_verts.get(point_i);
            const new_point_verts_i = vertex_map.get(vert_i);
            const tjs_i = points_verts_i_filt.push(new_point_verts_i) - 1;
            point_select_map.set(tjs_i, point_i);
        }
        return [points_verts_i_filt, point_select_map];
    }
    /**
     * Create a threejs material
     * @param settings
     */
    _convertMatGroups(mat_groups_map, num_verts) {
        // convert the mat_groups_map into the format required for threejs
        // for each material group, we need an array [start, count, mat_index]
        const material_groups = []; // [start, count, mat_index][]
        mat_groups_map.forEach((start_end_arrs, mat_index) => {
            for (const start_end of start_end_arrs) {
                const start = start_end[0];
                const count = start_end[1] - start_end[0] + 1;
                material_groups.push([start * num_verts, count * num_verts, mat_index]);
            }
        });
        return material_groups;
    }
    /**
     * Create a threejs material
     * @param settings
     */
    _getPgonMaterial(settings) {
        const material = {
            type: 'MeshPhongMaterial',
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors
        };
        if (settings) {
            for (const key of Object.keys(settings)) {
                material[key] = settings[key];
            }
        }
        return material;
    }
    /**
 * Create a threejs material
 * @param settings
 */
    _getPlineMaterial(settings) {
        const material = {
            type: 'LineBasicMaterial'
        };
        if (settings) {
            for (const key of Object.keys(settings)) {
                material[key] = settings[key];
            }
        }
        return material;
    }
}
exports.GIGeomThreejs = GIGeomThreejs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lHZW9tVGhyZWVqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW8taW5mby9nZW9tL0dJR2VvbVRocmVlanMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsc0NBQWtGO0FBQ2xGLDZDQUErQjtBQUkvQjs7R0FFRztBQUNILE1BQWEsYUFBYTtJQUd0Qjs7T0FFRztJQUNILFlBQVksU0FBc0IsRUFBRSxTQUFvQjtRQUNwRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUNoQyxDQUFDO0lBQ0Q7Ozs7Ozs7Ozs7T0FVRztJQUNJLFVBQVUsQ0FBQyxJQUFZLEVBQUUsVUFBK0I7UUFFM0QsMkNBQTJDO1FBQzNDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxRQUFRLEdBQUc7Z0JBQ1AsV0FBVyxFQUFFO29CQUNULE1BQU0sRUFBRSxLQUFLO2lCQUNoQjthQUNKLENBQUM7U0FDTDtRQUVELCtCQUErQjtRQUMvQixNQUFNLGFBQWEsR0FBK0IsRUFBRSxDQUFDLENBQUMsMENBQTBDO1FBQ2hHLFlBQVk7UUFDWixNQUFNLFNBQVMsR0FBVztZQUN0QixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsUUFBUTtZQUNsQixTQUFTLEVBQUUsQ0FBQztZQUNaLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUztZQUNyQixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJO1NBQ3JDLENBQUM7UUFDRixNQUFNLFFBQVEsR0FBVztZQUNyQixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUs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