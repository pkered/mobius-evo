"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const common_1 = require("../geo-info/common");
// ----
// here are three different version of the function to create the threejs mesh, used for raycasting
// the first creates multiple meshes, the second one big mesh, the third one big buffered mesh
// performance tests are not very clear, in theory the big buffered mesh should be faster,
// but it seems that is not the case, the big non-buffered mesh seems faster
// so for now that is the one that is being used
// ----
function createMultipleMeshesTjs(__model__, ents_arrs) {
    // Note that for meshes, faces must be pointed towards the origin of the ray in order to be detected;
    // intersections of the ray passing through the back of a face will not be detected.
    // To raycast against both faces of an object, you'll want to set the material's side property to THREE.DoubleSide.
    const mat_tjs = new THREE.MeshBasicMaterial();
    mat_tjs.side = THREE.DoubleSide;
    // get all unique posis
    const posis_i_set = new Set();
    for (const [ent_type, ent_i] of ents_arrs) {
        const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        ent_posis_i.forEach(ent_posi_i => posis_i_set.add(ent_posi_i));
    }
    // create tjs vectors for each posi and save them in a sparse array
    // the index to the array is the posi_i
    const posis_tjs = [];
    for (const posi_i of Array.from(posis_i_set)) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        const posi_tjs = new THREE.Vector3(...xyz);
        posis_tjs[posi_i] = posi_tjs;
    }
    // get an array of all the faces
    const pgons_i = [];
    for (const [ent_type, ent_i] of ents_arrs) {
        switch (ent_type) {
            case common_1.EEntType.PGON:
                pgons_i.push(ent_i);
                break;
            default:
                const coll_pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                coll_pgons_i.forEach(coll_pgon_i => pgons_i.push(coll_pgon_i));
                break;
        }
    }
    // create tjs meshes
    const meshes_tjs = [];
    for (const pgon_i of pgons_i) {
        // create the tjs geometry
        const geom_tjs = new THREE.Geometry();
        const tris_i = __model__.modeldata.geom.nav_tri.navPgonToTri(pgon_i);
        for (const tri_i of tris_i) {
            const tri_posis_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
            // add the three vertices to the geometry
            const a = geom_tjs.vertices.push(posis_tjs[tri_posis_i[0]]) - 1;
            const b = geom_tjs.vertices.push(posis_tjs[tri_posis_i[1]]) - 1;
            const c = geom_tjs.vertices.push(posis_tjs[tri_posis_i[2]]) - 1;
            // add the tjs tri to the geometry
            geom_tjs.faces.push(new THREE.Face3(a, b, c));
        }
        // create the mesh, assigning the material
        meshes_tjs.push(new THREE.Mesh(geom_tjs, mat_tjs));
    }
    return meshes_tjs;
}
exports.createMultipleMeshesTjs = createMultipleMeshesTjs;
function createSingleMeshTjs(__model__, ents_arrs) {
    // Note that for meshes, faces must be pointed towards the origin of the ray in order to be detected;
    // intersections of the ray passing through the back of a face will not be detected.
    // To raycast against both faces of an object, you'll want to set the material's side property to THREE.DoubleSide.
    const mat_tjs = new THREE.MeshBasicMaterial();
    mat_tjs.side = THREE.DoubleSide;
    // get all unique posis
    const posis_i_set = new Set();
    for (const [ent_type, ent_i] of ents_arrs) {
        const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        ent_posis_i.forEach(ent_posi_i => posis_i_set.add(ent_posi_i));
    }
    // create tjs vectors for each posi and save them in a sparse array
    // the index to the array is the posi_i
    const posis_tjs = [];
    for (const posi_i of Array.from(posis_i_set)) {
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        const posi_tjs = new THREE.Vector3(...xyz);
        posis_tjs[posi_i] = posi_tjs;
    }
    // get an array of all the pgons
    const pgons_i = [];
    for (const [ent_type, ent_i] of ents_arrs) {
        switch (ent_type) {
            case common_1.EEntType.PGON:
                pgons_i.push(ent_i);
                break;
            default:
                const ent_pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                ent_pgons_i.forEach(ent_pgon_i => pgons_i.push(ent_pgon_i));
                break;
        }
    }
    // create tjs meshes
    const geom_tjs = new THREE.Geometry();
    const idx_to_pgon_i = [];
    for (const pgon_i of pgons_i) {
        // create the tjs geometry
        const tris_i = __model__.modeldata.geom.nav_tri.navPgonToTri(pgon_i);
        for (const tri_i of tris_i) {
            const tri_posis_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
            // add the three vertices to the geometry
            const a = geom_tjs.vertices.push(posis_tjs[tri_posis_i[0]]) - 1;
            const b = geom_tjs.vertices.push(posis_tjs[tri_posis_i[1]]) - 1;
            const c = geom_tjs.vertices.push(posis_tjs[tri_posis_i[2]]) - 1;
            // add the tjs tri to the geometry
            const idx_tjs = geom_tjs.faces.push(new THREE.Face3(a, b, c)) - 1;
            idx_to_pgon_i[idx_tjs] = pgon_i;
        }
    }
    // create the mesh, assigning the material
    return [new THREE.Mesh(geom_tjs, mat_tjs), idx_to_pgon_i];
}
exports.createSingleMeshTjs = createSingleMeshTjs;
function createSingleMeshBufTjs(__model__, ents_arrs) {
    // Note that for meshes, faces must be pointed towards the origin of the ray in order to be detected;
    // intersections of the ray passing through the back of a face will not be detected.
    // To raycast against both faces of an object, you'll want to set the material's side property to THREE.DoubleSide.
    const mat_tjs = new THREE.MeshBasicMaterial();
    mat_tjs.side = THREE.DoubleSide;
    // get all unique posis
    const posis_i_set = new Set();
    for (const [ent_type, ent_i] of ents_arrs) {
        const ent_posis_i = __model__.modeldata.geom.nav.navAnyToPosi(ent_type, ent_i);
        ent_posis_i.forEach(ent_posi_i => posis_i_set.add(ent_posi_i));
    }
    // create a flat list of xyz coords
    const xyzs_flat = [];
    const posi_i_to_xyzs_map = new Map();
    const unique_posis_i = Array.from(posis_i_set);
    for (let i = 0; i < unique_posis_i.length; i++) {
        const posi_i = unique_posis_i[i];
        const xyz = __model__.modeldata.attribs.posis.getPosiCoords(posi_i);
        xyzs_flat.push(...xyz);
        posi_i_to_xyzs_map.set(posi_i, i);
    }
    // get an array of all the pgons
    const pgons_i = [];
    for (const [ent_type, ent_i] of ents_arrs) {
        switch (ent_type) {
            case common_1.EEntType.PGON:
                pgons_i.push(ent_i);
                break;
            default:
                const coll_pgons_i = __model__.modeldata.geom.nav.navAnyToPgon(ent_type, ent_i);
                coll_pgons_i.forEach(coll_pgon_i => pgons_i.push(coll_pgon_i));
                break;
        }
    }
    // create tjs meshes
    const tris_flat = [];
    for (const pgon_i of pgons_i) {
        // create the tjs geometry
        const tris_i = __model__.modeldata.geom.nav_tri.navPgonToTri(pgon_i);
        for (const tri_i of tris_i) {
            const tri_posis_i = __model__.modeldata.geom.nav_tri.navTriToPosi(tri_i);
            tris_flat.push(posi_i_to_xyzs_map.get(tri_posis_i[0]));
            tris_flat.push(posi_i_to_xyzs_map.get(tri_posis_i[1]));
            tris_flat.push(posi_i_to_xyzs_map.get(tri_posis_i[2]));
        }
        // create the mesh, assigning the material
    }
    const geom_tjs = new THREE.BufferGeometry();
    geom_tjs.setIndex(tris_flat);
    // geom_tjs.addAttribute( 'position', new THREE.Float32BufferAttribute( xyzs_flat, 3 ) );
    geom_tjs.setAttribute('position', new THREE.Float32BufferAttribute(xyzs_flat, 3));
    return new THREE.Mesh(geom_tjs, mat_tjs);
}
exports.createSingleMeshBufTjs = createSingleMeshBufTjs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW9tL21lc2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBRS9CLCtDQUFpRTtBQUVqRSxPQUFPO0FBQ1AsbUdBQW1HO0FBQ25HLDhGQUE4RjtBQUM5RiwwRkFBMEY7QUFDMUYsNEVBQTRFO0FBQzVFLGdEQUFnRDtBQUNoRCxPQUFPO0FBRVAsU0FBZ0IsdUJBQXVCLENBQUMsU0FBa0IsRUFBRSxTQUF3QjtJQUNoRixxR0FBcUc7SUFDckcsb0ZBQW9GO0lBQ3BGLG1IQUFtSDtJQUNuSCxNQUFNLE9BQU8sR0FBbUIsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUM5RCxPQUFPLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7SUFDaEMsdUJBQXVCO0lBQ3ZCLE1BQU0sV0FBVyxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzNDLEtBQUssTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxTQUFTLEVBQUU7UUFDdkMsTUFBTSxXQUFXLEdBQWEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekYsV0FBVyxDQUFDLE9BQU8sQ0FBRSxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUUsQ0FBQztLQUNwRTtJQUNELG1FQUFtRTtJQUNuRSx1Q0FBdUM7SUFDdkMsTUFBTSxTQUFTLEdBQW9CLEVBQUUsQ0FBQztJQUN0QyxLQUFLLE1BQU0sTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDMUMsTUFBTSxHQUFHLEdBQVMsU0FBUyxDQUFD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