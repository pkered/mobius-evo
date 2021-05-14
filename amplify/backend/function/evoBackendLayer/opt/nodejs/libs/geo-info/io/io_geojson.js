"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const arrs_1 = require("@assets/libs/util/arrs");
const proj4_1 = __importDefault(require("proj4"));
const vectors_1 = require("../../geom/vectors");
const matrix_1 = require("../../geom/matrix");
const common_2 = require("./common");
var EGeojsoFeatureType;
(function (EGeojsoFeatureType) {
    EGeojsoFeatureType["POINT"] = "Point";
    EGeojsoFeatureType["LINESTRING"] = "LineString";
    EGeojsoFeatureType["POLYGON"] = "Polygon";
    EGeojsoFeatureType["MULTIPOINT"] = "MultiPoint";
    EGeojsoFeatureType["MULTILINESTRING"] = "MultiLineString";
    EGeojsoFeatureType["MULTIPOLYGON"] = "MultiPolygon";
})(EGeojsoFeatureType || (EGeojsoFeatureType = {}));
function exportGeojson(model, entities, flatten, ssid) {
    // create the projection object
    const proj_obj = _createProjection(model);
    // calculate angle of rotation
    let rot_matrix = null;
    if (model.modeldata.attribs.query.hasModelAttrib('north')) {
        const north = model.modeldata.attribs.get.getModelAttribVal('north');
        if (Array.isArray(north)) {
            const rot_ang = vectors_1.vecAng2([0, 1, 0], [north[0], north[1], 0], [0, 0, 1]);
            rot_matrix = matrix_1.rotateMatrix([[0, 0, 0], [0, 0, 1]], -rot_ang);
        }
    }
    // create features from pgons, plines, points
    const features = [];
    const obj_sets = common_2.getObjSets(model, entities, ssid);
    for (const pgon_i of obj_sets.pg) {
        features.push(_createGeojsonPolygon(model, pgon_i, proj_obj, rot_matrix, flatten));
    }
    for (const pline_i of obj_sets.pl) {
        features.push(_createGeojsonLineString(model, pline_i, proj_obj, rot_matrix, flatten));
    }
    for (const pline_i of obj_sets.pt) {
        //
        //
        // TODO implement points
        //
        //
    }
    const export_json = {
        'type': 'FeatureCollection',
        'features': features
    };
    return JSON.stringify(export_json, null, 2); // pretty
}
exports.exportGeojson = exportGeojson;
function _createGeojsonPolygon(model, pgon_i, proj_obj, rot_matrix, flatten) {
    // {
    //     "type": "Feature",
    //     "geometry": {
    //       "type": "Polygon",
    //       "coordinates": [
    //         [
    //           [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
    //           [100.0, 1.0], [100.0, 0.0]
    //         ]
    //       ]
    //     },
    //     "properties": {
    //       "prop0": "value0",
    //       "prop1": { "this": "that" }
    //     }
    // }
    const all_coords = [];
    const wires_i = model.modeldata.geom.nav.navAnyToWire(common_1.EEntType.PGON, pgon_i);
    for (let i = 0; i < wires_i.length; i++) {
        const coords = [];
        const posis_i = model.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wires_i[i]);
        for (const posi_i of posis_i) {
            const xyz = model.modeldata.attribs.posis.getPosiCoords(posi_i);
            const lat_long = _xformFromXYZToLongLat(xyz, proj_obj, rot_matrix, flatten);
            coords.push(lat_long);
        }
        all_coords.push(coords);
    }
    const all_props = {};
    for (const name of model.modeldata.attribs.getAttribNames(common_1.EEntType.PGON)) {
        if (!name.startsWith('_')) {
            all_props[name] = model.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.PGON, pgon_i, name);
        }
    }
    return {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': all_coords
        },
        'properties': all_props
    };
}
function _createGeojsonLineString(model, pline_i, proj_obj, rot_matrix, flatten) {
    // {
    //     "type": "Feature",
    //     "geometry": {
    //       "type": "LineString",
    //       "coordinates": [
    //         [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
    //       ]
    //     },
    //     "properties": {
    //       "prop0": "value0",
    //       "prop1": 0.0
    //     }
    // },
    const coords = [];
    const wire_i = model.modeldata.geom.nav.navPlineToWire(pline_i);
    const posis_i = model.modeldata.geom.nav.navAnyToPosi(common_1.EEntType.WIRE, wire_i);
    for (const posi_i of posis_i) {
        const xyz = model.modeldata.attribs.posis.getPosiCoords(posi_i);
        const lat_long = _xformFromXYZToLongLat(xyz, proj_obj, rot_matrix, flatten);
        coords.push(lat_long);
    }
    if (model.modeldata.geom.query.isWireClosed(wire_i)) {
        coords.push(coords[0]);
    }
    const all_props = {};
    for (const name of model.modeldata.attribs.getAttribNames(common_1.EEntType.PLINE)) {
        if (!name.startsWith('_')) {
            all_props[name] = model.modeldata.attribs.get.getEntAttribVal(common_1.EEntType.PLINE, pline_i, name);
        }
    }
    return {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': coords
        },
        'properties': all_props
    };
}
/**
* Import geojson
*/
function importGeojson(model, geojson_str, elevation) {
    // parse the json data str
    const geojson_obj = JSON.parse(geojson_str);
    const proj_obj = _createProjection(model);
    // calculate angle of rotation
    let rot_matrix = null;
    if (model.modeldata.attribs.query.hasModelAttrib('north')) {
        const north = model.modeldata.attribs.get.getModelAttribVal('north');
        if (Array.isArray(north)) {
            const rot_ang = vectors_1.vecAng2([0, 1, 0], [north[0], north[1], 0], [0, 0, 1]);
            rot_matrix = matrix_1.rotateMatrix([[0, 0, 0], [0, 0, 1]], rot_ang);
        }
    }
    // arrays for features
    const point_f = [];
    const linestring_f = [];
    const polygon_f = [];
    const multipoint_f = [];
    const multilinestring_f = [];
    const multipolygon_f = [];
    const other_f = [];
    // arrays for objects
    const points_i = new Set();
    const plines_i = new Set();
    const pgons_i = new Set();
    const colls_i = new Set();
    // loop
    for (const feature of geojson_obj.features) {
        // get the features
        switch (feature.geometry.type) {
            case EGeojsoFeatureType.POINT:
                point_f.push(feature);
                const point_i = _addPointToModel(model, feature, proj_obj, rot_matrix, elevation);
                if (point_i !== null) {
                    points_i.add(point_i);
                }
                break;
            case EGeojsoFeatureType.LINESTRING:
                linestring_f.push(feature);
                const pline_i = _addPlineToModel(model, feature, proj_obj, rot_matrix, elevation);
                if (pline_i !== null) {
                    plines_i.add(pline_i);
                }
                break;
            case EGeojsoFeatureType.POLYGON:
                polygon_f.push(feature);
                const pgon_i = _addPgonToModel(model, feature, proj_obj, rot_matrix, elevation);
                if (pgon_i !== null) {
                    pgons_i.add(pgon_i);
                }
                break;
            case EGeojsoFeatureType.MULTIPOINT:
                multipoint_f.push(feature);
                const points_coll_i = _addPointCollToModel(model, feature, proj_obj, rot_matrix, elevation);
                for (const point_coll_i of points_coll_i[0]) {
                    points_i.add(point_coll_i);
                }
                colls_i.add(points_coll_i[1]);
                break;
            case EGeojsoFeatureType.MULTILINESTRING:
                multilinestring_f.push(feature);
                const plines_coll_i = _addPlineCollToModel(model, feature, proj_obj, rot_matrix, elevation);
                for (const pline_coll_i of plines_coll_i[0]) {
                    plines_i.add(pline_coll_i);
                }
                colls_i.add(plines_coll_i[1]);
                break;
            case EGeojsoFeatureType.MULTIPOLYGON:
                multipolygon_f.push(feature);
                const pgons_coll_i = _addPgonCollToModel(model, feature, proj_obj, rot_matrix, elevation);
                for (const pgon_coll_i of pgons_coll_i[0]) {
                    pgons_i.add(pgon_coll_i);
                }
                colls_i.add(pgons_coll_i[1]);
                break;
            default:
                other_f.push(feature);
                break;
        }
    }
    // return sets
    return {
        pt: points_i,
        pl: plines_i,
        pg: pgons_i,
        co: colls_i
    };
}
exports.importGeojson = importGeojson;
/**
 * Get long lat, Detect CRS, create projection function
 * @param model The model.
 * @param point The features to add.
 */
function _createProjection(model) {
    // create the function for transformation
    const proj_str_a = '+proj=tmerc +lat_0=';
    const proj_str_b = ' +lon_0=';
    const proj_str_c = '+k=1 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs';
    let longitude = common_1.LONGLAT[0];
    let latitude = common_1.LONGLAT[1];
    if (model.modeldata.attribs.query.hasModelAttrib('geolocation')) {
        const geolocation = model.modeldata.attribs.get.getModelAttribVal('geolocation');
        const long_value = geolocation['longitude'];
        if (typeof long_value !== 'number') {
            throw new Error('Longitude attribute must be a number.');
        }
        longitude = long_value;
        if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude attribute must be between -180 and 180.');
        }
        const lat_value = geolocation['latitude'];
        if (typeof lat_value !== 'number') {
            throw new Error('Latitude attribute must be a number');
        }
        latitude = lat_value;
        if (latitude < 0 || latitude > 90) {
            throw new Error('Latitude attribute must be between 0 and 90.');
        }
    }
    // try to figure out what the projection is of the source file
    // let proj_from_str = 'WGS84';
    // if (geojson_obj.hasOwnProperty('crs')) {
    //     if (geojson_obj.crs.hasOwnProperty('properties')) {
    //         if (geojson_obj.crs.properties.hasOwnProperty('name')) {
    //             const name: string = geojson_obj.crs.properties.name;
    //             const epsg_index = name.indexOf('EPSG');
    //             if (epsg_index !== -1) {
    //                 let epsg = name.slice(epsg_index);
    //                 epsg = epsg.replace(/\s/g, '+');
    //                 if (epsg === 'EPSG:4326') {
    //                     // do nothing, 'WGS84' is fine
    //                 } else if (['EPSG:4269', 'EPSG:3857', 'EPSG:3785', 'EPSG:900913', 'EPSG:102113'].indexOf(epsg) !== -1) {
    //                     // these are the epsg codes that proj4 knows
    //                     proj_from_str = epsg;
    //                 } else if (epsg === 'EPSG:3414') {
    //                     // singapore
    //                     proj_from_str =
    //                         '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 ' +
    //                         '+ellps=WGS84 +units=m +no_defs';
    //                 }
    //             }
    //         }
    //     }
    // }
    // console.log('CRS of geojson data', proj_from_str);
    const proj_from_str = 'WGS84';
    const proj_to_str = proj_str_a + latitude + proj_str_b + longitude + proj_str_c;
    const proj_obj = proj4_1.default(proj_from_str, proj_to_str);
    return proj_obj;
}
/*
    "geometry": {
        "type": "Point",
        "coordinates": [40, 40]
    }
*/
/**
 * Add a point to the model
 * @param model The model.
 * @param point The features to add.
 */
function _addPointToModel(model, point, proj_obj, rot_matrix, elevation) {
    if (point.geometry.coordinates.length === 0) {
        return null;
    }
    // add feature
    let xyz = _xformFromLongLatToXYZ(point.geometry.coordinates, proj_obj, elevation);
    // rotate to north
    if (rot_matrix !== null) {
        xyz = matrix_1.multMatrix(xyz, rot_matrix);
    }
    // create the posi
    const posi_i = model.modeldata.geom.add.addPosi();
    model.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
    // create the point
    const point_i = model.modeldata.geom.add.addPoint(posi_i);
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.POINT, point_i, point);
    // return the index
    return point_i;
}
/*
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [30, 10], [10, 30], [40, 40]
        ]
    }
*/
/**
 * Add a pline to the model
 * @param model The model
 * @param linestrings The features to add.
 */
function _addPlineToModel(model, linestring, proj_obj, rot_matrix, elevation) {
    // check that the polyline has 2 or more positions
    if (linestring.geometry.coordinates.length < 2) {
        return null;
    }
    // add feature
    let xyzs = _xformFromLongLatToXYZ(linestring.geometry.coordinates, proj_obj, elevation);
    const first_xyz = xyzs[0];
    const last_xyz = xyzs[xyzs.length - 1];
    const close = xyzs.length > 2 && first_xyz[0] === last_xyz[0] && first_xyz[1] === last_xyz[1];
    if (close) {
        xyzs = xyzs.slice(0, xyzs.length - 1);
    }
    // rotate to north
    if (rot_matrix !== null) {
        for (let i = 0; i < xyzs.length; i++) {
            xyzs[i] = matrix_1.multMatrix(xyzs[i], rot_matrix);
        }
    }
    // create the posis
    const posis_i = [];
    for (const xyz of xyzs) {
        const posi_i = model.modeldata.geom.add.addPosi();
        model.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
        posis_i.push(posi_i);
    }
    // create the pline
    const pline_i = model.modeldata.geom.add.addPline(posis_i, close);
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.PLINE, pline_i, linestring);
    // return the index
    return pline_i;
}
/*
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [[35, 10], [45, 45], [15, 40], [10, 20], [35, 10]],
            [[20, 30], [35, 35], [30, 20], [20, 30]]
        ]
    }
*/
/**
 * Add a pgon to the model
 * @param model The model
 * @param polygons The features to add.
 */
function _addPgonToModel(model, polygon, proj_obj, rot_matrix, elevation) {
    // check that the first ring has 2 or more positions
    if (polygon.geometry.coordinates.length && polygon.geometry.coordinates[0].length < 2) {
        return null;
    }
    // add feature
    const rings = [];
    for (const ring of polygon.geometry.coordinates) {
        const xyzs = _xformFromLongLatToXYZ(ring, proj_obj, elevation);
        // rotate to north
        if (rot_matrix !== null) {
            for (let i = 0; i < xyzs.length; i++) {
                xyzs[i] = matrix_1.multMatrix(xyzs[i], rot_matrix);
            }
        }
        // create the posis
        const posis_i = [];
        for (const xyz of xyzs) {
            const posi_i = model.modeldata.geom.add.addPosi();
            model.modeldata.attribs.posis.setPosiCoords(posi_i, xyz);
            posis_i.push(posi_i);
        }
        rings.push(posis_i);
    }
    // create the pgon
    const pgon_i = model.modeldata.geom.add.addPgon(rings[0], rings.slice(1));
    // check if it needs flipping
    // TODO there may be a faster way to do this
    const normal = model.modeldata.geom.query.getPgonNormal(pgon_i);
    if (vectors_1.vecDot(normal, [0, 0, 1]) < 0) {
        model.modeldata.geom.edit_topo.reverse(model.modeldata.geom.nav.navPgonToWire(pgon_i)[0]);
    }
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.PGON, pgon_i, polygon);
    // return the index
    return pgon_i;
}
/*
    "geometry": {
        "type": "MultiPoint",
        "coordinates": [
            [10, 10],
            [40, 40]
        ]
    }
*/
/**
 * Adds multipoint to the model
 * @param model The model
 * @param multipoint The features to add.
 */
function _addPointCollToModel(model, multipoint, proj_obj, rot_matrix, elevation) {
    const ssid = model.modeldata.active_ssid;
    // add features
    const points_i = [];
    for (const coordinates of multipoint.geometry.coordinates) {
        const point_i = _addPointToModel(model, { 'geometry': { 'coordinates': coordinates } }, proj_obj, rot_matrix, elevation);
        points_i.push(point_i);
    }
    // create the collection
    const coll_i = model.modeldata.geom.add.addColl();
    model.modeldata.geom.snapshot.addCollPoints(ssid, coll_i, points_i);
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.COLL, coll_i, multipoint);
    // return the indices of the plines and the index of the collection
    return [points_i, coll_i];
}
/*
    "geometry": {
        "type": "MultiLineString",
        "coordinates": [
            [[10, 10], [20, 20], [10, 40]],
            [[40, 40], [30, 30], [40, 20], [30, 10]]
        ]
    }
*/
/**
 * Adds multilinestrings to the model
 * @param multilinestrings The features to add.
 * @param model The model
 */
function _addPlineCollToModel(model, multilinestring, proj_obj, rot_matrix, elevation) {
    const ssid = model.modeldata.active_ssid;
    // add features
    const plines_i = [];
    for (const coordinates of multilinestring.geometry.coordinates) {
        const pline_i = _addPlineToModel(model, { 'geometry': { 'coordinates': coordinates } }, proj_obj, rot_matrix, elevation);
        plines_i.push(pline_i);
    }
    // create the collection
    const coll_i = model.modeldata.geom.add.addColl();
    model.modeldata.geom.snapshot.addCollPlines(ssid, coll_i, plines_i);
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.COLL, coll_i, multilinestring);
    // return the indices of the plines and the index of the collection
    return [plines_i, coll_i];
}
/*
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [[40, 40], [20, 45], [45, 30], [40, 40]]
            ],
            [
                [[20, 35], [10, 30], [10, 10], [30, 5], [45, 20], [20, 35]],
                [[30, 20], [20, 15], [20, 25], [30, 20]]
            ]
        ]
    }
*/
/**
 * Adds multipolygons to the model
 * @param model The model
 * @param multipolygons The features to add.
 */
function _addPgonCollToModel(model, multipolygon, proj_obj, rot_matrix, elevation) {
    const ssid = model.modeldata.active_ssid;
    // add features
    const pgons_i = [];
    for (const coordinates of multipolygon.geometry.coordinates) {
        const pgon_i = _addPgonToModel(model, { 'geometry': { 'coordinates': coordinates } }, proj_obj, rot_matrix, elevation);
        pgons_i.push(pgon_i);
    }
    // create the collection
    const coll_i = model.modeldata.geom.add.addColl();
    model.modeldata.geom.snapshot.addCollPgons(ssid, coll_i, pgons_i);
    // add attribs
    _addAttribsToModel(model, common_1.EEntType.COLL, coll_i, multipolygon);
    // return the indices of the plines and the index of the collection
    return [pgons_i, coll_i];
}
/**
 * Adds attributes to the model
 * @param model The model
 */
function _addAttribsToModel(model, ent_type, ent_i, feature) {
    // add attribs
    if (!feature.hasOwnProperty('properties')) {
        return;
    }
    for (const name of Object.keys(feature.properties)) {
        let value = feature.properties[name];
        const value_type = typeof feature.properties[name];
        if (value_type === 'object') {
            value = JSON.stringify(value);
        }
        model.modeldata.attribs.set.setCreateEntsAttribVal(ent_type, ent_i, name, value);
    }
}
/**
 * Converts geojson long lat to cartesian coords
 * @param long_lat_arr
 * @param elevation
 */
function _xformFromLongLatToXYZ(long_lat_arr, proj_obj, elevation) {
    if (arrs_1.getArrDepth(long_lat_arr) === 1) {
        const long_lat = long_lat_arr;
        const xy = proj_obj.forward(long_lat);
        return [xy[0], xy[1], elevation];
    }
    else {
        long_lat_arr = long_lat_arr;
        const xyzs_xformed = [];
        for (const long_lat of long_lat_arr) {
            if (long_lat.length >= 2) {
                const xyz = _xformFromLongLatToXYZ(long_lat, proj_obj, elevation);
                xyzs_xformed.push(xyz);
            }
        }
        return xyzs_xformed;
    }
}
/**
 * Converts cartesian coords to geojson long lat
 * @param xyz
 * @param flatten
 */
function _xformFromXYZToLongLat(xyz, proj_obj, rot_matrix, flatten) {
    if (arrs_1.getArrDepth(xyz) === 1) {
        xyz = xyz;
        // rotate to north
        if (rot_matrix !== null) {
            xyz = matrix_1.multMatrix(xyz, rot_matrix);
        }
        return proj_obj.inverse([xyz[0], xyz[1]]);
    }
    else {
        xyz = xyz;
        const long_lat_arr = [];
        for (const a_xyz of xyz) {
            const lat_long = _xformFromXYZToLongLat(a_xyz, proj_obj, rot_matrix, flatten);
            long_lat_arr.push(lat_long);
        }
        return long_lat_arr;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW9fZ2VvanNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW8taW5mby9pby9pb19nZW9qc29uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0Esc0NBQWtHO0FBQ2xHLGlEQUFxRDtBQUNyRCxrREFBMEI7QUFDMUIsZ0RBQXFEO0FBQ3JELDhDQUE2RDtBQUU3RCxxQ0FBc0M7QUFHdEMsSUFBSyxrQkFPSjtBQVBELFdBQUssa0JBQWtCO0lBQ25CLHFDQUFlLENBQUE7SUFDZiwrQ0FBeUIsQ0FBQTtJQUN6Qix5Q0FBbUIsQ0FBQTtJQUNuQiwrQ0FBeUIsQ0FBQTtJQUN6Qix5REFBbUMsQ0FBQTtJQUNuQyxtREFBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBUEksa0JBQWtCLEtBQWxCLGtCQUFrQixRQU90QjtBQUNELFNBQWdCLGFBQWEsQ0FBQyxLQUFjLEVBQUUsUUFBdUIsRUFBRSxPQUFnQixFQUFFLElBQVk7SUFDakcsK0JBQStCO0lBQy9CLE1BQU0sUUFBUSxHQUFvQixpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRCw4QkFBOEI7SUFDOUIsSUFBSSxVQUFVLEdBQVksSUFBSSxDQUFDO0lBQy9CLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN2RCxNQUFNLEtBQUssR0FBUSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFRLENBQUM7UUFDakYsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sT0FBTyxHQUFXLGlCQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFD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