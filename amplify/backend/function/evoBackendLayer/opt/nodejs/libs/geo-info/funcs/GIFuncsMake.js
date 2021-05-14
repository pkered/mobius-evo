"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const matrix_1 = require("../../geom/matrix");
const vectors_1 = require("../../geom/vectors");
const common_1 = require("../common");
const THREE = __importStar(require("three"));
const common_id_funcs_1 = require("../common_id_funcs");
const arrs_1 = require("@assets/libs/util/arrs");
const _list_1 = require("@assets/core/inline/_list");
const distance_1 = require("@libs/geom/distance");
// Enums
var _EClose;
(function (_EClose) {
    _EClose["OPEN"] = "open";
    _EClose["CLOSE"] = "close";
})(_EClose = exports._EClose || (exports._EClose = {}));
var _ELoftMethod;
(function (_ELoftMethod) {
    _ELoftMethod["OPEN_QUADS"] = "open_quads";
    _ELoftMethod["CLOSED_QUADS"] = "closed_quads";
    _ELoftMethod["OPEN_STRINGERS"] = "open_stringers";
    _ELoftMethod["CLOSED_STRINGERS"] = "closed_stringers";
    _ELoftMethod["OPEN_RIBS"] = "open_ribs";
    _ELoftMethod["CLOSED_RIBS"] = "closed_ribs";
    _ELoftMethod["COPIES"] = "copies";
})(_ELoftMethod = exports._ELoftMethod || (exports._ELoftMethod = {}));
var _EExtrudeMethod;
(function (_EExtrudeMethod) {
    _EExtrudeMethod["QUADS"] = "quads";
    _EExtrudeMethod["STRINGERS"] = "stringers";
    _EExtrudeMethod["RIBS"] = "ribs";
    _EExtrudeMethod["COPIES"] = "copies";
})(_EExtrudeMethod = exports._EExtrudeMethod || (exports._EExtrudeMethod = {}));
var _ECutMethod;
(function (_ECutMethod) {
    _ECutMethod["KEEP_ABOVE"] = "keep_above";
    _ECutMethod["KEEP_BELOW"] = "keep_below";
    _ECutMethod["KEEP_BOTH"] = "keep_both";
})(_ECutMethod = exports._ECutMethod || (exports._ECutMethod = {}));
/**
 * Class for editing geometry.
 */
class GIFuncsMake {
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
     * @param coords
     */
    position(coords) {
        const ssid = this.modeldata.active_ssid;
        const depth = arrs_1.getArrDepth(coords);
        if (depth === 1) {
            const coord1 = coords;
            const posi_i = this.modeldata.geom.add.addPosi();
            this.modeldata.attribs.set.setEntAttribVal(common_1.EEntType.POSI, posi_i, common_1.EAttribNames.COORDS, coord1);
            return [common_1.EEntType.POSI, posi_i];
        }
        else if (depth === 2) {
            const coords2 = coords;
            return coords2.map(coord => this.position(coord));
        }
        else {
            const coords3 = coords;
            return coords3.map(coord2 => this.position(coord2));
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     */
    point(ents_arr) {
        const ssid = this.modeldata.active_ssid;
        const depth = arrs_1.getArrDepth(ents_arr);
        if (depth === 1) {
            const [ent_type, index] = ents_arr; // either a posi or something else
            if (ent_type === common_1.EEntType.POSI) {
                const point_i = this.modeldata.geom.add.addPoint(index);
                return [common_1.EEntType.POINT, point_i];
            }
            else {
                const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                return posis_i.map(posi_i => this.point([common_1.EEntType.POSI, posi_i]));
            }
        }
        else if (depth === 2) {
            ents_arr = ents_arr;
            return ents_arr.map(ents_arr_item => this.point(ents_arr_item));
        }
        else { // depth > 2
            ents_arr = ents_arr;
            return ents_arr.map(ents_arr_item => this.point(ents_arr_item));
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param close
     */
    polyline(ents_arr, close) {
        const posis_arr = this._getPlinePosisFromEnts(ents_arr);
        return this._polyline(posis_arr, close);
    }
    _polyline(posis_arr, close) {
        const depth = arrs_1.getArrDepth(posis_arr);
        if (depth === 2) {
            if (posis_arr.length < 2) {
                throw new Error('Error in make.Polyline: Polylines must have at least two positions.');
            }
            const bool_close = (close === _EClose.CLOSE);
            const posis_i = common_id_funcs_1.getEntIdxs(posis_arr);
            const pline_i = this.modeldata.geom.add.addPline(posis_i, bool_close);
            return [common_1.EEntType.PLINE, pline_i];
        }
        else {
            posis_arr = posis_arr;
            return posis_arr.map(ents_arr_item => this._polyline(ents_arr_item, close));
        }
    }
    _getPlinePosisFromEnts(ents_arr) {
        // check if this is a single object ID
        if (arrs_1.getArrDepth(ents_arr) === 1) {
            ents_arr = [ents_arr];
        }
        // check if this is a list of posis, verts, or points
        if (arrs_1.getArrDepth(ents_arr) === 2 && common_id_funcs_1.isDim0(ents_arr[0][0])) {
            const ents_arr2 = [];
            for (const ent_arr of ents_arr) {
                const [ent_type, index] = ent_arr;
                if (ent_type === common_1.EEntType.POSI) {
                    ents_arr2.push(ent_arr);
                }
                else {
                    const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                    for (const posi_i of posis_i) {
                        ents_arr2.push([common_1.EEntType.POSI, posi_i]);
                    }
                }
            }
            ents_arr = [ents_arr2];
        }
        // now process the ents
        const posis_arrs = [];
        for (const ent_arr of ents_arr) {
            if (arrs_1.getArrDepth(ent_arr) === 2) { // this must be a list of posis
                posis_arrs.push(ent_arr);
                continue;
            }
            const [ent_type, index] = ent_arr;
            switch (ent_type) {
                case common_1.EEntType.EDGE:
                case common_1.EEntType.WIRE:
                case common_1.EEntType.PLINE:
                    const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                    const posis_arr = posis_i.map(posi_i => [common_1.EEntType.POSI, posi_i]);
                    posis_arrs.push(posis_arr);
                    break;
                case common_1.EEntType.PGON:
                    const wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, index);
                    for (let j = 0; j < wires_i.length; j++) {
                        const wire_i = wires_i[j];
                        const wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
                        const wire_posis_arr = wire_posis_i.map(posi_i => [common_1.EEntType.POSI, posi_i]);
                        posis_arrs.push(wire_posis_arr);
                    }
                    break;
                default:
                    break;
            }
        }
        return posis_arrs;
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     */
    polygon(ents_arr) {
        const posis_arr = this._getPgonPosisFromEnts(ents_arr);
        return this._polygon(posis_arr);
    }
    _polygon(posis_arr) {
        const depth = arrs_1.getArrDepth(posis_arr);
        if (depth === 2) {
            if (posis_arr.length < 3) {
                throw new Error('Error in make.Polygon: Polygons must have at least three positions.');
            }
            const posis_i = common_id_funcs_1.getEntIdxs(posis_arr);
            const pgon_i = this.modeldata.geom.add.addPgon(posis_i);
            return [common_1.EEntType.PGON, pgon_i];
        }
        else {
            posis_arr = posis_arr;
            return posis_arr.map(ents_arr_item => this._polygon(ents_arr_item));
        }
    }
    _getPgonPosisFromEnts(ents_arr) {
        // check if this is a single object ID
        if (arrs_1.getArrDepth(ents_arr) === 1) {
            ents_arr = [ents_arr];
        }
        // check if this is a list of posis
        if (arrs_1.getArrDepth(ents_arr) === 2 && ents_arr[0][0] === common_1.EEntType.POSI) {
            // ents_arr =  [ents_arr] as TEntTypeIdx[][];
            const ents_arr2 = [];
            for (const ent_arr of ents_arr) {
                const [ent_type, index] = ent_arr;
                if (ent_type === common_1.EEntType.POSI) {
                    ents_arr2.push(ent_arr);
                }
                else {
                    const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                    for (const posi_i of posis_i) {
                        ents_arr2.push([common_1.EEntType.POSI, posi_i]);
                    }
                }
            }
            ents_arr = [ents_arr2];
        }
        // now process the ents
        const posis_arrs = [];
        for (const ent_arr of ents_arr) {
            if (arrs_1.getArrDepth(ent_arr) === 2) { // this must be a list of posis
                posis_arrs.push(ent_arr);
                continue;
            }
            const [ent_type, index] = ent_arr;
            switch (ent_type) {
                case common_1.EEntType.WIRE:
                case common_1.EEntType.PLINE:
                    const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                    const posis_arr = posis_i.map(posi_i => [common_1.EEntType.POSI, posi_i]);
                    posis_arrs.push(posis_arr);
                    break;
                case common_1.EEntType.PGON:
                    const wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, index);
                    for (let j = 0; j < wires_i.length; j++) {
                        const wire_i = wires_i[j];
                        const wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
                        const wire_posis_arr = wire_posis_i.map(posi_i => [common_1.EEntType.POSI, posi_i]);
                        posis_arrs.push(wire_posis_arr);
                    }
                    break;
                default:
                    break;
            }
        }
        return posis_arrs;
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     */
    tin(ents_arr) {
        const depth = arrs_1.getArrDepth(ents_arr);
        if (depth === 2) {
            const posis_i = common_id_funcs_1.getEntIdxs(ents_arr);
            const vtxs_tf = [];
            for (const posi_i of posis_i) {
                const xyz = this.modeldata.attribs.posis.getPosiCoords(posi_i);
                vtxs_tf.push(xyz);
            }
            // const tin = turf.triangulate(vtxs_tf);
            // console.log(tin);
            return null;
        }
        else {
            ents_arr = ents_arr;
            return ents_arr.map(ents_arr_item => this.tin(ents_arr_item));
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arrs
     * @param divisions
     * @param method
     */
    loft(ents_arrs, divisions, method) {
        const depth = arrs_1.getArrDepth(ents_arrs);
        if (depth === 2) {
            const ents_arr = ents_arrs;
            switch (method) {
                case _ELoftMethod.OPEN_QUADS:
                case _ELoftMethod.CLOSED_QUADS:
                    return this._loftQuads(ents_arr, divisions, method);
                case _ELoftMethod.OPEN_STRINGERS:
                case _ELoftMethod.CLOSED_STRINGERS:
                    return this._loftStringers(ents_arr, divisions, method);
                case _ELoftMethod.OPEN_RIBS:
                case _ELoftMethod.CLOSED_RIBS:
                    return this._loftRibs(ents_arr, divisions, method);
                case _ELoftMethod.COPIES:
                    return this._loftCopies(ents_arr, divisions);
                default:
                    break;
            }
        }
        else if (depth === 3) {
            const all_loft_ents = [];
            for (const ents_arr of ents_arrs) {
                const loft_ents = this.loft(ents_arr, divisions, method);
                loft_ents.forEach(loft_ent => all_loft_ents.push(loft_ent));
            }
            return all_loft_ents;
        }
    }
    _loftQuads(ents_arr, divisions, method) {
        const edges_arrs_i = [];
        let num_edges = 0;
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            const edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, index);
            if (edges_arrs_i.length === 0) {
                num_edges = edges_i.length;
            }
            if (edges_i.length !== num_edges) {
                throw new Error('make.Loft: Number of edges is not consistent.');
            }
            edges_arrs_i.push(edges_i);
        }
        if (method === _ELoftMethod.CLOSED_QUADS) {
            edges_arrs_i.push(edges_arrs_i[0]);
        }
        const new_pgons_i = [];
        for (let i = 0; i < edges_arrs_i.length - 1; i++) {
            const edges_i_a = edges_arrs_i[i];
            const edges_i_b = edges_arrs_i[i + 1];
            if (divisions > 0) {
                const strip_posis_map = new Map();
                for (let j = 0; j < num_edges; j++) {
                    const edge_i_a = edges_i_a[j];
                    const edge_i_b = edges_i_b[j];
                    // get exist two posis_i
                    const exist_posis_a_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i_a);
                    const exist_posis_b_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i_b);
                    // create the new posis strip if necessary
                    for (const k of [0, 1]) {
                        if (strip_posis_map.get(exist_posis_a_i[k]) === undefined) {
                            const xyz_a = this.modeldata.attribs.posis.getPosiCoords(exist_posis_a_i[k]);
                            const xyz_b = this.modeldata.attribs.posis.getPosiCoords(exist_posis_b_i[k]);
                            const extrude_vec_div = vectors_1.vecDiv(vectors_1.vecFromTo(xyz_a, xyz_b), divisions);
                            const strip_posis_i = [exist_posis_a_i[k]];
                            for (let d = 1; d < divisions; d++) {
                                const strip_posi_i = this.modeldata.geom.add.addPosi();
                                const move_xyz = vectors_1.vecMult(extrude_vec_div, d);
                                this.modeldata.attribs.posis.setPosiCoords(strip_posi_i, vectors_1.vecAdd(xyz_a, move_xyz));
                                strip_posis_i.push(strip_posi_i);
                            }
                            strip_posis_i.push(exist_posis_b_i[k]);
                            strip_posis_map.set(exist_posis_a_i[k], strip_posis_i);
                        }
                    }
                    // get the two strips and make polygons
                    const strip1_posis_i = strip_posis_map.get(exist_posis_a_i[0]);
                    const strip2_posis_i = strip_posis_map.get(exist_posis_a_i[1]);
                    for (let k = 0; k < strip1_posis_i.length - 1; k++) {
                        const c1 = strip1_posis_i[k];
                        const c2 = strip2_posis_i[k];
                        const c3 = strip2_posis_i[k + 1];
                        const c4 = strip1_posis_i[k + 1];
                        const pgon_i = this.modeldata.geom.add.addPgon([c1, c2, c3, c4]);
                        new_pgons_i.push(pgon_i);
                    }
                }
            }
            else {
                for (let j = 0; j < num_edges; j++) {
                    const posis_i_a = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edges_i_a[j]);
                    const posis_i_b = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edges_i_b[j]);
                    const pgon_i = this.modeldata.geom.add.addPgon([posis_i_a[0], posis_i_a[1], posis_i_b[1], posis_i_b[0]]);
                    new_pgons_i.push(pgon_i);
                }
            }
        }
        return new_pgons_i.map(pgon_i => [common_1.EEntType.PGON, pgon_i]);
    }
    _loftStringers(ents_arr, divisions, method) {
        const posis_arrs_i = [];
        let num_posis = 0;
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
            if (posis_arrs_i.length === 0) {
                num_posis = posis_i.length;
            }
            if (posis_i.length !== num_posis) {
                throw new Error('make.Loft: Number of positions is not consistent.');
            }
            posis_arrs_i.push(posis_i);
        }
        const is_closed = method === _ELoftMethod.CLOSED_STRINGERS;
        if (is_closed) {
            posis_arrs_i.push(posis_arrs_i[0]);
        }
        const stringer_plines_i = [];
        for (let i = 0; i < num_posis; i++) {
            const stringer_posis_i = [];
            for (let j = 0; j < posis_arrs_i.length - 1; j++) {
                stringer_posis_i.push(posis_arrs_i[j][i]);
                if (divisions > 0) {
                    const xyz1 = this.modeldata.attribs.posis.getPosiCoords(posis_arrs_i[j][i]);
                    const xyz2 = this.modeldata.attribs.posis.getPosiCoords(posis_arrs_i[j + 1][i]);
                    const vec = vectors_1.vecDiv(vectors_1.vecFromTo(xyz1, xyz2), divisions);
                    for (let k = 1; k < divisions; k++) {
                        const new_xyz = vectors_1.vecAdd(xyz1, vectors_1.vecMult(vec, k));
                        const new_posi_i = this.modeldata.geom.add.addPosi();
                        this.modeldata.attribs.posis.setPosiCoords(new_posi_i, new_xyz);
                        stringer_posis_i.push(new_posi_i);
                    }
                }
            }
            if (!is_closed) {
                stringer_posis_i.push(posis_arrs_i[posis_arrs_i.length - 1][i]);
            }
            const pline_i = this.modeldata.geom.add.addPline(stringer_posis_i, is_closed);
            stringer_plines_i.push(pline_i);
        }
        return stringer_plines_i.map(pline_i => [common_1.EEntType.PLINE, pline_i]);
    }
    _loftRibs(ents_arr, divisions, method) {
        const posis_arrs_i = [];
        let num_posis = 0;
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
            if (posis_arrs_i.length === 0) {
                num_posis = posis_i.length;
            }
            if (posis_i.length !== num_posis) {
                throw new Error('make.Loft: Number of positions is not consistent.');
            }
            posis_arrs_i.push(posis_i);
        }
        const is_closed = method === _ELoftMethod.CLOSED_RIBS;
        if (is_closed) {
            posis_arrs_i.push(posis_arrs_i[0]);
        }
        let ribs_is_closed = false;
        switch (ents_arr[0][0]) { // check if the first entity is closed
            case common_1.EEntType.PGON:
                ribs_is_closed = true;
                break;
            case common_1.EEntType.PLINE:
                const wire_i = this.modeldata.geom.nav.navPlineToWire(ents_arr[0][1]);
                ribs_is_closed = this.modeldata.geom.query.isWireClosed(wire_i);
                break;
            case common_1.EEntType.WIRE:
                ribs_is_closed = this.modeldata.geom.query.isWireClosed(ents_arr[0][1]);
                break;
            default:
                break;
        }
        const rib_plines_i = [];
        for (let i = 0; i < posis_arrs_i.length - 1; i++) {
            const pline_i = this.modeldata.geom.add.addPline(posis_arrs_i[i], ribs_is_closed);
            rib_plines_i.push(pline_i);
            if (divisions > 0) {
                const xyzs1 = posis_arrs_i[i].map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
                const xyzs2 = posis_arrs_i[i + 1].map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
                const vecs = [];
                for (let k = 0; k < num_posis; k++) {
                    const vec = vectors_1.vecDiv(vectors_1.vecFromTo(xyzs1[k], xyzs2[k]), divisions);
                    vecs.push(vec);
                }
                for (let j = 1; j < divisions; j++) {
                    const rib_posis_i = [];
                    for (let k = 0; k < num_posis; k++) {
                        const new_xyz = vectors_1.vecAdd(xyzs1[k], vectors_1.vecMult(vecs[k], j));
                        const new_posi_i = this.modeldata.geom.add.addPosi();
                        this.modeldata.attribs.posis.setPosiCoords(new_posi_i, new_xyz);
                        rib_posis_i.push(new_posi_i);
                    }
                    const new_rib_pline_i = this.modeldata.geom.add.addPline(rib_posis_i, ribs_is_closed);
                    rib_plines_i.push(new_rib_pline_i);
                }
            }
        }
        if (!is_closed) {
            const pline_i = this.modeldata.geom.add.addPline(posis_arrs_i[posis_arrs_i.length - 1], ribs_is_closed);
            rib_plines_i.push(pline_i);
        }
        return rib_plines_i.map(pline_i => [common_1.EEntType.PLINE, pline_i]);
    }
    _loftCopies(ents_arr, divisions) {
        const posis_arrs_i = [];
        let num_posis = 0;
        for (const ents of ents_arr) {
            const [ent_type, index] = ents;
            const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
            if (posis_arrs_i.length === 0) {
                num_posis = posis_i.length;
            }
            if (posis_i.length !== num_posis) {
                throw new Error('make.Loft: Number of positions is not consistent.');
            }
            posis_arrs_i.push(posis_i);
        }
        const copies = [];
        for (let i = 0; i < posis_arrs_i.length - 1; i++) {
            copies.push(ents_arr[i]);
            if (divisions > 0) {
                const xyzs1 = posis_arrs_i[i].map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
                const xyzs2 = posis_arrs_i[i + 1].map(posi_i => this.modeldata.attribs.posis.getPosiCoords(posi_i));
                const vecs = [];
                for (let k = 0; k < num_posis; k++) {
                    const vec = vectors_1.vecDiv(vectors_1.vecFromTo(xyzs1[k], xyzs2[k]), divisions);
                    vecs.push(vec);
                }
                for (let j = 1; j < divisions; j++) {
                    const lofted_ent_arr = this.modeldata.funcs_common.copyGeom(ents_arr[i], true);
                    this.modeldata.funcs_common.clonePosisInEnts(lofted_ent_arr, true);
                    const [lofted_ent_type, lofted_ent_i] = lofted_ent_arr;
                    const new_posis_i = this.modeldata.geom.nav.navAnyToPosi(lofted_ent_type, lofted_ent_i);
                    for (let k = 0; k < num_posis; k++) {
                        const new_xyz = vectors_1.vecAdd(xyzs1[k], vectors_1.vecMult(vecs[k], j));
                        this.modeldata.attribs.posis.setPosiCoords(new_posis_i[k], new_xyz);
                    }
                    copies.push(lofted_ent_arr);
                }
            }
        }
        copies.push(ents_arr[ents_arr.length - 1]);
        return copies;
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param dist
     * @param divisions
     * @param method
     */
    extrude(ents_arr, dist, divisions, method) {
        // extrude
        if (method === _EExtrudeMethod.COPIES) {
            return this._extrudeCopies(ents_arr, dist, divisions);
        }
        else {
            return this._extrudeEdges(ents_arr, dist, divisions, method);
        }
    }
    _extrudeEdges(ents_arr, dist, divisions, method) {
        const extrude_vec = (Array.isArray(dist) ? dist : [0, 0, dist]);
        if (arrs_1.getArrDepth(ents_arr) === 1) {
            const [ent_type, index] = ents_arr;
            // check if this is a collection, call this function again
            if (ent_type === common_1.EEntType.COLL) {
                return this._extrudeColl(index, extrude_vec, divisions, method);
            }
            // check if this is a position, a vertex, or a point -> pline
            if (common_id_funcs_1.isDim0(ent_type)) {
                return this._extrudeDim0(ent_type, index, extrude_vec, divisions);
            }
            // extrude edges -> polygons
            switch (method) {
                case _EExtrudeMethod.QUADS:
                    return this._extrudeQuads(ent_type, index, extrude_vec, divisions);
                case _EExtrudeMethod.STRINGERS:
                    return this._extrudeStringers(ent_type, index, extrude_vec, divisions);
                case _EExtrudeMethod.RIBS:
                    return this._extrudeRibs(ent_type, index, extrude_vec, divisions);
                default:
                    throw new Error('Extrude method not recognised.');
            }
        }
        else {
            const new_ents_arr = [];
            ents_arr.forEach(ent_arr => {
                const result = this._extrudeEdges(ent_arr, extrude_vec, divisions, method);
                result.forEach(new_ent_arr => new_ents_arr.push(new_ent_arr));
            });
            return new_ents_arr;
        }
    }
    _extrudeCopies(ents, dist, divisions) {
        const ents_arr = (arrs_1.getArrDepth(ents) === 1 ? [ents] : ents);
        const extrude_vec = (Array.isArray(dist) ? dist : [0, 0, dist]);
        const extrude_vec_div = vectors_1.vecDiv(extrude_vec, divisions);
        const copies = [];
        // make the copies
        for (let i = 0; i < divisions + 1; i++) {
            // copy the list of entities
            const copied_ents_arr = this.modeldata.funcs_common.copyGeom(ents_arr, true);
            // copy the positions that belong to the list of entities
            this.modeldata.funcs_common.clonePosisInEntsAndMove(copied_ents_arr, true, vectors_1.vecMult(extrude_vec_div, i));
            // add to the array
            for (const copied_ent_arr of copied_ents_arr) {
                copies.push(copied_ent_arr);
            }
        }
        // return the copies
        return copies;
    }
    _extrudeColl(index, extrude_vec, divisions, method) {
        const points_i = this.modeldata.geom.nav.navCollToPoint(index);
        const res1 = points_i.map(point_i => this._extrudeEdges([common_1.EEntType.POINT, point_i], extrude_vec, divisions, method));
        const plines_i = this.modeldata.geom.nav.navCollToPline(index);
        const res2 = plines_i.map(pline_i => this._extrudeEdges([common_1.EEntType.PLINE, pline_i], extrude_vec, divisions, method));
        const pgons_i = this.modeldata.geom.nav.navCollToPgon(index);
        const res3 = pgons_i.map(pgon_i => this._extrudeEdges([common_1.EEntType.PGON, pgon_i], extrude_vec, divisions, method));
        return [].concat(res1, res2, res3);
    }
    _extrudeDim0(ent_type, index, extrude_vec, divisions) {
        const extrude_vec_div = vectors_1.vecDiv(extrude_vec, divisions);
        const exist_posi_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index)[0];
        const xyz = this.modeldata.attribs.posis.getPosiCoords(exist_posi_i);
        const strip_posis_i = [exist_posi_i];
        for (let i = 1; i < divisions + 1; i++) {
            const strip_posi_i = this.modeldata.geom.add.addPosi();
            const move_xyz = vectors_1.vecMult(extrude_vec_div, i);
            this.modeldata.attribs.posis.setPosiCoords(strip_posi_i, vectors_1.vecAdd(xyz, move_xyz));
            strip_posis_i.push(strip_posi_i);
        }
        // loft between the positions and create a single polyline
        const pline_i = this.modeldata.geom.add.addPline(strip_posis_i);
        return [[common_1.EEntType.PLINE, pline_i]];
    }
    _extrudeQuads(ent_type, index, extrude_vec, divisions) {
        const new_pgons_i = [];
        const extrude_vec_div = vectors_1.vecDiv(extrude_vec, divisions);
        const edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, index);
        const strip_posis_map = new Map();
        for (const edge_i of edges_i) {
            // get exist posis_i
            const exist_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            // create the new posis strip if necessary
            for (const exist_posi_i of exist_posis_i) {
                if (strip_posis_map.get(exist_posi_i) === undefined) {
                    const xyz = this.modeldata.attribs.posis.getPosiCoords(exist_posi_i);
                    const strip_posis_i = [exist_posi_i];
                    for (let i = 1; i < divisions + 1; i++) {
                        const strip_posi_i = this.modeldata.geom.add.addPosi();
                        const move_xyz = vectors_1.vecMult(extrude_vec_div, i);
                        this.modeldata.attribs.posis.setPosiCoords(strip_posi_i, vectors_1.vecAdd(xyz, move_xyz));
                        strip_posis_i.push(strip_posi_i);
                    }
                    strip_posis_map.set(exist_posi_i, strip_posis_i);
                }
            }
            // get the two strips and make polygons
            const strip1_posis_i = strip_posis_map.get(exist_posis_i[0]);
            const strip2_posis_i = strip_posis_map.get(exist_posis_i[1]);
            for (let i = 0; i < strip1_posis_i.length - 1; i++) {
                const c1 = strip1_posis_i[i];
                const c2 = strip2_posis_i[i];
                const c3 = strip2_posis_i[i + 1];
                const c4 = strip1_posis_i[i + 1];
                const pgon_i = this.modeldata.geom.add.addPgon([c1, c2, c3, c4]);
                new_pgons_i.push(pgon_i);
            }
        }
        // cap the top
        if (common_id_funcs_1.isDim2(ent_type)) { // create a top -> polygon
            const cap_pgon_i = this._extrudeCap(index, strip_posis_map, divisions);
            new_pgons_i.push(cap_pgon_i);
        }
        return new_pgons_i.map(pgon_i => [common_1.EEntType.PGON, pgon_i]);
    }
    _extrudeStringers(ent_type, index, extrude_vec, divisions) {
        const new_plines_i = [];
        const extrude_vec_div = vectors_1.vecDiv(extrude_vec, divisions);
        const edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, index);
        const strip_posis_map = new Map();
        for (const edge_i of edges_i) {
            // get exist posis_i
            const exist_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            // create the new posis strip if necessary
            for (const exist_posi_i of exist_posis_i) {
                if (strip_posis_map.get(exist_posi_i) === undefined) {
                    const xyz = this.modeldata.attribs.posis.getPosiCoords(exist_posi_i);
                    const strip_posis_i = [exist_posi_i];
                    for (let i = 1; i < divisions + 1; i++) {
                        const strip_posi_i = this.modeldata.geom.add.addPosi();
                        const move_xyz = vectors_1.vecMult(extrude_vec_div, i);
                        this.modeldata.attribs.posis.setPosiCoords(strip_posi_i, vectors_1.vecAdd(xyz, move_xyz));
                        strip_posis_i.push(strip_posi_i);
                    }
                    strip_posis_map.set(exist_posi_i, strip_posis_i);
                }
            }
        }
        // make the stringers
        strip_posis_map.forEach(strip_posis_i => {
            const pline_i = this.modeldata.geom.add.addPline(strip_posis_i);
            new_plines_i.push(pline_i);
        });
        // return the stringers
        return new_plines_i.map(pline_i => [common_1.EEntType.PLINE, pline_i]);
    }
    _extrudeRibs(ent_type, index, extrude_vec, divisions) {
        const new_plines_i = [];
        const extrude_vec_div = vectors_1.vecDiv(extrude_vec, divisions);
        const edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, index);
        const strip_posis_map = new Map();
        for (const edge_i of edges_i) {
            // get exist posis_i
            const exist_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            // create the new posis strip if necessary
            for (const exist_posi_i of exist_posis_i) {
                if (strip_posis_map.get(exist_posi_i) === undefined) {
                    const xyz = this.modeldata.attribs.posis.getPosiCoords(exist_posi_i);
                    const strip_posis_i = [exist_posi_i];
                    for (let i = 1; i < divisions + 1; i++) {
                        const strip_posi_i = this.modeldata.geom.add.addPosi();
                        const move_xyz = vectors_1.vecMult(extrude_vec_div, i);
                        this.modeldata.attribs.posis.setPosiCoords(strip_posi_i, vectors_1.vecAdd(xyz, move_xyz));
                        strip_posis_i.push(strip_posi_i);
                    }
                    strip_posis_map.set(exist_posi_i, strip_posis_i);
                }
            }
        }
        // make an array of ents to process as ribs
        let ribs_is_closed = false;
        const ribs_posis_i = [];
        switch (ent_type) { // check if the entity is closed
            case common_1.EEntType.PGON:
                ribs_is_closed = true;
                const face_wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, index);
                for (const face_wire_i of face_wires_i) {
                    const face_wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, face_wire_i);
                    ribs_posis_i.push(face_wire_posis_i);
                }
                break;
            case common_1.EEntType.PLINE:
                const pline_wire_i = this.modeldata.geom.nav.navPlineToWire(index);
                const pline_wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, pline_wire_i);
                ribs_posis_i.push(pline_wire_posis_i);
                ribs_is_closed = this.modeldata.geom.query.isWireClosed(pline_wire_i);
                break;
            case common_1.EEntType.WIRE:
                const wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, index);
                ribs_posis_i.push(wire_posis_i);
                ribs_is_closed = this.modeldata.geom.query.isWireClosed(index);
                break;
            default:
                const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, index);
                ribs_posis_i.push(posis_i);
                break;
        }
        // make the ribs
        for (let i = 0; i < divisions + 1; i++) {
            for (const rib_posis_i of ribs_posis_i) {
                const mapped_rib_posis_i = rib_posis_i.map(rib_posi_i => strip_posis_map.get(rib_posi_i)[i]);
                const pline_i = this.modeldata.geom.add.addPline(mapped_rib_posis_i, ribs_is_closed);
                new_plines_i.push(pline_i);
            }
        }
        // return the ribs
        return new_plines_i.map(pline_i => [common_1.EEntType.PLINE, pline_i]);
    }
    _extrudeCap(pgon_i, strip_posis_map, divisions) {
        // get positions on boundary
        const old_wire_i = this.modeldata.geom.query.getPgonBoundary(pgon_i);
        const old_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, old_wire_i);
        const new_posis_i = old_posis_i.map(old_posi_i => strip_posis_map.get(old_posi_i)[divisions]);
        // get positions for holes
        const old_holes_wires_i = this.modeldata.geom.query.getPgonHoles(pgon_i);
        const new_holes_posis_i = [];
        for (const old_hole_wire_i of old_holes_wires_i) {
            const old_hole_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, old_hole_wire_i);
            const new_hole_posis_i = old_hole_posis_i.map(old_posi_i => strip_posis_map.get(old_posi_i)[divisions]);
            new_holes_posis_i.push(new_hole_posis_i);
        }
        // make new polygon
        const new_pgon_i = this.modeldata.geom.add.addPgon(new_posis_i, new_holes_posis_i);
        return new_pgon_i;
    }
    // ================================================================================================
    /**
     *
     * @param backbone_ents
     * @param xsection_ent
     * @param divisions
     * @param method
     */
    sweep(backbone_ents, xsection_ent, divisions, method) {
        // the xsection
        const [xsection_ent_type, xsection_index] = xsection_ent;
        let xsection_wire_i = null;
        if (xsection_ent_type === common_1.EEntType.WIRE) {
            xsection_wire_i = xsection_index;
        }
        else {
            const xsection_wires_i = this.modeldata.geom.nav.navAnyToWire(xsection_ent_type, xsection_index);
            xsection_wire_i = xsection_wires_i[0]; // select the first wire that is found
        }
        // get all the wires and put them into an array
        const backbone_wires_i = [];
        for (const [ent_type, index] of backbone_ents) {
            if (ent_type === common_1.EEntType.WIRE) {
                backbone_wires_i.push(index);
            }
            else {
                const ent_wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, index);
                backbone_wires_i.push(...ent_wires_i);
            }
        }
        return this._sweep(backbone_wires_i, xsection_wire_i, divisions, method);
    }
    _sweep(backbone_wires_i, xsection_wire_i, divisions, method) {
        if (!Array.isArray(backbone_wires_i)) {
            // extrude edges -> polygons
            switch (method) {
                case _EExtrudeMethod.QUADS:
                    return this._sweepQuads(backbone_wires_i, xsection_wire_i, divisions);
                case _EExtrudeMethod.STRINGERS:
                    return this._sweepStringers(backbone_wires_i, xsection_wire_i, divisions);
                case _EExtrudeMethod.RIBS:
                    return this._sweepRibs(backbone_wires_i, xsection_wire_i, divisions);
                case _EExtrudeMethod.COPIES:
                    return this._sweepCopies(backbone_wires_i, xsection_wire_i, divisions);
                default:
                    throw new Error('Extrude method not recognised.');
            }
        }
        else {
            const new_ents = [];
            for (const wire_i of backbone_wires_i) {
                const wire_new_ents = this._sweep(wire_i, xsection_wire_i, divisions, method);
                for (const wire_new_ent of wire_new_ents) {
                    new_ents.push(wire_new_ent);
                }
            }
            return new_ents;
        }
    }
    _sweepQuads(backbone_wire_i, xsection_wire_i, divisions) {
        const strips_posis_i = this._sweepPosis(backbone_wire_i, xsection_wire_i, divisions);
        const backbone_is_closed = this.modeldata.geom.query.isWireClosed(backbone_wire_i);
        const xsection_is_closed = this.modeldata.geom.query.isWireClosed(xsection_wire_i);
        // add row if backbone_is_closed
        if (backbone_is_closed) {
            strips_posis_i.push(strips_posis_i[0].slice());
        }
        // add a posi_i to end of each strip if xsection_is_closed
        if (xsection_is_closed) {
            for (const strip_posis_i of strips_posis_i) {
                strip_posis_i.push(strip_posis_i[0]);
            }
        }
        // create quads
        const new_pgons = [];
        for (let i = 0; i < strips_posis_i.length - 1; i++) {
            const strip1_posis_i = strips_posis_i[i];
            const strip2_posis_i = strips_posis_i[i + 1];
            for (let j = 0; j < strip1_posis_i.length - 1; j++) {
                const c1 = strip1_posis_i[j];
                const c2 = strip2_posis_i[j];
                const c3 = strip2_posis_i[j + 1];
                const c4 = strip1_posis_i[j + 1];
                const pgon_i = this.modeldata.geom.add.addPgon([c1, c2, c3, c4]);
                new_pgons.push([common_1.EEntType.PGON, pgon_i]);
            }
        }
        return new_pgons;
    }
    _sweepStringers(backbone_wire_i, xsection_wire_i, divisions) {
        const backbone_is_closed = this.modeldata.geom.query.isWireClosed(backbone_wire_i);
        const ribs_posis_i = this._sweepPosis(backbone_wire_i, xsection_wire_i, divisions);
        const stringers_posis_i = _list_1.listZip(false, ribs_posis_i);
        const plines = [];
        for (const stringer_posis_i of stringers_posis_i) {
            const pline_i = this.modeldata.geom.add.addPline(stringer_posis_i, backbone_is_closed);
            plines.push([common_1.EEntType.PLINE, pline_i]);
        }
        return plines;
    }
    _sweepRibs(backbone_wire_i, xsection_wire_i, divisions) {
        const xsection_is_closed = this.modeldata.geom.query.isWireClosed(xsection_wire_i);
        const ribs_posis_i = this._sweepPosis(backbone_wire_i, xsection_wire_i, divisions);
        const plines = [];
        for (const rib_posis_i of ribs_posis_i) {
            const pline_i = this.modeldata.geom.add.addPline(rib_posis_i, xsection_is_closed);
            plines.push([common_1.EEntType.PLINE, pline_i]);
        }
        return plines;
    }
    _sweepCopies(backbone_wire_i, xsection_wire_i, divisions) {
        const posis_i = this._sweepPosis(backbone_wire_i, xsection_wire_i, divisions);
        // TODO
        throw new Error('Not implemented');
        // TODO
    }
    _sweepPosis(backbone_wire_i, xsection_wire_i, divisions) {
        // get the xyzs of the cross section
        const xsextion_xyzs = this.modeldata.attribs.posis.getEntCoords(common_1.EEntType.WIRE, xsection_wire_i);
        // get the xyzs of the backbone
        const wire_normal = this.modeldata.geom.query.getWireNormal(backbone_wire_i);
        const wire_is_closed = this.modeldata.geom.query.isWireClosed(backbone_wire_i);
        const wire_xyzs = this.modeldata.attribs.posis.getEntCoords(common_1.EEntType.WIRE, backbone_wire_i);
        let plane_xyzs = [];
        // if not divisions is not 1, then we need to add xyzs
        if (divisions === 1) {
            plane_xyzs = wire_xyzs;
        }
        else {
            if (wire_is_closed) {
                wire_xyzs.push(wire_xyzs[0]);
            }
            for (let i = 0; i < wire_xyzs.length - 1; i++) {
                const xyz0 = wire_xyzs[i];
                const xyz1 = wire_xyzs[i + 1];
                const vec = vectors_1.vecFromTo(xyz0, xyz1);
                const vec_div = vectors_1.vecDiv(vec, divisions);
                // create additional xyzs for planes
                plane_xyzs.push(xyz0);
                for (let j = 1; j < divisions; j++) {
                    plane_xyzs.push(vectors_1.vecAdd(xyz0, vectors_1.vecMult(vec_div, j)));
                }
            }
            if (!wire_is_closed) {
                plane_xyzs.push(wire_xyzs[wire_xyzs.length - 1]);
            }
        }
        // create the planes
        const planes = this.modeldata.funcs_common.getPlanesSeq(plane_xyzs, wire_normal, wire_is_closed);
        // create the new  posis
        const XY = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
        const all_new_posis_i = [];
        for (const plane of planes) {
            const matrix = matrix_1.xfromSourceTargetMatrix(XY, plane);
            const xsection_posis_i = [];
            for (const xsextion_xyz of xsextion_xyzs) {
                const new_xyz = matrix_1.multMatrix(xsextion_xyz, matrix);
                const posi_i = this.modeldata.geom.add.addPosi();
                this.modeldata.attribs.posis.setPosiCoords(posi_i, new_xyz);
                xsection_posis_i.push(posi_i);
            }
            all_new_posis_i.push(xsection_posis_i);
        }
        // return the new posis
        return all_new_posis_i;
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param plane
     * @param method
     */
    cut(ents_arr, plane, method) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, false) as TEntTypeIdx[];
        // create the threejs entity and calc intersections
        const plane_normal = vectors_1.vecCross(plane[1], plane[2]);
        const plane_tjs = new THREE.Plane();
        plane_tjs.setFromNormalAndCoplanarPoint(new THREE.Vector3(...plane_normal), new THREE.Vector3(...plane[0]));
        // get polylines and polygons
        const set_plines = new Set();
        const set_pgons = new Set();
        const edges_i = []; // all edges
        for (const [ent_type, ent_i] of ents_arr) {
            if (ent_type === common_1.EEntType.PLINE) {
                set_plines.add(ent_i);
            }
            else if (ent_type === common_1.EEntType.PGON) {
                set_pgons.add(ent_i);
            }
            else {
                const plines = this.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
                for (const pline of plines) {
                    set_plines.add(pline);
                }
                const pgons = this.modeldata.geom.nav.navAnyToPline(ent_type, ent_i);
                for (const pgon of pgons) {
                    set_pgons.add(pgon);
                }
            }
            const ent_edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i);
            for (const ent_edge_i of ent_edges_i) {
                edges_i.push(ent_edge_i);
            }
        }
        const above = [];
        const below = [];
        // cut each edge and store the results
        // const [edge_to_isect_posis, cut_posi_to_copies, posi_to_tjs]: [number[][], number[], THREE.Vector3[]] =
        //     this._cutEdges(edges_i, plane_tjs, method);
        const [edge_to_isect_posis, cut_posi_to_copies, posi_to_tjs] = this._cutEdges(edges_i, plane_tjs, method);
        // create array to store new posis
        const posi_to_copies = [];
        // slice polylines
        for (const exist_pline_i of Array.from(set_plines)) {
            const sliced = this._cutCreateEnts(common_1.EEntType.PLINE, exist_pline_i, edge_to_isect_posis, posi_to_copies, cut_posi_to_copies, posi_to_tjs, method);
            for (const new_pline_i of sliced[0]) {
                above.push([common_1.EEntType.PLINE, new_pline_i]);
            }
            for (const new_pline_i of sliced[1]) {
                below.push([common_1.EEntType.PLINE, new_pline_i]);
            }
        }
        // slice polygons
        for (const exist_pgon_i of Array.from(set_pgons)) {
            // TODO slice polygons with holes
            const sliced = this._cutCreateEnts(common_1.EEntType.PGON, exist_pgon_i, edge_to_isect_posis, posi_to_copies, cut_posi_to_copies, posi_to_tjs, method);
            for (const new_pgon_i of sliced[0]) {
                above.push([common_1.EEntType.PGON, new_pgon_i]);
            }
            for (const new_pgon_i of sliced[1]) {
                below.push([common_1.EEntType.PGON, new_pgon_i]);
            }
        }
        // return
        return [above, below];
    }
    //-------------------
    // cut each edge in the input geometry (can be edges from different objects)
    // store the intersection posi in a sparse array
    // the array is nested, the two indexes [i1][i2] is the two posi ends of the edge, the value is the isect posi
    // also returns some other data
    // if method is "both", then we need copies of the isect posis, so these are also generated
    // finally, the tjs points that are created are also returned, they are used later for checking "starts_above"
    _cutEdges(edges_i, plane_tjs, method) {
        // create sparse arrays for storing data
        const smap_posi_to_tjs = []; // sparse array
        const smap_edge_to_isect_posis = []; // sparse array, map_posis[2][3] is the edge from posi 2 to posi 3 (and 3 to 2)
        const smap_cut_posi_to_copies = []; // sparse array
        // loop through each edge
        for (const edge_i of edges_i) {
            // console.log("=============== Edge = ", edge_i);
            const edge_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
            if (edge_posis_i.length !== 2) {
                continue;
            }
            const sorted_edge_posis_i = Array.from(edge_posis_i);
            sorted_edge_posis_i.sort();
            // get the edge isect point
            if (smap_edge_to_isect_posis[sorted_edge_posis_i[0]] === undefined) {
                smap_edge_to_isect_posis[sorted_edge_posis_i[0]] = [];
            }
            const posi_i = smap_edge_to_isect_posis[sorted_edge_posis_i[0]][sorted_edge_posis_i[1]];
            if (posi_i === undefined) {
                // cut the intersection, create a new posi or null
                const new_posi_i = this._cutCreatePosi(edge_i, edge_posis_i, plane_tjs, smap_posi_to_tjs);
                // store the posi or null in the sparse array
                smap_edge_to_isect_posis[sorted_edge_posis_i[0]][sorted_edge_posis_i[1]] = new_posi_i;
                if (new_posi_i !== null) {
                    // if keep both sides, make a copy of the posi
                    if (method === _ECutMethod.KEEP_BOTH) {
                        const copy_posi_i = this.modeldata.geom.add.copyPosis(new_posi_i, true);
                        smap_cut_posi_to_copies[new_posi_i] = copy_posi_i;
                    }
                }
            }
        }
        return [smap_edge_to_isect_posis, smap_cut_posi_to_copies, smap_posi_to_tjs];
    }
    // create the new posi
    _cutCreatePosi(edge_i, edge_posis_i, plane_tjs, smap_posi_to_tjs) {
        // get the tjs posis and distances for the start and end posis of this edge
        // start posi
        const [posi0_tjs, d0] = this._cutGetTjsDistToPlane(edge_posis_i[0], plane_tjs, smap_posi_to_tjs);
        // end posi
        const [posi1_tjs, d1] = this._cutGetTjsDistToPlane(edge_posis_i[1], plane_tjs, smap_posi_to_tjs);
        // console.log("Cutting edge: edge_i, d0, d1", edge_i, d0, d1)
        // if both posis are on the same side of the plane, then no intersection, so return null
        if ((d0 > 0) && (d1 > 0)) {
            // console.log('Cutting edge: edge vertices are above the plane, so no isect')
            return null;
        }
        if ((d0 < 0) && (d1 < 0)) {
            // console.log('Cutting edge: edge vertices are both below the plane, so no isect')
            return null;
        }
        // check if this is a zero length edge
        // console.log("length of edge = ", posi0_tjs.distanceTo(posi1_tjs))
        if (posi0_tjs.distanceTo(posi1_tjs) === 0) {
            // console.log('Cutting edge: edge is zero length, so no isect')
            return null;
        }
        // if either position is very close to the plane, check of V intersection
        // a V intersection is where the plane touches a vertex where two edges meet in a V shape
        // and where both edges are on the same side of the plane
        if ((Math.abs(d0) === 0) && this._cutStartVertexIsV(edge_i, plane_tjs, d1, smap_posi_to_tjs)) {
            // console.log('Cutting edge: first vertex is V, so no isect');
            return null;
        }
        if ((Math.abs(d1) === 0) && this._cutEndVertexIsV(edge_i, plane_tjs, d0, smap_posi_to_tjs)) {
            // console.log('Cutting edge: second vertex is V, so no isect');
            return null;
        }
        // check if cutting exactly through the end vertext
        // in that case, the intersection is the end vertex
        // this is true even is teh edge is coplanar
        if (d1 === 0) {
            // console.log('Cutting edge: second vertex is on plane, so return second posi')
            const copy_posi_i = this.modeldata.geom.add.addPosi();
            this.modeldata.attribs.posis.setPosiCoords(copy_posi_i, [posi1_tjs.x, posi1_tjs.y, posi1_tjs.z]);
            return copy_posi_i;
            // return this.modeldata.geom.nav.navAnyToPosi(EEntType.EDGE, edge_i)[1];
        }
        // check if cutting exactly through the start vertext
        // in that case we ignore it since we assume the cut has already been created by the end vertext of the previous edge
        // this also include the case where the edge is coplanar
        if (d0 === 0) {
            // console.log('Cutting edge: first vertex is on plane, so no isect')
            return null;
        }
        // calculate intersection
        const line_tjs = new THREE.Line3(posi0_tjs, posi1_tjs);
        const isect_tjs = new THREE.Vector3();
        // https://threejs.org/docs/#api/en/math/Plane
        // Returns the intersection point of the passed line and the plane.
        // Returns undefined if the line does not intersect.
        // Returns the line's starting point if the line is coplanar with the plane.
        const result = plane_tjs.intersectLine(line_tjs, isect_tjs);
        if (result === undefined || result === null) {
            // console.log('Cutting edge: no isect was found with edge...');
            return null;
        }
        // create the new posi at the point of intersection
        // console.log("Cutting edge: New isect_tjs", isect_tjs)
        const new_posi_i = this.modeldata.geom.add.addPosi();
        this.modeldata.attribs.posis.setPosiCoords(new_posi_i, [isect_tjs.x, isect_tjs.y, isect_tjs.z]);
        // store the posi in the sparse array
        return new_posi_i;
    }
    // check V at start vertex
    _cutStartVertexIsV(edge_i, plane_tjs, d1, smap_posi_to_tjs) {
        // ---
        // isect is at start of line
        const prev_edge_i = this.modeldata.geom.query.getPrevEdge(edge_i);
        // if there is no prev edge, then this is open pline, so it is single edge V
        if (prev_edge_i === null) {
            return true;
        }
        // check other edge
        const prev_edge_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, prev_edge_i);
        const [_, prev_d] = this._cutGetTjsDistToPlane(prev_edge_posis_i[0], plane_tjs, smap_posi_to_tjs);
        // are both points on same side of plane? must be V
        if ((prev_d > 0) && (d1 > 0)) {
            return true;
        }
        if ((prev_d < 0) && (d1 < 0)) {
            return true;
        }
        // this is not a V, so return false
        return false;
    }
    // check V at end vertex
    _cutEndVertexIsV(edge_i, plane_tjs, d0, smap_posi_to_tjs) {
        // ---
        // isect is at end of line
        const next_edge_i = this.modeldata.geom.query.getNextEdge(edge_i);
        // if there is no next edge, then this is open pline, so it is single edge V
        if (next_edge_i === null) {
            return true;
        }
        // check other edge
        const next_edge_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, next_edge_i);
        const [_, next_d] = this._cutGetTjsDistToPlane(next_edge_posis_i[1], plane_tjs, smap_posi_to_tjs);
        // are both points on same side of plane? must be V
        if ((d0 > 0) && (next_d > 0)) {
            return true;
        }
        if ((d0 < 0) && (next_d < 0)) {
            return true;
        }
        // this is not a V, so return false
        return false;
    }
    // given an exist posis and a tjs plane
    // create a tjs posi and
    // calc the distance to the tjs plane
    // creates a map from exist posi to tjs posi(sparse array)
    // and creates a map from exist posi to dist (sparse array)
    _cutGetTjsDistToPlane(posi_i, plane_tjs, map_posi_to_tjs) {
        // check if we have already calculated this one
        if (map_posi_to_tjs[posi_i] !== undefined) {
            return map_posi_to_tjs[posi_i];
        }
        // create tjs posi
        const xyz = this.modeldata.attribs.posis.getPosiCoords(posi_i);
        const posi_tjs = new THREE.Vector3(...xyz);
        // calc distance to tjs plane
        const dist = plane_tjs.distanceToPoint(posi_tjs);
        // save the data
        map_posi_to_tjs[posi_i] = [posi_tjs, dist];
        // return the new tjs posi and the distance to the plane
        return [posi_tjs, dist];
    }
    // given an exist posis, returns a new posi
    // if necessary, a new posi point be created
    // creates a map from exist posi to new posi (sparse array)
    _cutGetPosi(posi_i, map_posi_to_copies) {
        if (map_posi_to_copies[posi_i] !== undefined) {
            return map_posi_to_copies[posi_i];
        }
        const new_posi_i = this.modeldata.geom.add.copyPosis(posi_i, true);
        map_posi_to_copies[posi_i] = new_posi_i;
        return new_posi_i;
    }
    // given a list of exist posis, returns a list of new posi
    // if necessary, new posi will be created
    _cutGetPosis(posis_i, posi_to_copies) {
        return posis_i.map(posi_i => this._cutGetPosi(posi_i, posi_to_copies));
    }
    // makes a copy of an existing ent
    // all posis in the exist ent will be replaced by new posis
    _cutCopyEnt(ent_type, ent_i, exist_posis_i, posi_to_copies) {
        const new_posis_i = this._cutGetPosis(exist_posis_i, posi_to_copies);
        switch (ent_type) {
            case common_1.EEntType.PLINE:
                const new_pline_i = this.modeldata.geom.add.copyPlines(ent_i, true);
                this.modeldata.geom.edit_topo.replacePosis(ent_type, new_pline_i, new_posis_i);
                return new_pline_i;
            case common_1.EEntType.PGON:
                const new_pgon_i = this.modeldata.geom.add.copyPgons(ent_i, true);
                this.modeldata.geom.edit_topo.replacePosis(ent_type, new_pgon_i, new_posis_i);
                return new_pgon_i;
            default:
                break;
        }
    }
    // creates new ents
    // if the ent is not cut by the plane, the ent will be copies (with new posis)
    // if the ent is cut, a new ent will be created
    _cutCreateEnts(ent_type, ent_i, edge_to_isect_posis, posi_to_copies, cut_posi_to_copies, posi_to_tjs, method) {
        // get wire and posis
        const wire_i = this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i)[0];
        const wire_posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
        const wire_posis_ex_i = wire_posis_i.slice();
        const is_closed = this.modeldata.geom.query.isWireClosed(wire_i);
        if (is_closed) {
            wire_posis_ex_i.push(wire_posis_ex_i[0]);
        }
        const num_posis = wire_posis_ex_i.length;
        // create lists to store posis
        const slice_posis_i = [[], []];
        // analyze the first point
        const dist = posi_to_tjs[wire_posis_ex_i[0]][1];
        const start_above = dist > 0; // is the first point above the plane?
        const first = start_above ? 0 : 1; // the first list to start adding posis
        const second = 1 - first; // the second list to add posis, after you cross the plane
        let index = first;
        // for each pair of posis, get the posi_i intersection or null
        slice_posis_i[index].push([]);
        let num_cuts = 0;
        for (let i = 0; i < num_posis - 1; i++) {
            const edge_posis_i = [wire_posis_ex_i[i], wire_posis_ex_i[i + 1]];
            // find isect or null
            edge_posis_i.sort();
            const isect_posi_i = edge_to_isect_posis[edge_posis_i[0]][edge_posis_i[1]];
            slice_posis_i[index][slice_posis_i[index].length - 1].push(wire_posis_ex_i[i]);
            if (isect_posi_i !== null) {
                num_cuts += 1;
                // add posi before cut
                if (method === _ECutMethod.KEEP_BOTH && index === 0) {
                    const isect_posi2_i = cut_posi_to_copies[isect_posi_i];
                    slice_posis_i[index][slice_posis_i[index].length - 1].push(isect_posi2_i);
                    posi_to_copies[isect_posi2_i] = isect_posi2_i;
                }
                else {
                    slice_posis_i[index][slice_posis_i[index].length - 1].push(isect_posi_i);
                    posi_to_copies[isect_posi_i] = isect_posi_i;
                }
                // switch
                index = 1 - index;
                slice_posis_i[index].push([]);
                // add posi after cut
                if (method === _ECutMethod.KEEP_BOTH && index === 0) {
                    const isect_posi2_i = cut_posi_to_copies[isect_posi_i];
                    slice_posis_i[index][slice_posis_i[index].length - 1].push(isect_posi2_i);
                    posi_to_copies[isect_posi2_i] = isect_posi2_i;
                }
                else {
                    slice_posis_i[index][slice_posis_i[index].length - 1].push(isect_posi_i);
                    posi_to_copies[isect_posi_i] = isect_posi_i;
                }
            }
        }
        if (ent_type === common_1.EEntType.PGON && num_cuts % 2 !== 0) {
            throw new Error('Internal error cutting polygon: number of cuts in uneven');
        }
        // deal with cases where the entity was not cut
        // make a copy of the ent, with new posis
        if (slice_posis_i[second].length === 0) {
            if (start_above && (method === _ECutMethod.KEEP_BOTH || method === _ECutMethod.KEEP_ABOVE)) {
                return [[this._cutCopyEnt(ent_type, ent_i, wire_posis_i, posi_to_copies)], []];
            }
            else if (!start_above && (method === _ECutMethod.KEEP_BOTH || method === _ECutMethod.KEEP_BELOW)) {
                return [[], [this._cutCopyEnt(ent_type, ent_i, wire_posis_i, posi_to_copies)]];
            }
            return [[], []];
        }
        // update the lists, to deal with the end cases
        if (ent_type === common_1.EEntType.PGON) {
            // add the last list of posis to the the first list of posis
            for (const slice_posi_i of slice_posis_i[index][slice_posis_i[index].length - 1]) {
                slice_posis_i[index][0].push(slice_posi_i);
            }
            slice_posis_i[index] = slice_posis_i[index].slice(0, -1);
        }
        else {
            // add the last posi to the last list
            slice_posis_i[index][slice_posis_i[index].length - 1].push(wire_posis_ex_i[num_posis - 1]);
        }
        // make the cut entities
        const above = [];
        const below = [];
        switch (method) {
            case _ECutMethod.KEEP_BOTH:
            case _ECutMethod.KEEP_ABOVE:
                for (const posis_i of slice_posis_i[0]) {
                    const new_ent_i = this._cutCreateEnt(ent_type, posis_i, posi_to_copies);
                    if (new_ent_i !== null) {
                        above.push(new_ent_i);
                    }
                    // const filt_posis_i: number[] = this._cutFilterShortEdges(posis_i, posi_to_tjs);
                    // if (ent_type === EEntType.PLINE) {
                    //     const copy_posis_i: number[] = this._cutGetPosis(filt_posis_i, posi_to_copies);
                    //     above.push( this.modeldata.geom.add.addPline(copy_posis_i, false));
                    // } else {
                    //     const copy_posis_i: number[] = this._cutGetPosis(filt_posis_i, posi_to_copies);
                    //     above.push( this.modeldata.geom.add.addPgon(copy_posis_i));
                    // }
                }
                break;
            default:
                break;
        }
        switch (method) {
            case _ECutMethod.KEEP_BOTH:
            case _ECutMethod.KEEP_BELOW:
                for (const posis_i of slice_posis_i[1]) {
                    const new_ent_i = this._cutCreateEnt(ent_type, posis_i, posi_to_copies);
                    if (new_ent_i !== null) {
                        below.push(new_ent_i);
                    }
                    // const filt_posis_i: number[] = this._cutFilterShortEdges(posis_i, posi_to_tjs);
                    // if (ent_type === EEntType.PLINE) {
                    //     const copy_posis_i: number[] = this._cutGetPosis(filt_posis_i, posi_to_copies);
                    //     below.push( this.modeldata.geom.add.addPline(copy_posis_i, false));
                    // } else {
                    //     const copy_posis_i: number[] = this._cutGetPosis(filt_posis_i, posi_to_copies);
                    //     below.push( this.modeldata.geom.add.addPgon(copy_posis_i));
                    // }
                }
                break;
            default:
                break;
        }
        return [above, below];
    }
    // filter very short edges
    _cutFilterShortEdges(posis_i) {
        const new_posis_i = [posis_i[0]];
        let xyz0 = this.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
        for (let i = 1; i < posis_i.length; i++) {
            const xyz1 = this.modeldata.attribs.posis.getPosiCoords(posis_i[i]);
            if (distance_1.distance(xyz0, xyz1) > 1e-6) {
                new_posis_i.push(posis_i[i]);
            }
            xyz0 = xyz1;
        }
        return new_posis_i;
    }
    // creates new ents
    _cutCreateEnt(ent_type, posis_i, posi_to_copies) {
        // filter shrt edges
        const filt_posis_i = this._cutFilterShortEdges(posis_i);
        if (ent_type === common_1.EEntType.PLINE) {
            // create polyline
            if (filt_posis_i.length < 2) {
                return null;
            }
            const copy_posis_i = this._cutGetPosis(filt_posis_i, posi_to_copies);
            return this.modeldata.geom.add.addPline(copy_posis_i, false);
        }
        else {
            // create polygon
            if (filt_posis_i.length < 3) {
                return null;
            }
            const copy_posis_i = this._cutGetPosis(filt_posis_i, posi_to_copies);
            return this.modeldata.geom.add.addPgon(copy_posis_i);
        }
    }
}
exports.GIFuncsMake = GIFuncsMake;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lGdW5jc01ha2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2xpYnMvZ2VvLWluZm8vZnVuY3MvR0lGdW5jc01ha2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsOENBQXdFO0FBQ3hFLGdEQUFrRjtBQUNsRixzQ0FBOEU7QUFDOUUsNkNBQStCO0FBQy9CLHdEQUFnRTtBQUNoRSxpREFBcUQ7QUFFckQscURBQW9EO0FBQ3BELGtEQUErQztBQUUvQyxRQUFRO0FBQ1IsSUFBWSxPQUdYO0FBSEQsV0FBWSxPQUFPO0lBQ2Ysd0JBQWEsQ0FBQTtJQUNiLDBCQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUhXLE9BQU8sR0FBUCxlQUFPLEtBQVAsZUFBTyxRQUdsQjtBQUNELElBQVksWUFRWDtBQVJELFdBQVksWUFBWTtJQUNwQix5Q0FBMEIsQ0FBQTtJQUMxQiw2Q0FBK0IsQ0FBQTtJQUMvQixpREFBa0MsQ0FBQTtJQUNsQyxxREFBdUMsQ0FBQTtJQUN2Qyx1Q0FBdUIsQ0FBQTtJQUN2QiwyQ0FBMkIsQ0FBQTtJQUMzQixpQ0FBaUIsQ0FBQTtBQUNyQixDQUFDLEVBUlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFRdkI7QUFDRCxJQUFZLGVBS1g7QUFMRCxXQUFZLGVBQWU7SUFDdkIsa0NBQWdCLENBQUE7SUFDaEIsMENBQXVCLENBQUE7SUFDdkIsZ0NBQWEsQ0FBQTtJQUNiLG9DQUFpQixDQUFBO0FBQ3JCLENBQUMsRUFMVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUsxQjtBQUNELElBQVksV0FJWDtBQUpELFdBQVksV0FBVztJQUNuQix3Q0FBMEIsQ0FBQTtJQUMxQix3Q0FBeUIsQ0FBQTtJQUN6QixzQ0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBSlcsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFJdEI7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