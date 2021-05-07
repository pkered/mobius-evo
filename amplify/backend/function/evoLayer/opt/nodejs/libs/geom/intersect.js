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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJzZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9saWJzL2dlb20vaW50ZXJzZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsdUNBQXFHO0FBTXJHLFNBQWdCLFNBQVMsQ0FBQyxFQUFRLEVBQUUsRUFBZSxFQUFFLE1BQWMsQ0FBQztJQUNoRSw2REFBNkQ7SUFDN0QsMkZBQTJGO0lBQzNGLG9FQUFvRTtJQUNwRSxtQkFBbUI7SUFDbkIsSUFBSTtJQUNKLFVBQVU7SUFDViw0Q0FBNEM7SUFDNUMsMENBQTBDO0lBQzFDLDJFQUEyRTtJQUMzRSw0REFBNEQ7SUFDNUQsMkRBQTJEO0lBQzNELDREQUE0RDtJQUM1RCwyREFBMkQ7SUFDM0QsNERBQTREO0lBQzVELDJEQUEyRDtJQUMzRCxtQkFBbUI7SUFDbkIsSUFBSTtJQUNKLFVBQVU7SUFDViw0Q0FBNEM7SUFDNUMsMENBQTBDO0lBQzFDLG1FQUFtRTtJQUNuRSwwREFBMEQ7SUFDMUQsNEZBQTRGO0lBQzVGLDJEQUEyRDtJQUMzRCwwREFBMEQ7SUFDMUQsNEZBQTRGO0lBQzVGLDJEQUEyRDtJQUMzRCwwREFBMEQ7SUFDMUQsNEZBQTRGO0lBQzVGLDJEQUEyRDtJQUMzRCxtQkFBbUI7SUFDbkIsSUFBSTtJQUNKLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDakIsT0FBTyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNwQywwQkFBMEI7UUFDMUIseUNBQXlDO1FBQ3pDLDBCQUEwQjtRQUMxQix5Q0FBeUM7UUFDekMseURBQXlEO1FBQ3pELGVBQWU7UUFDZix3QkFBd0I7UUFDeEIsd0JBQXdCO1FBQ3hCLDhCQUE4QjtRQUM5QixrRkFBa0Y7UUFDbEYsOEJBQThCO1FBQzlCLGtHQUFrRztRQUNsRyxlQUFlO1FBQ2YsaUhB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QUFDLENBQUM7SUFDMUMsTUFBTSxTQUFTLEdBQVMsa0JBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTSxLQUFLLEdBQVMsa0JBQVEsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbEQsSUFBSSxnQkFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBVSxDQUFDO0tBQUU7SUFDekQsTUFBTSxLQUFLLEdBQVMsa0JBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDL0MsTUFBTSxHQUFHLEdBQVcsZ0JBQU0sQ0FBQyxRQUFRLEVBQUUsaUJBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sZ0JBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsbUJBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBUkQsc0RBUUMifQ==