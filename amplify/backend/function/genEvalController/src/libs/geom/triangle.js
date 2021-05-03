"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const EPS = 1e-6;
function normal(v1, v2, v3, norm = false) {
    const _v1 = new three_1.Vector3(...v1);
    const _v2 = new three_1.Vector3(...v2);
    const _v3 = new three_1.Vector3(...v3);
    const t = new three_1.Triangle(_v1, _v2, _v3);
    const _normal = new three_1.Vector3();
    t.getNormal(_normal);
    if (norm) {
        _normal.normalize();
    }
    return _normal.toArray();
}
exports.normal = normal;
function area(v1, v2, v3) {
    const _v1 = new three_1.Vector3(...v1);
    const _v2 = new three_1.Vector3(...v2);
    const _v3 = new three_1.Vector3(...v3);
    const t = new three_1.Triangle(_v1, _v2, _v3);
    return t.getArea();
}
exports.area = area;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpYW5nbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zcmMvbGlicy9nZW9tL3RyaWFuZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsaUNBQTBDO0FBRTFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUVqQixTQUFnQixNQUFNLENBQUMsRUFBUSxFQUFFLEVBQVEsRUFBRSxFQUFRLEVBQUUsT0FBZ0IsS0FBSztJQUN0RSxNQUFNLEdBQUcsR0FBa0IsSUFBSSxlQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM5QyxNQUFNLEdBQUcsR0FBa0IsSUFBSSxlQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM5QyxNQUFNLEdBQUcsR0FBa0IsSUFBSSxlQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM5QyxNQUFNLENBQUMsR0FBbUIsSUFBSSxnQkFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEQsTUFBTSxPQUFPLEdBQWtCLElBQUksZUFBTyxFQUFFLENBQUM7SUFDN0MsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQixJQUFJLElBQUksRUFBRTtRQUNOLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUN2QjtJQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBVSxDQUFDO0FBQ3JDLENBQUM7QUFYRCx3QkFXQztBQUVELFNBQWdCLElBQUksQ0FBQyxFQUFRLEVBQUUsRUFBUSxFQUFFLEVBQVE7SUFDN0MsTUFBTSxHQUFHLEdBQWtCLElBQUksZUFBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxHQUFHLEdBQWtCLElBQUksZUFBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxHQUFHLEdBQWtCLElBQUksZUFBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLEdBQW1CLElBQUksZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFORCxvQkFNQyJ9