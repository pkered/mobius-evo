"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vectors_1 = require("./vectors");
function intersect(r1, r2, met = 2) {
    // function isInRange(num: number, range: [number, number]) {
    //     const range2: [number, number] = range[0] < range[1] ? range : [range[1], range[0]];
    //     if ((num < range2[0]) || (num > range2[1])) { return false; }
    //     return true;
    // }
    // // TODO
    // // This has problems with rounding errors
    // // Especially when lines are orthogonal
    // function isOnLineSegment(coord: Txyz, start: Txyz, end: Txyz): boolean {
    //     const x_range: [number, number] = [start[0], end[0]];
    //     if (!isInRange(coord[0], x_range)) { return false; }
    //     const y_range: [number, number] = [start[1], end[1]];
    //     if (!isInRange(coord[1], y_range)) { return false; }
    //     const z_range: [number, number] = [start[2], end[2]];
    //     if (!isInRange(coord[2], z_range)) { return false; }
    //     return true;
    // }
    // // TODO
    // // This has problems with rounding errors
    // // Especially when lines are orthogonal
    // function isOnRay(coord: Txyz, start: Txyz, end: Txyz): boolean {
    //     const x_range: [number, number] = [start[0], null];
    //     x_range[1] = start[0] === end[0] ? end[0] : start[0] < end[0] ? Infinity : -Infinity;
    //     if (!isInRange(coord[0], x_range)) { return false; }
    //     const y_range: [number, number] = [start[1], null];
    //     y_range[1] = start[1] === end[1] ? end[1] : start[1] < end[1] ? Infinity : -Infinity;
    //     if (!isInRange(coord[1], y_range)) { return false; }
    //     const z_range: [number, number] = [start[2], null];
    //     z_range[1] = start[2] === end[2] ? end[2] : start[2] < end[2] ? Infinity : -Infinity;
    //     if (!isInRange(coord[2], z_range)) { return false; }
    //     return true;
    // }
    if (r2.length === 2) {
        return intersectRayRay(r1, r2, met);
        // const p0: Txyz = r1[0];
        // const p1: Txyz = vecAdd(r1[0], r1[1]);
        // const p2: Txyz = r2[0];
        // const p3: Txyz = vecAdd(r2[0], r2[1]);
        // const isect: Txyz = mathjs.intersect(p0, p1, p2, p3 );
        // if (isect) {
        //     if (met === 2)  {
        //         return isect;
        //     } else if (met === 1) {
        //         if (isOnRay(isect, p0, p1) && isOnRay(isect, p2, p3)) { return isect; }
        //     } else if (met === 0) {
        //         if (isOnLineSegment(isect, p0, p1) && isOnLineSegment(isect, p2, p3)) { return isect; }
        //     } else {
        //         throw new Error('Error calculating intersection. Intersection method not valid. Must be 0, 1, or 2.');
        //     }
        // }
        // return null;
    }
    else if (r2.length === 3) {
        return intersectRayPlane(r1, r2, met);
        // const p0: Txyz = r1[0];
        // const p1: Txyz = vecAdd(r1[0], r1[1]);
        // const [a, b, c]: Txyz = vecCross(r2[1], r2[2]);
        // const [x1, y1, z1]: Txyz = r2[0];
        // const d: number = a * x1 + b * y1 + c * z1;
        // const isect: Txyz = mathjs.intersect(r1[0], vecAdd(r1[0], r1[1]), [a, b, c, d] );
        // if (isect) {
        //     if (met === 2)  {
        //         return isect;
        //     } else if (met === 1) {
        //         if (isOnRay(isect, p0, p1)) { return isect; }
        //     } else if (met === 0) {
        //         if (isOnLineSegment(isect, p0, p1)) { return isect; }
        //     } else {
        //         throw new Error('Error calculating intersection. Intersection method not valid. Must be 0, 1, or 2.');
        //     }
        // }
        // return null;
    }
    else {
        throw new Error('Error calculating intersection. Elements to intersect must be either rays or planes.');
    }
}
exports.intersect = intersect;
function intersectRayRay(r1, r2, met) {
    const dc = vectors_1.vecFromTo(r1[0], r2[0]);
    const da = r1[1];
    const db = r2[1];
    if (vectors_1.vecDot(dc, vectors_1.vecCross(da, db)) !== 0) {
        return null;
    }
    const da_x_db = vectors_1.vecCross(da, db);
    const da_x_db_norm2 = (da_x_db[0] * da_x_db[0]) + (da_x_db[1] * da_x_db[1]) + (da_x_db[2] * da_x_db[2]);
    if (da_x_db_norm2 === 0) {
        return null;
    }
    const s = vectors_1.vecDot(vectors_1.vecCross(dc, db), da_x_db) / da_x_db_norm2;
    const t = vectors_1.vecDot(vectors_1.vecCross(dc, da), da_x_db) / da_x_db_norm2;
    switch (met) {
        case 2:
            return vectors_1.vecAdd(r1[0], vectors_1.vecMult(da, s));
        case 1:
            if ((s >= 0) && (t >= 0)) {
                return vectors_1.vecAdd(r1[0], vectors_1.vecMult(da, s));
            }
            return null;
        case 0:
            if ((s >= 0 && s <= 1) && (t >= 0 && t <= 1)) {
                return vectors_1.vecAdd(r1[0], vectors_1.vecMult(da, s));
            }
            return null;
        default:
            return null;
    }
}
exports.intersectRayRay = intersectRayRay;
function intersectRayPlane(r, p, met) {
    const normal = vectors_1.vecCross(p[1], p[2]);
    const normal_dot_r = vectors_1.vecDot(normal, r[1]);
    if (normal_dot_r === 0) {
        return null;
    }
    const u = vectors_1.vecDot(normal, vectors_1.vecFromTo(r[0], p[0])) / normal_dot_r;
    switch (met) {
        case 2:
            return vectors_1.vecAdd(r[0], vectors_1.vecMult(r[1], u));
        case 1:
            if (u >= 0) {
                return vectors_1.vecAdd(r[0], vectors_1.vecMult(r[1], u));
            }
            return null;
        case 0:
            if (u >= 0 && u <= 1) {
                return vectors_1.vecAdd(r[0], vectors_1.vecMult(r[1], u));
            }
            return null;
        default:
            return null;
    }
}
exports.intersectRayPlane = intersectRayPlane;
function project(c, r, met = 2) {
    if (r.length === 2) {
        return projectCoordOntoRay(c, r, met);
        // const tjs_point_proj: three.Vector3 = new three.Vector3(c[0], c[1], c[2]);
        // const tjs_origin: three.Vector3 =  new three.Vector3(r[0][0], r[0][1], r[0][2]);
        // const p2: Txyz = vecAdd(r[0], r[1]);
        // const tjs_point2: three.Vector3 =  new three.Vector3(p2[0], p2[1], p2[2]);
        // const tjs_new_point: three.Vector3 = new three.Vector3();
        // const tjs_line: three.Line3 = new three.Line3(tjs_origin, tjs_point2);
        // // project
        // tjs_line.closestPointToPoint( tjs_point_proj, false, tjs_new_point );
        // return [tjs_new_point.x, tjs_new_point.y, tjs_new_point.z];
    }
    else if (r.length === 3) {
        return projectCoordOntoPlane(c, r);
        // const tjs_point_proj: three.Vector3 = new three.Vector3(c[0], c[1], c[2]);
        // const tjs_new_point: three.Vector3 = new three.Vector3();
        // const normal: Txyz = vecCross(r[1], r[2]);
        // const tjs_normal: three.Vector3 = new three.Vector3(normal[0], normal[1], normal[2]);
        // const tjs_origin: three.Vector3 = new three.Vector3(r[0][0], r[0][1], r[0][2]);
        // const tjs_plane: three.Plane = new three.Plane();
        // // project
        // tjs_plane.setFromNormalAndCoplanarPoint( tjs_normal, tjs_origin );
        // tjs_plane.projectPoint(tjs_point_proj, tjs_new_point);
        // return [tjs_new_point.x, tjs_new_point.y, tjs_new_point.z];
    }
    else {
        throw new Error('Error calculating projection. Projection must be onto either rays or planes.');
    }
}
exports.project = project;
function projectCoordOntoRay(c, r, met) {
    const vec = vectors_1.vecFromTo(r[0], c);
    const dot = vectors_1.vecDot(vec, vectors_1.vecNorm(r[1]));
    switch (met) {
        case 2:
            return vectors_1.vecAdd(r[0], vectors_1.vecSetLen(r[1], dot));
        case 1:
            if (dot <= 0) {
                return r[0].slice();
            }
            return vectors_1.vecAdd(r[0], vectors_1.vecSetLen(r[1], dot));
        case 0:
            const length = vectors_1.vecLen(r[1]);
            if (dot <= 0) {
                return r[0].slice();
            }
            else if (dot >= length) {
                return vectors_1.vecAdd(r[0], r[1]);
            }
            return vectors_1.vecAdd(r[0], vectors_1.vecSetLen(r[1], dot));
        default:
            return null;
    }
}
exports.projectCoordOntoRay = projectCoordOntoRay;
function projectCoordOntoPlane(c, p) {
    const vec_to_c = vectors_1.vecFromTo(p[0], c);
    const pln_z_vec = vectors_1.vecCross(p[1], p[2]);
    const vec_a = vectors_1.vecCross(vec_to_c, pln_z_vec);
    if (vectors_1.vecLen(vec_a) === 0) {
        return p[0].slice();
    }
    const vec_b = vectors_1.vecCross(vec_a, pln_z_vec);
    const dot = vectors_1.vecDot(vec_to_c, vectors_1.vecNorm(vec_b));
    return vectors_1.vecAdd(p[0], vectors_1.vecSetLen(vec_b, dot));
}
exports.projectCoordOntoPlane = projectCoordOntoPlane;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJzZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvc3JjL2xpYnMvZ2VvbS9pbnRlcnNlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSx1Q0FBcUc7QUFNckcsU0FBZ0IsU0FBUyxDQUFDLEVBQVEsRUFBRSxFQUFlLEVBQUUsTUFBYyxDQUFDO0lBQ2hFLDZEQUE2RDtJQUM3RCwyRkFBMkY7SUFDM0Ysb0VBQW9FO0lBQ3BFLG1CQUFtQjtJQUNuQixJQUFJO0lBQ0osVUFBVTtJQUNWLDRDQUE0QztJQUM1QywwQ0FBMEM7SUFDMUMsMkVBQTJFO0lBQzNFLDREQUE0RDtJQUM1RCwyREFBMkQ7SUFDM0QsNERBQTREO0lBQzVELDJEQUEyRDtJQUMzRCw0REFBNEQ7SUFDNUQsMkRBQTJEO0lBQzNELG1CQUFtQjtJQUNuQixJQUFJO0lBQ0osVUFBVTtJQUNWLDRDQUE0QztJQUM1QywwQ0FBMEM7SUFDMUMsbUVBQW1FO0lBQ25FLDBEQUEwRDtJQUMxRCw0RkFBNEY7SUFDNUYsMkRBQTJEO0lBQzNELDBEQUEwRDtJQUMxRCw0RkFBNEY7SUFDNUYsMkRBQTJEO0lBQzNELDBEQUEwRDtJQUMxRCw0RkFBNEY7SUFDNUYsMkRBQTJEO0lBQzNELG1CQUFtQjtJQUNuQixJQUFJO0lBQ0osSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqQixPQUFPLGVBQWUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLDBCQUEwQjtRQUMxQix5Q0FBeUM7UUFDekMsMEJBQTBCO1FBQzFCLHlDQUF5QztRQUN6Qyx5REFBeUQ7UUFDekQsZUFBZTtRQUNmLHdCQUF3QjtRQUN4Qix3QkFBd0I7UUFDeEIsOEJBQThCO1FBQzlCLGtGQUFrRjtRQUNsRiw4QkFBOEI7UUFDOUIsa0dBQWtHO1FBQ2xHLGVBQWU7UUFDZixpSEFBaUg7UUFDakgsUUFBUTtRQUNSLElBQUk7UUFDSixlQUFlO0tB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QUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3QyxNQUFNLEtBQUssR0FBUyxrQkFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNsRCxJQUFJLGdCQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFVLENBQUM7S0FBRTtJQUN6RCxNQUFNLEtBQUssR0FBUyxrQkFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvQyxNQUFNLEdBQUcsR0FBVyxnQkFBTSxDQUFDLFFBQVEsRUFBRSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsT0FBTyxnQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxtQkFBUyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFSRCxzREFRQyJ9