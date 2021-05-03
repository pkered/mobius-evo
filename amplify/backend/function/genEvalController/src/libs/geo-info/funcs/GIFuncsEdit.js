"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vectors_1 = require("@libs/geom/vectors");
const common_1 = require("../common");
const distance_1 = require("@libs/geom/distance");
const arrs_1 = require("@assets/libs/util/arrs");
const TypedArrayUtils_js_1 = require("@libs/TypedArrayUtils.js");
const THREE = __importStar(require("three"));
// Enums
var _ERingMethod;
(function (_ERingMethod) {
    _ERingMethod["OPEN"] = "open";
    _ERingMethod["CLOSE"] = "close";
})(_ERingMethod = exports._ERingMethod || (exports._ERingMethod = {}));
var _EDivisorMethod;
(function (_EDivisorMethod) {
    _EDivisorMethod["BY_NUMBER"] = "by_number";
    _EDivisorMethod["BY_LENGTH"] = "by_length";
    _EDivisorMethod["BY_MAX_LENGTH"] = "by_max_length";
    _EDivisorMethod["BY_MIN_LENGTH"] = "by_min_length";
})(_EDivisorMethod = exports._EDivisorMethod || (exports._EDivisorMethod = {}));
var _EWeldMethod;
(function (_EWeldMethod) {
    _EWeldMethod["MAKE_WELD"] = "make_weld";
    _EWeldMethod["BREAK_WELD"] = "break_weld";
})(_EWeldMethod = exports._EWeldMethod || (exports._EWeldMethod = {}));
/**
 * Class for editing geometry.
 */
class GIFuncsEdit {
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
     * @param divisor
     * @param method
     */
    divide(ents_arr, divisor, method) {
        // snapshot copy ents
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, false);
        if (arrs_1.getArrDepth(ents_arr) === 1) {
            const [ent_type, ent_i] = ents_arr;
            // time stamp
            this.modeldata.getObjsCheckTs(ent_type, ent_i);
            //
            let exist_edges_i;
            if (ent_type !== common_1.EEntType.EDGE) {
                exist_edges_i = this.modeldata.geom.nav.navAnyToEdge(ent_type, ent_i).slice();
            }
            else {
                exist_edges_i = [ent_i];
            }
            const all_new_edges_i = [];
            for (const exist_edge_i of exist_edges_i) {
                const new_edges_i = this._divideEdge(exist_edge_i, divisor, method);
                new_edges_i.forEach(new_edge_i => all_new_edges_i.push(new_edge_i));
            }
            // return the new edges
            return all_new_edges_i.map(one_edge_i => [common_1.EEntType.EDGE, one_edge_i]);
        }
        else {
            return [].concat(...ents_arr.map(one_edge => this.divide(one_edge, divisor, method)));
        }
    }
    _divideEdge(edge_i, divisor, method) {
        const posis_i = this.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.EDGE, edge_i);
        const start = this.modeldata.attribs.posis.getPosiCoords(posis_i[0]);
        const end = this.modeldata.attribs.posis.getPosiCoords(posis_i[1]);
        let new_xyzs;
        if (method === _EDivisorMethod.BY_NUMBER) {
            new_xyzs = vectors_1.interpByNum(start, end, divisor - 1);
        }
        else if (method === _EDivisorMethod.BY_LENGTH) {
            new_xyzs = vectors_1.interpByLen(start, end, divisor);
        }
        else if (method === _EDivisorMethod.BY_MAX_LENGTH) {
            const len = distance_1.distance(start, end);
            if (divisor === 0) {
                new_xyzs = [];
            }
            else {
                const num_div = Math.ceil(len / divisor);
                const num_div_max = num_div > 1 ? num_div - 1 : 0;
                new_xyzs = vectors_1.interpByNum(start, end, num_div_max);
            }
        }
        else { // BY_MIN_LENGTH
            if (divisor === 0) {
                new_xyzs = [];
            }
            else {
                const len = distance_1.distance(start, end);
                const num_div = Math.floor(len / divisor);
                const num_div_min = num_div > 1 ? num_div - 1 : 0;
                new_xyzs = vectors_1.interpByNum(start, end, num_div_min);
            }
        }
        const new_edges_i = [];
        let old_edge_i = edge_i;
        for (const new_xyz of new_xyzs) {
            const posi_i = this.modeldata.geom.add.addPosi();
            this.modeldata.attribs.posis.setPosiCoords(posi_i, new_xyz);
            const new_edge_i = this.modeldata.geom.edit_topo.insertVertIntoWire(old_edge_i, posi_i);
            new_edges_i.push(old_edge_i);
            old_edge_i = new_edge_i;
        }
        new_edges_i.push(old_edge_i);
        return new_edges_i;
    }
    // ================================================================================================
    /**
     *
     * @param pgon_i
     * @param holes_ents_arr
     */
    hole(pgon, holes_ents_arr) {
        const pgon_i = pgon[1];
        const holes_posis_i = this._getHolePosisFromEnts(holes_ents_arr);
        // time stamp
        this.modeldata.getObjsCheckTs(common_1.EEntType.PGON, pgon_i);
        // create the hole
        const wires_i = this.modeldata.geom.edit_pgon.cutPgonHoles(pgon_i, holes_posis_i);
        // return hole wires
        return wires_i.map(wire_i => [common_1.EEntType.WIRE, wire_i]);
    }
    _getHolePosisFromEnts(ents_arr) {
        const depth = arrs_1.getArrDepth(ents_arr);
        if (depth === 1) {
            const [ent_type, ent_i] = ents_arr;
            // we have just a single entity, must be a wire, a pline, or a pgon, so get the posis and return them
            return [this.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i)];
        }
        else if (depth === 2) {
            ents_arr = ents_arr;
            // we have a list of entites, could be a list of posis or a list of wires/plines/pgons
            // so lets check the first entity, is it a posi?
            if (ents_arr[0][0] === common_1.EEntType.POSI) {
                // we assume we have a list of posis
                const posis_i = [];
                if (ents_arr.length < 3) {
                    // TODO improve this error message, print the list of entities
                    throw new Error('The data for generating holes in a polygon is invalid. A list of positions must have at least three positions.');
                }
                for (const [ent_type, ent_i] of ents_arr) {
                    if (ent_type !== common_1.EEntType.POSI) {
                        // TODO improve this error message, print the list of entities
                        throw new Error('The list of entities for generating holes is inconsistent. A list has been found that contains a mixture of positions and other entities.');
                    }
                    posis_i.push(ent_i);
                }
                return [posis_i];
            }
            else {
                // we have a list of other entities
                const posis_arrs_i = [];
                for (const [ent_type, ent_i] of ents_arr) {
                    if (ent_type === common_1.EEntType.POSI) {
                        // TODO improve this error message, print the list of entities
                        throw new Error('The data for generating holes in a polygon is inconsistent. A list has been found that contains a mixture of positions and other entities.');
                    }
                    const posis_i = this.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
                    if (posis_i.length > 2) {
                        // if there are less than 3 posis, then ignore this ent (no error)
                        posis_arrs_i.push(posis_i);
                    }
                }
                return posis_arrs_i;
            }
        }
        else {
            // we have some kind of nested list, so call this function recursivley
            const posis_arrs_i = [];
            for (const a_ents_arr of ents_arr) {
                const posis_arrs2_i = this._getHolePosisFromEnts(a_ents_arr);
                for (const posis_arr2_i of posis_arrs2_i) {
                    posis_arrs_i.push(posis_arr2_i);
                }
            }
            return posis_arrs_i;
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param method
     */
    weld(ents_arr, method) {
        // snapshot copy ents (no change to posis)
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, false) as TEntTypeIdx[];
        // get unique verts
        const map = this.modeldata.geom.query.getEntsMap(ents_arr, [common_1.EEntType.VERT, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        // time stamp
        map.get(common_1.EEntType.POINT).forEach(point_i => this.modeldata.getObjsCheckTs(common_1.EEntType.POINT, point_i));
        map.get(common_1.EEntType.PLINE).forEach(pline_i => this.modeldata.getObjsCheckTs(common_1.EEntType.PLINE, pline_i));
        map.get(common_1.EEntType.PGON).forEach(pgon_i => this.modeldata.getObjsCheckTs(common_1.EEntType.PGON, pgon_i));
        // process ents
        const verts_i = Array.from(map.get(common_1.EEntType.VERT));
        switch (method) {
            case _EWeldMethod.BREAK_WELD:
                this.modeldata.geom.edit_topo.cloneVertPositions(verts_i);
                break;
            case _EWeldMethod.MAKE_WELD:
                this.modeldata.geom.edit_topo.mergeVertPositions(verts_i);
                break;
            default:
                break;
        }
        // TODO
        return [];
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param tolerance
     */
    fuse(ents_arr, tolerance) {
        // const ssid: number = this.modeldata.timestamp;
        // snapshot copy ents (no change to posis)
        // ents_arr = this.modeldata.geom.snapshot.copyObjs(ents_arr, false) as TEntTypeIdx[];
        // get unique ents
        const map = this.modeldata.geom.query.getEntsMap(ents_arr, [common_1.EEntType.POSI, common_1.EEntType.POINT, common_1.EEntType.PLINE, common_1.EEntType.PGON]);
        // time stamp
        map.get(common_1.EEntType.POINT).forEach(point_i => this.modeldata.getObjsCheckTs(common_1.EEntType.POINT, point_i));
        map.get(common_1.EEntType.PLINE).forEach(pline_i => this.modeldata.getObjsCheckTs(common_1.EEntType.PLINE, pline_i));
        map.get(common_1.EEntType.PGON).forEach(pgon_i => this.modeldata.getObjsCheckTs(common_1.EEntType.PGON, pgon_i));
        // get posis
        const posis_i = Array.from(map.get(common_1.EEntType.POSI));
        // find neighbour
        const map_posi_i_to_xyz = new Map();
        const typed_positions = new Float32Array(posis_i.length * 4);
        const typed_buff = new THREE.BufferGeometry();
        typed_buff.setAttribute('position', new THREE.BufferAttribute(typed_positions, 4));
        for (let i = 0; i < posis_i.length; i++) {
            const posi_i = posis_i[i];
            const xyz = this.modeldata.attribs.posis.getPosiCoords(posi_i);
            map_posi_i_to_xyz.set(posi_i, xyz);
            typed_positions[i * 4 + 0] = xyz[0];
            typed_positions[i * 4 + 1] = xyz[1];
            typed_positions[i * 4 + 2] = xyz[2];
            typed_positions[i * 4 + 3] = posi_i;
        }
        const kdtree = new TypedArrayUtils_js_1.TypedArrayUtils.Kdtree(typed_positions, this._fuseDistSq, 4);
        // create a neighbours list
        const nns = []; // [posi_i, num_neighbours, neighbour_poisi_i]
        for (let i = 0; i < posis_i.length; i++) {
            const posi_i = posis_i[i];
            const nn = kdtree.nearest(map_posi_i_to_xyz.get(posi_i), posis_i.length, tolerance * tolerance);
            const nn_posis_i = [];
            for (const a_nn of nn) {
                const obj = a_nn[0].obj;
                const nn_posi_i = obj[3];
                nn_posis_i.push(nn_posi_i);
            }
            nns.push([posis_i[i], nn_posis_i.length, nn_posis_i]);
        }
        // sort so that positions with most neighbours win
        nns.sort((a, b) => b[1] - a[1]);
        // create new positions, replace posis for existing vertices
        const nns_filt = []; // [posi_i, num_neighbours, neighbour_poisi_i]
        const exclude_posis_i = new Set(); // exclude any posis that have already been moved
        const new_posis_i = [];
        for (const nn of nns) {
            if (!exclude_posis_i.has(nn[0]) && nn[1] > 1) {
                nns_filt.push(nn);
                const new_xyz = [0, 0, 0];
                for (const n_posi_i of nn[2]) {
                    exclude_posis_i.add(n_posi_i);
                    const xyz = map_posi_i_to_xyz.get(n_posi_i);
                    new_xyz[0] += xyz[0];
                    new_xyz[1] += xyz[1];
                    new_xyz[2] += xyz[2];
                }
                new_xyz[0] = new_xyz[0] / nn[1];
                new_xyz[1] = new_xyz[1] / nn[1];
                new_xyz[2] = new_xyz[2] / nn[1];
                const new_posi_i = this.modeldata.geom.add.addPosi();
                new_posis_i.push(new_posi_i);
                this.modeldata.attribs.posis.setPosiCoords(new_posi_i, new_xyz);
                for (const n_posi_i of nn[2]) {
                    const verts_i = this.modeldata.geom.nav.navPosiToVert(n_posi_i);
                    // create a copy of the list of verts
                    // otherwise verts may be removed from the list while inside the loop
                    const copy_verts_i = verts_i.slice();
                    // loop through the list, replace each vert posi
                    for (const vert_i of copy_verts_i) {
                        this.modeldata.geom.edit_topo.replaceVertPosi(vert_i, new_posi_i);
                    }
                    // this.modeldata.geom.add.addPline([new_posi_i, n_posi_i], false); // temp
                }
            }
        }
        // delete the posis if they are unused
        const ssid = this.modeldata.active_ssid;
        this.modeldata.geom.snapshot.delUnusedPosis(ssid, Array.from(exclude_posis_i));
        // return new posis
        return new_posis_i.map(posi_i => [common_1.EEntType.POSI, posi_i]);
    }
    _fuseDistSq(xyz1, xyz2) {
        return Math.pow(xyz1[0] - xyz2[0], 2) + Math.pow(xyz1[1] - xyz2[1], 2) + Math.pow(xyz1[2] - xyz2[2], 2);
    }
    // ================================================================================================
    ring(ents_arr, method) {
        for (const [ent_type, ent_i] of ents_arr) {
            // time stamp
            this.modeldata.getObjsCheckTs(ent_type, ent_i);
            //
            switch (method) {
                case _ERingMethod.CLOSE:
                    this.modeldata.geom.edit_pline.closePline(ent_i);
                    break;
                case _ERingMethod.OPEN:
                    this.modeldata.geom.edit_pline.openPline(ent_i);
                    break;
                default:
                    break;
            }
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     * @param offset
     */
    shift(ents_arr, offset) {
        for (const [ent_type, ent_i] of ents_arr) {
            // time stamp
            this.modeldata.getObjsCheckTs(ent_type, ent_i);
            //
            const wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i);
            wires_i.forEach(wire_i => this.modeldata.geom.edit_topo.shift(wire_i, offset));
        }
    }
    // ================================================================================================
    /**
     *
     * @param ents_arr
     */
    reverse(ents_arr) {
        for (const [ent_type, ent_i] of ents_arr) {
            // time stamp
            this.modeldata.getObjsCheckTs(ent_type, ent_i);
            //
            const wires_i = this.modeldata.geom.nav.navAnyToWire(ent_type, ent_i);
            wires_i.forEach(wire_i => this.modeldata.geom.edit_topo.reverse(wire_i));
        }
    }
    // ================================================================================================
    /**
     * Delete ents in the model.
     * The posis in ents will only be deleted if they are not used by other ents.
     * If collectons are deleted, the contents of the collection is not deleted.
     * If topological entities are deleted, then the object may need to be cloned.
     */
    delete(ents_arr, invert) {
        const ssid = this.modeldata.active_ssid;
        // null case
        if (ents_arr === null) {
            this._deleteNull(invert);
            return;
        }
        // create array
        ents_arr = (Array.isArray(ents_arr[0]) ? ents_arr : [ents_arr]);
        // empty array
        if (ents_arr.length === 0) {
            return;
        }
        // create sets
        const ent_sets = this.modeldata.geom.snapshot.getSubEntsSets(ssid, ents_arr);
        // console.log(">>>before");
        // Object.keys(ent_sets).forEach( key => console.log(key, Array.from(ent_sets[key])));
        if (invert) {
            this.modeldata.geom.snapshot.invertEntSets(ssid, ent_sets);
        }
        // console.log(">>>after");
        // Object.keys(ent_sets).forEach( key => console.log(key, Array.from(ent_sets[key])));
        this.modeldata.geom.snapshot.delEntSets(ssid, ent_sets);
    }
    _deleteNull(invert) {
        const ssid = this.modeldata.active_ssid;
        if (invert) {
            // delete nothing
            return;
        }
        else {
            // delete everything
            this.modeldata.geom.snapshot.delAllEnts(ssid);
        }
    }
}
exports.GIFuncsEdit = GIFuncsEdit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lGdW5jc0VkaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cy9zcmMvbGlicy9nZW8taW5mby9mdW5jcy9HSUZ1bmNzRWRpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxnREFBOEQ7QUFDOUQsc0NBQWtFO0FBQ2xFLGtEQUErQztBQUMvQyxpREFBcUQ7QUFFckQsaUVBQTJEO0FBQzNELDZDQUErQjtBQUUvQixRQUFRO0FBQ1IsSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3BCLDZCQUFjLENBQUE7SUFDZCwrQkFBaUIsQ0FBQTtBQUNyQixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFDRCxJQUFZLGVBS1g7QUFMRCxXQUFZLGVBQWU7SUFDdkIsMENBQXdCLENBQUE7SUFDeEIsMENBQXlCLENBQUE7SUFDekIsa0RBQWlDLENBQUE7SUFDakMsa0RBQWlDLENBQUE7QUFDckMsQ0FBQyxFQUxXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSzFCO0FBQ0QsSUFBWSxZQUdYO0FBSEQsV0FBWSxZQUFZO0lBQ3BCLHVDQUF3QixDQUFBO0lBQ3hCLHlDQUEyQixDQUFBO0FBQy9CLENBQUMsRUFIVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUd2QjtBQUNEOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBR3BCLG1HQUFtRztJQUNuRzs7T0FFRztJQUNILFlBQVksS0FBa0I7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDM0IsQ0FBQztJQUNELG1HQUFtRztJQUNuRzs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxRQUFtQyxFQUFFLE9BQWUsRUFBRSxNQUF1QjtRQUN2RixxQkFBcUI7UUFDckIscUVBQXFFO1FBQ3JFLElBQUksa0JBQVcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxDQUFDLFFBQVEsRUFB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