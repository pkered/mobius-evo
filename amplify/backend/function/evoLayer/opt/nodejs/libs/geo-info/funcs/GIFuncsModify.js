"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matrix_1 = require("../../geom/matrix");
const vectors_1 = require("../../geom/vectors");
const common_1 = require("../common");
const arrs_1 = require("@assets/libs/util/arrs");
/**
 * Class for transforming geometry: move, rotate, mirror, scale, xform.
 */
class GIFuncsModify {
    // ================================================================================================
    /**
     * Constructor
     */
    constructor(model) {
        this.modeldata = model;
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param vectors
     */
    move(ents_arr, vectors) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // process ents
        if (arrs_1.getArrDepth(vectors) === 1) {
            const posis_i = [];
            const vec = vectors;
            for (const ent_arr of ents_arr) {
                this.modeldata.geom.nav.navAnyToPosi(ent_arr[0], ent_arr[1]).forEach(posi_i => posis_i.push(posi_i));
            }
            const unique_posis_i = Array.from(new Set(posis_i));
            // loop
            for (const unique_posi_i of unique_posis_i) {
                const old_xyz = this.modeldata.attribs.posis.getPosiCoords(unique_posi_i);
                const new_xyz = vectors_1.vecAdd(old_xyz, vec);
                this.modeldata.attribs.posis.setPosiCoords(unique_posi_i, new_xyz);
            }
        }
        else {
            if (ents_arr.length !== vectors.length) {
                throw new Error('If multiple vectors are given, then the number of vectors must be equal to the number of entities.');
            }
            const posis_i = [];
            const vecs_map = new Map();
            for (let i = 0; i < ents_arr.length; i++) {
                const [ent_type, index] = ents_arr[i];
                const vec = vectors[i];
                const ent_posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                for (const ent_posi_i of ent_posis_i) {
                    posis_i.push(ent_posi_i);
                    if (!vecs_map.has(ent_posi_i)) {
                        vecs_map.set(ent_posi_i, []);
                    }
                    vecs_map.get(ent_posi_i).push(vec);
                }
            }
            // TODO entities could share positions, in which case the same position could be moved multi times
            // This could be confusing for the user
            // TODO snapshot
            for (const posi_i of posis_i) {
                const old_xyz = this.modeldata.attribs.posis.getPosiCoords(posi_i);
                const vecs = vecs_map.get(posi_i);
                const vec = vectors_1.vecDiv(vectors_1.vecSum(vecs), vecs.length);
                const new_xyz = vectors_1.vecAdd(old_xyz, vec);
                this.modeldata.attribs.posis.setPosiCoords(posi_i, new_xyz);
            }
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param ray
     * @param angle
     */
    rotate(ents_arr, ray, angle) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // rotate all positions
        const posis_i = [];
        for (const ents of ents_arr) {
            // TODO do not use spread operator
            posis_i.push(...this.modeldata.geom.nav.navAnyToPosi(ents[0], ents[1]));
        }
        const unique_posis_i = Array.from(new Set(posis_i));
        const matrix = matrix_1.rotateMatrix(ray, angle);
        for (const unique_posi_i of unique_posis_i) {
            const old_xyz = this.modeldata.attribs.posis.getPosiCoords(unique_posi_i);
            const new_xyz = matrix_1.multMatrix(old_xyz, matrix);
            this.modeldata.attribs.posis.setPosiCoords(unique_posi_i, new_xyz);
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param plane
     * @param scale
     */
    scale(ents_arr, plane, scale) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // handle scale type
        if (!Array.isArray(scale)) {
            scale = [scale, scale, scale];
        }
        // scale all positions
        const posis_i = [];
        for (const ents of ents_arr) {
            // TODO do not use spread operator
            posis_i.push(...this.modeldata.geom.nav.navAnyToPosi(ents[0], ents[1]));
        }
        const unique_posis_i = Array.from(new Set(posis_i));
        const matrix = matrix_1.scaleMatrix(plane, scale);
        for (const unique_posi_i of unique_posis_i) {
            const old_xyz = this.modeldata.attribs.posis.getPosiCoords(unique_posi_i);
            const new_xyz = matrix_1.multMatrix(old_xyz, matrix);
            this.modeldata.attribs.posis.setPosiCoords(unique_posi_i, new_xyz);
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param plane
     */
    mirror(ents_arr, plane) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // mirror all positions
        const posis_i = [];
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            // TODO do not use spread operator
            posis_i.push(...this.modeldata.geom.nav.navAnyToPosi(ent_type, index));
        }
        const unique_posis_i = Array.from(new Set(posis_i));
        const matrix = matrix_1.mirrorMatrix(plane);
        for (const unique_posi_i of unique_posis_i) {
            const old_xyz = this.modeldata.attribs.posis.getPosiCoords(unique_posi_i);
            const new_xyz = matrix_1.multMatrix(old_xyz, matrix);
            this.modeldata.attribs.posis.setPosiCoords(unique_posi_i, new_xyz);
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param from
     * @param to
     */
    xform(ents_arr, from, to) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // xform all positions
        const posis_i = [];
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            // TODO do not use spread operator
            posis_i.push(...this.modeldata.geom.nav.navAnyToPosi(ent_type, index));
        }
        const unique_posis_i = Array.from(new Set(posis_i));
        const matrix = matrix_1.xfromSourceTargetMatrix(from, to);
        for (const unique_posi_i of unique_posis_i) {
            const old_xyz = this.modeldata.attribs.posis.getPosiCoords(unique_posi_i);
            const new_xyz = matrix_1.multMatrix(old_xyz, matrix);
            this.modeldata.attribs.posis.setPosiCoords(unique_posi_i, new_xyz);
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param dist
     */
    offset(ents_arr, dist) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, true) as TEntTypeIdx[];
        // get all wires and offset
        const pgons_i = [];
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            const wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, index);
            for (const wire_i of wires_i) {
                this._offsetWire(wire_i, dist);
            }
            // save all pgons for re-tri
            const pgon_i = this.modeldata.geom.nav.navAnyToPgon(ent_type, index);
            if (pgon_i.length === 1) {
                if (pgons_i.indexOf(pgon_i[0]) === -1) {
                    pgons_i.push(pgon_i[0]);
                }
            }
        }
        // re-tri all polygons
        if (pgons_i.length > 0) {
            this.modeldata.geom.edit_pgon.triPgons(pgons_i);
        }
    }
    _offsetWire(wire_i, dist) {
        // get the normal of the wire
        const vec_norm = this.modeldata.geom.query.getWireNormal(wire_i);
        // if (vecLen(vec_norm) === 0) {
        //     vec_norm = [0, 0, 1];
        // }
        // loop through all edges and collect the required data
        const edges_i = this.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.WIRE, wire_i).slice(); // make a copy
        const is_closed = this.modeldata.geom.query.isWireClosed(wire_i);
        // the index to these arrays is the edge_i
        let perp_vec = null;
        let has_bad_edges = false;
        const perp_vecs = []; // index is edge_i
        const pairs_xyzs = []; // index is edge_i
        const pairs_posis_i = []; // index is edge_i
        for (const edge_i of edges_i) {
            const posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            const xyzs = posis_i.map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
            const edge_vec = vectors_1.vecFromTo(xyzs[0], xyzs[1]);
            const edge_len = vectors_1.vecLen(edge_vec);
            pairs_xyzs[edge_i] = xyzs;
            pairs_posis_i[edge_i] = posis_i;
            if (edge_len > 0) {
                perp_vec = vectors_1.vecCross(vectors_1.vecNorm(edge_vec), vec_norm);
            }
            else {
                if (perp_vec === null) {
                    has_bad_edges = true;
                }
            }
            perp_vecs[edge_i] = perp_vec;
        }
        // fix any bad edges, by setting the perp vec to its next neighbour
        if (has_bad_edges) {
            if (perp_vecs[perp_vecs.length - 1] === null) {
                throw new Error('Error: could not offset wire.');
            }
            for (let i = perp_vecs.length - 1; i >= 0; i--) {
                if (perp_vecs[i] === null) {
                    perp_vecs[i] = perp_vec;
                }
                else {
                    perp_vec = perp_vecs[i];
                }
            }
        }
        // add edge if this is a closed wire
        // make sure the edges_i is a copy, otherwise we are pushing into the model data structure
        if (is_closed) {
            edges_i.push(edges_i[0]); // add to the end
        }
        // loop through all the valid edges
        for (let i = 0; i < edges_i.length - 1; i++) {
            // get the two edges
            const this_edge_i = edges_i[i];
            const next_edge_i = edges_i[i + 1];
            // get the end posi_i and xyz of this edge
            const posi_i = pairs_posis_i[this_edge_i][1];
            const old_xyz = pairs_xyzs[this_edge_i][1];
            // get the two perpendicular vectors
            const this_perp_vec = perp_vecs[this_edge_i];
            const next_perp_vec = perp_vecs[next_edge_i];
            // calculate the offset vector
            let offset_vec = vectors_1.vecNorm(vectors_1.vecAdd(this_perp_vec, next_perp_vec));
            const dot = vectors_1.vecDot(this_perp_vec, offset_vec);
            const vec_len = dist / dot;
            offset_vec = vectors_1.vecSetLen(offset_vec, vec_len);
            // move the posi
            const new_xyz = vectors_1.vecAdd(old_xyz, offset_vec);
            this.modeldata.attribs.posis.setPosiCoords(posi_i, new_xyz);
        }
        // if this is not a closed wire we have to move first and last posis
        if (!is_closed) {
            // first posi
            const first_edge_i = edges_i[0];
            const first_posi_i = pairs_posis_i[first_edge_i][0];
            const first_old_xyz = pairs_xyzs[first_edge_i][0];
            const first_perp_vec = vectors_1.vecSetLen(perp_vecs[first_edge_i], dist);
            const first_new_xyz = vectors_1.vecAdd(first_old_xyz, first_perp_vec);
            this.modeldata.attribs.posis.setPosiCoords(first_posi_i, first_new_xyz);
            // last posi
            const last_edge_i = edges_i[edges_i.length - 1];
            const last_posi_i = pairs_posis_i[last_edge_i][1];
            const last_old_xyz = pairs_xyzs[last_edge_i][1];
            const last_perp_vec = vectors_1.vecSetLen(perp_vecs[last_edge_i], dist);
            const last_new_xyz = vectors_1.vecAdd(last_old_xyz, last_perp_vec);
            this.modeldata.attribs.posis.setPosiCoords(last_posi_i, last_new_xyz);
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     */
    remesh(ents_arr) {
        // no snapshot copy in this case
        for (const [ent_type, index] of ents_arr) {
            if (ent_type === common_1.EEntType.PGON) {
                this.modeldata.geom.edit_pgon.triPgons(index);
            }
            else {
                const pgons_i = this.modeldata.geom.nav.navAnyToPgon(ent_type, index);
                this.modeldata.geom.edit_pgon.triPgons(pgons_i);
            }
        }
    }
}
exports.GIFuncsModify = GIFuncsModify;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lGdW5jc01vZGlmeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW8taW5mby9mdW5jcy9HSUZ1bmNzTW9kaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQWlIO0FBQ2pILGdEQUFxSDtBQUNySCxzQ0FBc0U7QUFFdEUsaURBQXFEO0FBSXJEOztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBR3RCLG1HQUFtRztJQUNuRzs7T0FFRztJQUNILFlBQVksS0FBa0I7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUNELG1HQUFtRztJQUNuRzs7OztPQUlHO0lBQ0ksSUFBSSxDQUFDLFFBQXVCLEVBQUUsT0FBb0I7UUFDckQscUJBQXFCO1FBQ3JCLHFGQUFxRjtRQUNyRixlQUFlO1FBQ2YsSUFBSSxrQkFBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QixNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7WUFDN0IsTUFBTSxHQUFHLEdBQVMsT0FBZSxDQUFDO1lBQ2xDLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDeEc7WUFDRCxNQUFNLGNBQWMsR0FBYSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDOUQsT0FBTztZQUNQLEtBQUssTUFBTSxhQUFhLElBQUksY0FBYyxFQUFF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