"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const util_1 = require("util");
const maps_1 = require("../../util/maps");
/**
 * Class for attributes.
 */
class GIAttribsThreejs {
    /**
      * Creates an object to store the attribute data.
      * @param modeldata The JSON data
      */
    constructor(modeldata) {
        this.modeldata = modeldata;
    }
    // ============================================================================
    // Threejs
    // For methods to get the array of edges and triangles, see the geom class
    // get3jsTris() and get3jsEdges()
    // ============================================================================
    /**
     * Get a flat array of all the coordinates of all the vertices.
     * Verts that have been deleted will not be included
     * @param verts An array of vertex indices pointing to the position.
     */
    get3jsSeqPosisCoords(ssid) {
        const coords_attrib = this.modeldata.attribs.attribs_maps.get(ssid).ps.get(common_1.EAttribNames.COORDS);
        //
        const coords = [];
        const posi_map = new Map();
        const posis_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.POSI);
        for (const posi_i of posis_i) {
            const tjs_index = coords.push(coords_attrib.getEntVal(posi_i)) - 1;
            posi_map.set(posi_i, tjs_index);
        }
        // @ts-ignore
        return [coords.flat(1), posi_map];
    }
    /**
     * Get a flat array of all the coordinates of all the vertices.
     * Verts that have been deleted will not be included
     * @param verts An array of vertex indices pointing to the positio.
     */
    get3jsSeqVertsCoords(ssid) {
        const coords_attrib = this.modeldata.attribs.attribs_maps.get(ssid).ps.get(common_1.EAttribNames.COORDS);
        //
        const coords = [];
        const vertex_map = new Map();
        const verts_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.VERT);
        for (const vert_i of verts_i) {
            const posi_i = this.modeldata.geom.nav.navVertToPosi(vert_i);
            const tjs_index = coords.push(coords_attrib.getEntVal(posi_i)) - 1;
            vertex_map.set(vert_i, tjs_index);
        }
        // @ts-ignore
        return [coords.flat(1), vertex_map];
    }
    /**
     * Get a flat array of normals values for all the vertices.
     * Verts that have been deleted will not be included
     */
    get3jsSeqVertsNormals(ssid) {
        if (!this.modeldata.attribs.attribs_maps.get(ssid)._v.has(common_1.EAttribNames.NORMAL)) {
            return null;
        }
        // create a sparse arrays of normals of all verts of polygons
        const verts_attrib = this.modeldata.attribs.attribs_maps.get(ssid)._v.get(common_1.EAttribNames.NORMAL);
        const normals = [];
        const pgons_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.PGON);
        for (const pgon_i of pgons_i) {
            let pgon_normal = null;
            for (const vert_i of this.modeldata.geom.nav.navAnyToVert(common_1.EEntType.PGON, pgon_i)) {
                let normal = verts_attrib.getEntVal(vert_i);
                if (normal === undefined) {
                    pgon_normal = this.modeldata.geom.snapshot.getPgonNormal(ssid, pgon_i);
                    normal = pgon_normal;
                }
                normals[vert_i] = normal;
            }
        }
        // get all the normals
        const verts_normals = [];
        const verts_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.VERT);
        for (const vert_i of verts_i) {
            if (vert_i !== undefined) {
                let normal = normals[vert_i];
                normal = normal === undefined ? [0, 0, 0] : normal;
                verts_normals.push(normal);
            }
        }
        // @ts-ignore
        return verts_normals.flat(1);
    }
    /**
     * Get a flat array of colors values for all the vertices.
     */
    get3jsSeqVertsColors(ssid) {
        if (!this.modeldata.attribs.attribs_maps.get(ssid)._v.has(common_1.EAttribNames.COLOR)) {
            return null;
        }
        const verts_attrib = this.modeldata.attribs.attribs_maps.get(ssid)._v.get(common_1.EAttribNames.COLOR);
        // get all the colors
        const verts_colors = [];
        const verts_i = this.modeldata.geom.snapshot.getEnts(ssid, common_1.EEntType.VERT);
        for (const vert_i of verts_i) {
            if (vert_i !== undefined) {
                const value = verts_attrib.getEntVal(vert_i);
                const _value = value === undefined ? [1, 1, 1] : value;
                verts_colors.push(_value);
            }
        }
        // @ts-ignore
        return verts_colors.flat(1);
    }
    /**
     *
     */
    getModelAttribsForTable(ssid) {
        const attrib = this.modeldata.attribs.attribs_maps.get(ssid).mo;
        if (attrib === undefined) {
            return [];
        }
        const arr = [];
        attrib.forEach((value, key) => {
            // const _value = isString(value) ? `'${value}'` : value;
            const _value = JSON.stringify(value);
            const obj = { Name: key, Value: _value };
            arr.push(obj);
        });
        // console.log(arr);
        return arr;
    }
    /**
     *
     * @param ent_type
     */
    getAttribsForTable(ssid, ent_type) {
        // get the attribs map for this ent type
        const attribs_maps_key = common_1.EEntTypeStr[ent_type];
        const attribs = this.modeldata.attribs.attribs_maps.get(ssid)[attribs_maps_key];
        // create a map of objects to store the data
        // const data_obj_map: Map< number, { '#': number, _id: string} > = new Map();
        const data_obj_map = new Map();
        // create the ID for each table row
        const ents_i = this.modeldata.geom.snapshot.getEnts(ssid, ent_type);
        // sessionStorage.setItem('attrib_table_ents', JSON.stringify(ents_i));
        let i = 0;
        for (const ent_i of ents_i) {
            // data_obj_map.set(ent_i, { '#': i, _id: `${attribs_maps_key}${ent_i}`} );
            data_obj_map.set(ent_i, { _id: `${attribs_maps_key}${ent_i}` });
            if (ent_type === common_1.EEntType.COLL) {
                const coll_parent = this.modeldata.geom.snapshot.getCollParent(ssid, ent_i);
                data_obj_map.get(ent_i)['_parent'] = coll_parent === undefined ? '' : 'co' + coll_parent;
            }
            i++;
        }
        // loop through all the attributes
        attribs.forEach((attrib, attrib_name) => {
            const data_size = attrib.getDataLength();
            if (attrib.numVals() === 0) {
                return;
            }
            for (const ent_i of ents_i) {
                if (attrib_name.substr(0, 1) === '_' && attrib_name !== '_parent') {
                    const attrib_value = attrib.getEntVal(ent_i);
                    data_obj_map.get(ent_i)[`${attrib_name}`] = attrib_value;
                }
                else {
                    const attrib_value = attrib.getEntVal(ent_i);
                    if (attrib_value && attrib_value.constructor === {}.constructor) {
                        data_obj_map.get(ent_i)[`${attrib_name}`] = JSON.stringify(attrib_value);
                    }
                    else if (data_size > 1) {
                        if (attrib_value === undefined) {
                            for (let idx = 0; idx < data_size; idx++) {
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = undefined;
                            }
                        }
                        else {
                            attrib_value.forEach((v, idx) => {
                                const _v = v;
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = _v;
                            });
                        }
                    }
                    else {
                        if (ent_type === common_1.EEntType.POSI && Array.isArray(attrib_value)) {
                            if (attrib_name === 'xyz') {
                                for (let index = 0; index < attrib_value.length; index++) {
                                    const _v = Array.isArray(attrib_value[index]) ?
                                        JSON.stringify(attrib_value[index]) : attrib_value[index];
                                    data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                                }
                                // if (attrib_value.length < 4) {
                                //     console.log(attrib_value)
                                //     for (let index = 0; index < attrib_value.length; index++) {
                                //         const _v = Array.isArray(attrib_value[index]) ?
                                //         JSON.stringify(attrib_value[index]) : attrib_value[index];
                                //         data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                                //     }
                            }
                            else {
                                data_obj_map.get(ent_i)[attrib_name] = JSON.stringify(attrib_value);
                            }
                        }
                        else if (Array.isArray(attrib_value)) {
                            const _attrib_value = util_1.isString(attrib_value[0]) ? `'${attrib_value[0]}'` : attrib_value[0];
                            data_obj_map.get(ent_i)[`${attrib_name}[0]`] = _attrib_value;
                        }
                        else {
                            const _attrib_value = util_1.isString(attrib_value) ? `'${attrib_value}'` : attrib_value;
                            data_obj_map.get(ent_i)[`${attrib_name}`] = _attrib_value;
                        }
                    }
                }
            }
        });
        return { data: Array.from(data_obj_map.values()), ents: ents_i };
    }
    /**
     * Gets the sub ents and attibs of an object or collection..
     * Returns an array of maps, each map is: attribname -> attrib_value
     * @param ent_type
     */
    getEntSubAttribsForTable(ssid, ent_type, ent_i, level) {
        const data = [];
        // const attribs_maps_key: string = EEntTypeStr[level];
        // const attribs: Map<string, GIAttribMapBase> = this.modeldata.attribs.attribs_maps.get(ssid)[attribs_maps_key];
        // const data_headers: Map< string, TAttribDataTypes > = new Map();
        // attribs.forEach( (attrib, attrib_name) => data_headers.set(attrib_name, attrib.getDataType()) );
        // data.push(data_headers);
        data.push(this._addEntSubAttribs(ssid, ent_type, ent_i, level));
        switch (ent_type) {
            case common_1.EEntType.COLL:
                {
                    this.modeldata.geom.snapshot.getCollPgons(ssid, ent_i).forEach(pgon_i => data.push(this._addEntSubAttribs(ssid, common_1.EEntType.PGON, pgon_i, level)));
                    this.modeldata.geom.snapshot.getCollPlines(ssid, ent_i).forEach(pline_i => data.push(this._addEntSubAttribs(ssid, common_1.EEntType.PLINE, pline_i, level)));
                    this.modeldata.geom.snapshot.getCollPoints(ssid, ent_i).forEach(point_i => data.push(this._addEntSubAttribs(ssid, common_1.EEntType.POINT, point_i, level)));
                    this.modeldata.geom.snapshot.getCollChildren(ssid, ent_i).forEach(child_coll_i => data.push(this._addEntSubAttribs(ssid, common_1.EEntType.COLL, child_coll_i, level)));
                }
                return data;
            case common_1.EEntType.PGON:
                {
                    for (const wire_i of this.modeldata.geom.nav.navPgonToWire(ent_i)) {
                        this._addEntSubWire(ssid, wire_i, data, level);
                    }
                }
                return data;
            case common_1.EEntType.PLINE:
                {
                    const wire_i = this.modeldata.geom.nav.navPlineToWire(ent_i);
                    this._addEntSubWire(ssid, wire_i, data, level);
                }
                return data;
            case common_1.EEntType.POINT:
                {
                    const vert_i = this.modeldata.geom.nav.navPointToVert(ent_i);
                    data.push(this._addEntSubAttribs(ssid, common_1.EEntType.VERT, vert_i, level));
                    data.push(this._addEntSubAttribs(ssid, common_1.EEntType.POSI, this.modeldata.geom.nav.navVertToPosi(vert_i), level));
                }
                return data;
            default:
                break;
        }
    }
    _addEntSubWire(ssid, wire_i, data, level) {
        data.push(this._addEntSubAttribs(ssid, common_1.EEntType.WIRE, wire_i, level));
        const edges_i = this.modeldata.geom.nav.navWireToEdge(wire_i);
        for (const edge_i of edges_i) {
            const [vert0_i, vert1_i] = this.modeldata.geom.nav.navEdgeToVert(edge_i);
            const posi0_i = this.modeldata.geom.nav.navVertToPosi(vert0_i);
            data.push(this._addEntSubAttribs(ssid, common_1.EEntType.VERT, vert0_i, level));
            data.push(this._addEntSubAttribs(ssid, common_1.EEntType.POSI, posi0_i, level));
            data.push(this._addEntSubAttribs(ssid, common_1.EEntType.EDGE, edge_i, level));
            if (edge_i === edges_i[edges_i.length - 1]) {
                const posi1_i = this.modeldata.geom.nav.navVertToPosi(vert1_i);
                data.push(this._addEntSubAttribs(ssid, common_1.EEntType.VERT, vert1_i, level));
                data.push(this._addEntSubAttribs(ssid, common_1.EEntType.POSI, posi1_i, level));
            }
        }
    }
    _addEntSubAttribs(ssid, ent_type, ent_i, level) {
        const attribs_maps_key = common_1.EEntTypeStr[ent_type];
        const attribs = this.modeldata.attribs.attribs_maps.get(ssid)[attribs_maps_key];
        const data_map = new Map();
        data_map.set('_id', `${attribs_maps_key}${ent_i}`);
        if (ent_type !== level) {
            return data_map;
        }
        // loop through all the attributes
        attribs.forEach((attrib, attrib_name) => {
            const data_size = attrib.getDataLength();
            if (attrib.numVals() === 0) {
                return;
            }
            const attrib_value = attrib.getEntVal(ent_i);
            if (attrib_value && attrib_value.constructor === {}.constructor) {
                data_map.set(`${attrib_name}`, JSON.stringify(attrib_value));
            }
            else if (data_size > 1) {
                if (attrib_value === undefined) {
                    for (let idx = 0; idx < data_size; idx++) {
                        data_map.set(`${attrib_name}[${idx}]`, undefined);
                    }
                }
                else {
                    attrib_value.forEach((v, idx) => {
                        const _v = v;
                        data_map.set(`${attrib_name}[${idx}]`, _v);
                    });
                }
            }
            else {
                if (ent_type === common_1.EEntType.POSI && Array.isArray(attrib_value)) {
                    if (attrib_name === 'xyz') {
                        for (let index = 0; index < attrib_value.length; index++) {
                            const _v = Array.isArray(attrib_value[index]) ?
                                JSON.stringify(attrib_value[index]) : attrib_value[index];
                            data_map.set(`${attrib_name}[${index}]`, _v);
                        }
                        // if (attrib_value.length < 4) {
                        //     console.log(attrib_value)
                        //     for (let index = 0; index < attrib_value.length; index++) {
                        //         const _v = Array.isArray(attrib_value[index]) ?
                        //         JSON.stringify(attrib_value[index]) : attrib_value[index];
                        //         data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                        //     }
                    }
                    else {
                        data_map.set(attrib_name, JSON.stringify(attrib_value));
                    }
                }
                else {
                    const _attrib_value = util_1.isString(attrib_value) ? `'${attrib_value}'` : attrib_value;
                    data_map.set(`${attrib_name}`, _attrib_value);
                }
            }
        });
        return data_map;
    }
    /**
     * @param ent_type
     * @param ents_i
     */
    getEntsVals(ssid, selected_ents, ent_type) {
        const attribs_maps_key = common_1.EEntTypeStr[ent_type];
        const attribs = this.modeldata.attribs.attribs_maps.get(ssid)[attribs_maps_key];
        const data_obj_map = new Map();
        if (!selected_ents || selected_ents === undefined) {
            return [];
        }
        let i = 0;
        const selected_ents_sorted = maps_1.sortByKey(selected_ents);
        selected_ents_sorted.forEach(ent => {
            data_obj_map.set(ent, { _id: `${attribs_maps_key}${ent}` });
            if (ent_type === common_1.EEntType.COLL) {
                const coll_parent = this.modeldata.geom.snapshot.getCollParent(ssid, ent);
                data_obj_map.get(ent)['_parent'] = coll_parent === undefined ? '' : coll_parent;
            }
            i++;
        });
        const nullAttribs = new Set();
        attribs.forEach((attrib, attrib_name) => {
            const data_size = attrib.getDataLength();
            if (attrib.numVals() === 0) {
                return;
            }
            nullAttribs.add(attrib_name);
            for (const ent_i of Array.from(selected_ents.values())) {
                if (attrib_name.substr(0, 1) === '_') {
                    const attrib_value = attrib.getEntVal(ent_i);
                    data_obj_map.get(ent_i)[`${attrib_name}`] = attrib_value;
                    nullAttribs.delete(attrib_name);
                }
                else {
                    const attrib_value = attrib.getEntVal(ent_i);
                    if (attrib_value !== undefined) {
                        nullAttribs.delete(attrib_name);
                    }
                    if (data_size > 1) {
                        if (attrib_value === undefined) {
                            for (let idx = 0; idx < data_size; idx++) {
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = undefined;
                            }
                        }
                        else if (attrib_value.constructor === {}.constructor) {
                            data_obj_map.get(ent_i)[`${attrib_name}`] = JSON.stringify(attrib_value);
                        }
                        else {
                            attrib_value.forEach((v, idx) => {
                                const _v = v;
                                data_obj_map.get(ent_i)[`${attrib_name}[${idx}]`] = _v;
                            });
                        }
                    }
                    else {
                        if (ent_type === common_1.EEntType.POSI && Array.isArray(attrib_value)) {
                            if (attrib_value.length < 4) {
                                for (let index = 0; index < attrib_value.length; index++) {
                                    const _v = Array.isArray(attrib_value[index]) ?
                                        JSON.stringify(attrib_value[index]) : attrib_value[index];
                                    data_obj_map.get(ent_i)[`${attrib_name}[${index}]`] = _v;
                                }
                            }
                            else {
                                data_obj_map.get(ent_i)[attrib_name] = JSON.stringify(attrib_value);
                            }
                        }
                        else {
                            const _attrib_value = util_1.isString(attrib_value) ? `'${attrib_value}'` : attrib_value;
                            data_obj_map.get(ent_i)[`${attrib_name}`] = _attrib_value;
                        }
                    }
                }
            }
        });
        for (const attrib of nullAttribs) {
            data_obj_map.forEach((val, index) => {
                try {
                    // @ts-ignore
                    delete val[attrib];
                }
                catch (ex) { }
            });
        }
        return Array.from(data_obj_map.values());
    }
}
exports.GIAttribsThreejs = GIAttribsThreejs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lBdHRyaWJzVGhyZWVqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW8taW5mby9hdHRyaWJzL0dJQXR0cmlic1RocmVlanMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBcUc7QUFDckcsK0JBQWdDO0FBQ2hDLDBDQUE0QztBQUk1Qzs7R0FFRztBQUNILE1BQWEsZ0JBQWdCO0lBRTFCOzs7UUFHSTtJQUNILFlBQVksU0FBc0I7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUNELCtFQUErRTtJQUMvRSxVQUFVO0lBQ1YsMEVBQTBFO0lBQzFFLGlDQUFpQztJQUNqQywrRUFBK0U7SUFDL0U7Ozs7T0FJRztJQUNJLG9CQUFvQixDQUFDLElBQVk7UUFDcEMsTUFBTSxhQUFhLEdBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxxQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pILEVBQUU7UUFDRixNQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7UUFDOUIsTUFBTSxRQUFRLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDaEQsTUFBTSxPQUFPLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwRixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUMxQixNQUFNLFNBQVMsR0FBVyxNQUFNLENBQUMsSUFBSSxDQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFhLENBQUUsR0FBRyxDQUFDLENBQUM7WUFDekYsUUFBUSxDQUFD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