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
const vectors_1 = require("../../geom/vectors");
const Mathjs = __importStar(require("mathjs"));
/**
 * Class for geometry.
 */
class GIGeomQuery {
    /**
     * Constructor
     */
    constructor(modeldata, geom_maps) {
        this.modeldata = modeldata;
        this._geom_maps = geom_maps;
    }
    // ============================================================================
    // Entities
    // ============================================================================
    /**
     * Returns a list of indices for ents.
     * @param ent_type
     */
    getEnts(ent_type) {
        const geom_map_key = common_1.EEntStrToGeomMaps[ent_type];
        // collections
        if (ent_type === common_1.EEntType.COLL) {
            return Array.from(this._geom_maps[geom_map_key]);
        }
        // get ents indices array from down arrays
        const geom_map = this._geom_maps[geom_map_key];
        return Array.from(geom_map.keys());
    }
    /**
     * Returns the number of entities
     */
    numEnts(ent_type) {
        const geom_array_key = common_1.EEntStrToGeomMaps[ent_type];
        return this._geom_maps[geom_array_key].size;
    }
    /**
     * Returns the number of entities for [posis, point, polylines, polygons, collections].
     */
    numEntsAll() {
        return [
            this.numEnts(common_1.EEntType.POSI),
            this.numEnts(common_1.EEntType.POINT),
            this.numEnts(common_1.EEntType.PLINE),
            this.numEnts(common_1.EEntType.PGON),
            this.numEnts(common_1.EEntType.COLL)
        ];
    }
    /**
     * Check if an entity exists
     * @param ent_type
     * @param index
     */
    entExists(ent_type, index) {
        const geom_maps_key = common_1.EEntStrToGeomMaps[ent_type];
        return this._geom_maps[geom_maps_key].has(index);
    }
    /**
     * Fill a map of sets of unique indexes
     */
    getEntsMap(ents, ent_types) {
        const set_ent_types = new Set(ent_types);
        const map = new Map();
        ent_types.forEach(ent_type => map.set(ent_type, new Set()));
        for (const [ent_type, ent_i] of ents) {
            if (set_ent_types.has(common_1.EEntType.COLL)) {
                this.modeldata.geom.nav.navAnyToColl(ent_type, ent_i).forEach(coll_i => map.get(common_1.EEntType.COLL).add(coll_i));
            }
            if (set_ent_types.has(common_1.EEntType.PGON)) {
                this.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i).forEach(pgon_i => map.get(common_1.EEntType.PGON).add(pgon_i));
            }
            if (set_ent_types.has(common_1.EEntType.PLINE)) {
                this.modeldata.geom.nav.navAnyToPline(ent_type, ent_i).forEach(pline_i => map.get(common_1.EEntType.PLINE).add(pline_i));
            }
            if (set_ent_types.has(common_1.EEntType.POINT)) {
                this.modeldata.geom.nav.navAnyToPoint(ent_type, ent_i).forEach(point_i => map.get(common_1.EEntType.POINT).add(point_i));
            }
            if (set_ent_types.has(common_1.EEntType.WIRE)) {
                this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i).forEach(wire_i => map.get(common_1.EEntType.WIRE).add(wire_i));
            }
            if (set_ent_types.has(common_1.EEntType.EDGE)) {
                this.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i).forEach(edge_i => map.get(common_1.EEntType.EDGE).add(edge_i));
            }
            if (set_ent_types.has(common_1.EEntType.VERT)) {
                this.modeldata.geom.nav.navAnyToVert(ent_type, ent_i).forEach(vert_i => map.get(common_1.EEntType.VERT).add(vert_i));
            }
            if (set_ent_types.has(common_1.EEntType.POSI)) {
                this.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i).forEach(posi_i => map.get(common_1.EEntType.POSI).add(posi_i));
            }
        }
        return map;
    }
    /**
     * Returns true if the first coll is a descendent of the second coll.
     * @param coll_i
     */
    isCollDescendent(coll1_i, coll2_i) {
        const ssid = this.modeldata.active_ssid;
        let parent_coll_i = this.modeldata.geom.snapshot.getCollParent(ssid, coll1_i);
        while (parent_coll_i !== undefined) {
            if (parent_coll_i === coll2_i) {
                return true;
            }
            parent_coll_i = this.modeldata.geom.snapshot.getCollParent(ssid, parent_coll_i);
        }
        return false;
    }
    /**
     * Returns true if the first coll is an ancestor of the second coll.
     * @param coll_i
     */
    isCollAncestor(coll1_i, coll2_i) {
        const ssid = this.modeldata.active_ssid;
        let parent_coll_i = this.modeldata.geom.snapshot.getCollParent(ssid, coll2_i);
        while (parent_coll_i !== undefined) {
            if (parent_coll_i === coll1_i) {
                return true;
            }
            parent_coll_i = this.modeldata.geom.snapshot.getCollParent(ssid, parent_coll_i);
        }
        return false;
    }
    // ============================================================================
    // Posis
    // ============================================================================
    /**
     * Returns a list of indices for all posis that have no verts
     */
    getUnusedPosis() {
        const posis_i = [];
        this._geom_maps.up_posis_verts.forEach((posi, posi_i) => {
            if (posi.length === 0) {
                posis_i.push(posi_i);
            }
        });
        return posis_i;
    }
    // ============================================================================
    // Verts
    // ============================================================================
    /**
     * Get two edges that are adjacent to this vertex that are both not zero length.
     * In some cases wires and polygons have edges that are zero length.
     * This causes problems for calculating normals etc.
     * The return value can be either one edge (in open polyline [null, edge_i], [edge_i, null])
     * or two edges (in all other cases) [edge_i, edge_i].
     * If the vert has no non-zero edges, then [null, null] is returned.
     * @param vert_i
     */
    getVertNonZeroEdges(vert_i) {
        // get the wire start and end verts
        const edges_i = this._geom_maps.up_verts_edges.get(vert_i);
        const posi_coords = [];
        // get the first edge
        let edge0 = null;
        if (edges_i[0] !== null || edges_i[0] !== undefined) {
            let prev_edge_i = edges_i[0];
            while (edge0 === null) {
                if (prev_edge_i === edges_i[1]) {
                    break;
                }
                const edge_verts_i = this._geom_maps.dn_edges_verts.get(prev_edge_i);
                // first
                const posi0_i = this._geom_maps.dn_verts_posis.get(edge_verts_i[0]);
                if (posi_coords[posi0_i] === undefined) {
                    posi_coords[posi0_i] = this.modeldata.attribs.posis.getPosiCoords(posi0_i);
                }
                const xyz0 = posi_coords[posi0_i];
                // second
                const posi1_i = this._geom_maps.dn_verts_posis.get(edge_verts_i[1]);
                if (posi_coords[posi1_i] === undefined) {
                    posi_coords[posi1_i] = this.modeldata.attribs.posis.getPosiCoords(posi1_i);
                }
                const xyz1 = posi_coords[posi1_i];
                // check
                if (Math.abs(xyz0[0] - xyz1[0]) > 0 || Math.abs(xyz0[1] - xyz1[1]) > 0 || Math.abs(xyz0[2] - xyz1[2]) > 0) {
                    edge0 = prev_edge_i;
                }
                else {
                    prev_edge_i = this._geom_maps.up_verts_edges.get(edge_verts_i[0])[0];
                    if (prev_edge_i === null || prev_edge_i === undefined) {
                        break;
                    }
                }
            }
        }
        // get the second edge
        let edge1 = null;
        if (edges_i[1] !== null || edges_i[1] !== undefined) {
            let next_edge_i = edges_i[1];
            while (edge1 === null) {
                if (next_edge_i === edges_i[0]) {
                    break;
                }
                const edge_verts_i = this._geom_maps.dn_edges_verts.get(next_edge_i);
                // first
                const posi0_i = this._geom_maps.dn_verts_posis.get(edge_verts_i[0]);
                if (posi_coords[posi0_i] === undefined) {
                    posi_coords[posi0_i] = this.modeldata.attribs.posis.getPosiCoords(posi0_i);
                }
                const xyz0 = posi_coords[posi0_i];
                // second
                const posi1_i = this._geom_maps.dn_verts_posis.get(edge_verts_i[1]);
                if (posi_coords[posi1_i] === undefined) {
                    posi_coords[posi1_i] = this.modeldata.attribs.posis.getPosiCoords(posi1_i);
                }
                const xyz1 = posi_coords[posi1_i];
                // check
                if (Math.abs(xyz0[0] - xyz1[0]) > 0 || Math.abs(xyz0[1] - xyz1[1]) > 0 || Math.abs(xyz0[2] - xyz1[2]) > 0) {
                    edge1 = next_edge_i;
                }
                else {
                    next_edge_i = this._geom_maps.up_verts_edges.get(edge_verts_i[1])[1];
                    if (next_edge_i === null || next_edge_i === undefined) {
                        break;
                    }
                }
            }
        }
        // return the two edges, they can be null
        return [edge0, edge1];
    }
    // ============================================================================
    // Edges
    // ============================================================================
    /**
     * Get the next edge in a sequence of edges
     * @param edge_i
     */
    getNextEdge(edge_i) {
        // get the wire start and end verts
        const edge = this._geom_maps.dn_edges_verts.get(edge_i);
        const edges_i = this._geom_maps.up_verts_edges.get(edge[1]);
        if (edges_i.length === 1) {
            return null;
        }
        return edges_i[1];
    }
    /**
     * Get the previous edge in a sequence of edges
     * @param edge_i
     */
    getPrevEdge(edge_i) {
        // get the wire start and end verts
        const edge = this._geom_maps.dn_edges_verts.get(edge_i);
        const edges_i = this._geom_maps.up_verts_edges.get(edge[0]);
        if (edges_i.length === 1) {
            return null;
        }
        return edges_i[1];
    }
    /**
     * Get a list of edges that are neighbours ()
     * The list will include the input edge.
     * @param edge_i
     */
    getNeighborEdges(edge_i) {
        // get the wire start and end verts
        const edge = this._geom_maps.dn_edges_verts.get(edge_i);
        const start_posi_i = this._geom_maps.dn_verts_posis.get(edge[0]);
        const end_posi_i = this._geom_maps.dn_verts_posis.get(edge[1]);
        const start_edges_i = this.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.POSI, start_posi_i);
        const end_edges_i = this.modeldata.geom.nav.navAnyToEdge(common_1.EEntType.POSI, end_posi_i);
        return Mathjs.setIntersect(start_edges_i, end_edges_i);
    }
    // ============================================================================
    // Wires
    // ============================================================================
    /**
     * Check if a wire is closed.
     * @param wire_i
     */
    isWireClosed(wire_i) {
        // get the wire start and end verts
        const wire = this._geom_maps.dn_wires_edges.get(wire_i);
        const num_edges = wire.length;
        const start_edge_i = wire[0];
        const end_edge_i = wire[num_edges - 1];
        const start_vert_i = this.modeldata.geom.nav.navEdgeToVert(start_edge_i)[0];
        const end_vert_i = this.modeldata.geom.nav.navEdgeToVert(end_edge_i)[1];
        // if start and end verts are the same, then wire is closed
        return (start_vert_i === end_vert_i);
    }
    /**
     * Check if a wire belongs to a pline, a pgon or a pgon hole.
     */
    getWireType(wire_i) {
        // get the wire start and end verts
        if (this.modeldata.geom.nav.navWireToPline(wire_i) !== undefined) {
            return common_1.EWireType.PLINE;
        }
        const pgon_i = this.modeldata.geom.nav.navWireToPgon(wire_i);
        const wires_i = this._geom_maps.dn_pgons_wires.get(pgon_i); // nav.getFace(face_i);
        const index = wires_i.indexOf(wire_i);
        if (index === 0) {
            return common_1.EWireType.PGON;
        }
        if (index > 0) {
            return common_1.EWireType.PGON_HOLE;
        }
        throw new Error('Inconsistencies found in the internal data structure.');
    }
    /**
     * Returns the vertices.
     * For a closed wire, #vertices = #edges
     * For an open wire, #vertices = #edges + 1
     * @param wire_i
     */
    getWireVerts(wire_i) {
        const edges_i = this._geom_maps.dn_wires_edges.get(wire_i); // WARNING BY REF
        const verts_i = [];
        // walk the edges chain
        let next_edge_i = edges_i[0];
        for (let i = 0; i < edges_i.length; i++) {
            const edge_verts_i = this._geom_maps.dn_edges_verts.get(next_edge_i);
            verts_i.push(edge_verts_i[0]);
            next_edge_i = this.getNextEdge(next_edge_i);
            // are we at the end of the chain
            if (next_edge_i === null) { // open wire
                verts_i.push(edge_verts_i[1]);
                break;
            }
            else if (next_edge_i === edges_i[0]) { // closed wire
                break;
            }
        }
        return verts_i;
    }
    // ============================================================================
    // Faces
    // ============================================================================
    /**
     *
     * @param pgon_i
     */
    getPgonBoundary(pgon_i) {
        return this._geom_maps.dn_pgons_wires.get(pgon_i)[0];
    }
    /**
     *
     * @param pgon_i
     */
    getPgonHoles(pgon_i) {
        return this._geom_maps.dn_pgons_wires.get(pgon_i).slice(1);
    }
    /**
     *
     * @param pgon_i
     */
    getPgonNormal(pgon_i) {
        return this.modeldata.geom.snapshot.getPgonNormal(this.modeldata.active_ssid, pgon_i);
    }
    // ============================================================================
    // Calculate
    // ============================================================================
    /**
     *
     * @param ent_i
     */
    getCentroid(ent_type, ent_i) {
        const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        const centroid = [0, 0, 0];
        for (const posi_i of posis_i) {
            const xyz = this.modeldata.attribs.posis.getPosiCoords(posi_i);
            centroid[0] += xyz[0];
            centroid[1] += xyz[1];
            centroid[2] += xyz[2];
        }
        return vectors_1.vecDiv(centroid, posis_i.length);
    }
    /**
     * Gets a normal from a wire.
     *
     * It triangulates the wire and then adds up all the normals of all the triangles.
     * Each edge has equal weight, irrespective of length.
     *
     * In some cases, the triangles may cancel each other out.
     * In such a case, it will choose the side' where the wire edges are the longest.
     *
     * @param wire_i
     */
    getWireNormal(wire_i) {
        const edges_i = this.modeldata.geom._geom_maps.dn_wires_edges.get(wire_i);
        // deal with special case, just a single edge
        if (edges_i.length === 1) {
            const posis_i = this._geom_maps.dn_edges_verts.get(edges_i[0]).map(vert_i => this._geom_maps.dn_verts_posis.get(vert_i));
            const xyz0 = this.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
            const xyz1 = this.modeldata.attribs.posis.getPosiCoords(posis_i[1]);
            if (xyz0[2] === xyz1[2]) {
                return [0, 0, 1];
            }
            if (xyz0[1] === xyz1[1]) {
                return [0, 1, 0];
            }
            if (xyz0[0] === xyz1[0]) {
                return [1, 0, 0];
            }
            return vectors_1.vecNorm(vectors_1.vecCross(vectors_1.vecFromTo(xyz0, xyz1), [0, 0, 1]));
        }
        // proceed with multiple edges
        const centroid = this.getCentroid(common_1.EEntType.WIRE, wire_i);
        const normal = [0, 0, 0];
        const tri_normals = [];
        // let count = 0;
        for (const edge_i of edges_i) {
            const posis_i = this._geom_maps.dn_edges_verts.get(edge_i).map(vert_i => this._geom_maps.dn_verts_posis.get(vert_i));
            const xyzs = posis_i.map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
            const vec_a = vectors_1.vecFromTo(centroid, xyzs[0]);
            const vec_b = vectors_1.vecFromTo(centroid, xyzs[1]); // CCW
            const tri_normal = vectors_1.vecCross(vec_a, vec_b, true);
            tri_normals.push(tri_normal);
            normal[0] += tri_normal[0];
            normal[1] += tri_normal[1];
            normal[2] += tri_normal[2];
        }
        // if we have a non-zero normal, then return it
        if (Math.abs(normal[0]) > 1e-6 || Math.abs(normal[1]) > 1e-6 || Math.abs(normal[2]) > 1e-6) {
            return vectors_1.vecNorm(normal);
        }
        // check for special case of a symmetrical shape where all triangle normals are
        // cancelling each other out, we need to look at both 'sides', see which is bigger
        const normal_a = [0, 0, 0];
        const normal_b = [0, 0, 0];
        let len_a = 0;
        let len_b = 0;
        let first_normal_a = null;
        for (const edge_i of edges_i) {
            const posis_i = this._geom_maps.dn_edges_verts.get(edge_i).map(vert_i => this._geom_maps.dn_verts_posis.get(vert_i));
            const xyzs = posis_i.map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
            const vec_a = vectors_1.vecFromTo(centroid, xyzs[0]);
            const vec_b = vectors_1.vecFromTo(centroid, xyzs[1]); // CCW
            const tri_normal = vectors_1.vecCross(vec_a, vec_b, true);
            if (!(tri_normal[0] === 0 && tri_normal[1] === 0 && tri_normal[2] === 0)) {
                if (first_normal_a === null) {
                    first_normal_a = tri_normal;
                    normal_a[0] = tri_normal[0];
                    normal_a[1] = tri_normal[1];
                    normal_a[2] = tri_normal[2];
                    len_a += vectors_1.vecLen(vectors_1.vecFromTo(xyzs[0], xyzs[1]));
                }
                else {
                    if (vectors_1.vecDot(first_normal_a, tri_normal) > 0) {
                        normal_a[0] += tri_normal[0];
                        normal_a[1] += tri_normal[1];
                        normal_a[2] += tri_normal[2];
                        len_a += vectors_1.vecLen(vectors_1.vecFromTo(xyzs[0], xyzs[1]));
                    }
                    else {
                        normal_b[0] += tri_normal[0];
                        normal_b[1] += tri_normal[1];
                        normal_b[2] += tri_normal[2];
                        len_b += vectors_1.vecLen(vectors_1.vecFromTo(xyzs[0], xyzs[1]));
                    }
                }
            }
        }
        // return the normal for the longest set of edges in the wire
        // if they are the same length, return the normal associated with the start of the wire
        if (len_a >= len_b) {
            return vectors_1.vecNorm(normal_a);
        }
        return vectors_1.vecNorm(normal_b);
    }
    // ============================================================================
    // Other methods
    // ============================================================================
    /**
     * Given a set of vertices, get the welded neighbour entities.
     * @param ent_type
     * @param verts_i
     */
    neighbor(ent_type, verts_i) {
        const neighbour_ents_i = new Set();
        for (const vert_i of verts_i) {
            const posi_i = this.modeldata.geom.nav.navVertToPosi(vert_i);
            const found_verts_i = this.modeldata.geom.nav.navPosiToVert(posi_i);
            for (const found_vert_i of found_verts_i) {
                if (verts_i.indexOf(found_vert_i) === -1) {
                    const found_ents_i = this.modeldata.geom.nav.navAnyToAny(common_1.EEntType.VERT, ent_type, found_vert_i);
                    found_ents_i.forEach(found_ent_i => neighbour_ents_i.add(found_ent_i));
                }
            }
        }
        return Array.from(neighbour_ents_i);
    }
    /**
     * Given a set of edges, get the perimeter entities.
     * @param ent_type
     * @param edges_i
     */
    perimeter(ent_type, edges_i) {
        const edge_posis_map = new Map();
        const edge_to_posi_pairs_map = new Map();
        for (const edge_i of edges_i) {
            const posi_pair_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            if (!edge_posis_map.has(posi_pair_i[0])) {
                edge_posis_map.set(posi_pair_i[0], []);
            }
            edge_posis_map.get(posi_pair_i[0]).push(posi_pair_i[1]);
            edge_to_posi_pairs_map.set(edge_i, posi_pair_i);
        }
        const perimeter_ents_i = new Set();
        for (const edge_i of edges_i) {
            const posi_pair_i = edge_to_posi_pairs_map.get(edge_i);
            if (!edge_posis_map.has(posi_pair_i[1]) || edge_posis_map.get(posi_pair_i[1]).indexOf(posi_pair_i[0]) === -1) {
                const found_ents_i = this.modeldata.geom.nav.navAnyToAny(common_1.EEntType.EDGE, ent_type, edge_i);
                found_ents_i.forEach(found_ent_i => perimeter_ents_i.add(found_ent_i));
            }
        }
        return Array.from(perimeter_ents_i);
    }
    /**
     * Get the object of a topo entity.
     * Returns a point, pline, or pgon. (no posis)
     * @param ent_type
     * @param ent_i
     */
    getTopoObj(ent_type, ent_i) {
        switch (ent_type) {
            case common_1.EEntType.WIRE:
            case common_1.EEntType.EDGE:
            case common_1.EEntType.VERT:
                const pgons_i = this.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                if (pgons_i.length !== 0) {
                    return [common_1.EEntType.PGON, pgons_i[0]];
                }
                const plines_i = this.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
                if (plines_i.length !== 0) {
                    return [common_1.EEntType.PLINE, plines_i[0]];
                }
                // must be a vertex of a point, no other option
                const point_i = this.modeldata.geom.nav.navVertToPoint(ent_i);
                if (point_i !== undefined) {
                    return [common_1.EEntType.POINT, point_i];
                }
                throw new Error('Error in geometry: Object for a topo entity not found.');
                break;
            default:
                throw new Error('Invalid entity type: Must be a topo entity.');
        }
    }
    /**
     * Get the object type of a topo entity.
     * @param ent_type
     * @param ent_i
     */
    getTopoObjType(ent_type, ent_i) {
        switch (ent_type) {
            case common_1.EEntType.WIRE:
            case common_1.EEntType.EDGE:
            case common_1.EEntType.VERT:
                if (this.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i).length !== 0) {
                    return common_1.EEntType.PGON;
                }
                else if (this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i).length !== 0) {
                    return common_1.EEntType.PLINE;
                }
                else if (this.modeldata.geom.nav.navAnyToVert(ent_type, ent_i).length !== 0) {
                    return common_1.EEntType.POINT;
                }
                break;
            default:
                throw new Error('Invalid entity type: Must be a topo entity.');
        }
    }
    /**
     * Get the topo entities of an object
     * @param ent_type
     * @param ent_i
     */
    getObjTopo(ent_type, ent_i) {
        return [
            this.modeldata.geom.nav.navAnyToVert(ent_type, ent_i),
            this.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i),
            this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i)
        ];
    }
    /**
     * Get the entities under a collection or object.
     * Returns a list of entities in hierarchical order.
     * For polygons and polylines, the list is ordered like this:
     * wire, vert, posi, edge, vert, posi, edge, vert, posi
     * @param ent_type
     * @param ent_i
     */
    getEntSubEnts(ent_type, ent_i) {
        const tree = [];
        switch (ent_type) {
            case common_1.EEntType.COLL:
                {
                    for (const coll_i of this.modeldata.geom.nav.navCollToCollChildren(ent_i)) {
                        tree.push([common_1.EEntType.COLL, coll_i]);
                    }
                }
                return tree;
            case common_1.EEntType.PGON:
                {
                    for (const wire_i of this.modeldata.geom.nav.navPgonToWire(ent_i)) {
                        this._addtWireSubEnts(wire_i, tree);
                    }
                }
                return tree;
            case common_1.EEntType.PLINE:
                {
                    const wire_i = this.modeldata.geom.nav.navPlineToWire(ent_i);
                    this._addtWireSubEnts(wire_i, tree);
                }
                return tree;
            case common_1.EEntType.POINT:
                {
                    const vert_i = this.modeldata.geom.nav.navPointToVert(ent_i);
                    tree.push([common_1.EEntType.VERT, vert_i]);
                    tree.push([common_1.EEntType.POSI, this.modeldata.geom.nav.navVertToPosi(vert_i)]);
                }
                return tree;
            default:
                break;
        }
    }
    _addtWireSubEnts(wire_i, tree) {
        tree.push([common_1.EEntType.WIRE, wire_i]);
        const edges_i = this.modeldata.geom.nav.navWireToEdge(wire_i);
        for (const edge_i of edges_i) {
            const [vert0_i, vert1_i] = this.modeldata.geom.nav.navEdgeToVert(edge_i);
            const posi0_i = this.modeldata.geom.nav.navVertToPosi(vert0_i);
            tree.push([common_1.EEntType.VERT, vert0_i]);
            tree.push([common_1.EEntType.POSI, posi0_i]);
            tree.push([common_1.EEntType.EDGE, edge_i]);
            if (edge_i === edges_i[edges_i.length - 1]) {
                const posi1_i = this.modeldata.geom.nav.navVertToPosi(vert1_i);
                tree.push([common_1.EEntType.VERT, vert1_i]);
                tree.push([common_1.EEntType.POSI, posi1_i]);
            }
        }
    }
}
exports.GIGeomQuery = GIGeomQuery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lHZW9tUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2xpYnMvZ2VvLWluZm8vZ2VvbS9HSUdlb21RdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSxzQ0FDa0Q7QUFDbEQsZ0RBQTBGO0FBQzFGLCtDQUFpQztBQUVqQzs7R0FFRztBQUNILE1BQWEsV0FBVztJQUdwQjs7T0FFRztJQUNILFlBQVksU0FBc0IsRUFBRSxTQUFvQjtRQUNwRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsK0VBQStFO0lBQy9FLFdBQVc7SUFDWCwrRUFBK0U7SUFDL0U7OztPQUdHO0lBQ0ksT0FBTyxDQUFDLFFBQWtCO1FBQzdCLE1BQU0sWUFBWSxHQUFXLDBCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELGNBQWM7UUFDZCxJQUFJLFFBQVEsS0FBSyxpQkFBUSxDQUFDLElBQUksRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FBRTtRQUNyRiwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQXFCLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRDs7T0FFRztJQUNJLE9BQU8sQ0FBQyxRQUFrQjtRQUM3QixNQUFNLGNBQWMsR0FBVywwQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDO0lB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