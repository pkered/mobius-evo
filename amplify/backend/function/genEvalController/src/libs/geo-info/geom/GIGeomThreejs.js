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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lHZW9tVGhyZWVqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3RzL3NyYy9saWJzL2dlby1pbmZvL2dlb20vR0lHZW9tVGhyZWVqcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxzQ0FBa0Y7QUFDbEYsNkNBQStCO0FBSS9COztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBR3RCOztPQUVHO0lBQ0gsWUFBWSxTQUFzQixFQUFFLFNBQW9CO1FBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFDRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksVUFBVSxDQUFDLElBQVksRUFBRSxVQUErQjtRQUUzRCwyQ0FBMkM7UUFDM0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLFFBQVEsR0FBRztnQkFDUCxXQUFXLEVBQUU7b0JBQ1QsTUFBTSxFQUFFLEtBQUs7aUJBQ2hCO2FBQ0osQ0FBQztTQUNMO1FBRUQsK0JBQStCO1FBQy9CLE1BQU0sYUFBYSxHQUErQixFQUFFLENBQUMsQ0FBQywwQ0FBMEM7UUFDaEcsWUFBWTtRQUNaLE1BQU0sU0FBUyxHQUFXO1lBQ3RCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTO1lBQ3JCLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUk7U0FDckMsQ0FBQztRQUNGLE1BQU0sUUFBUSxHQUFXO1lBQ3JCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxF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