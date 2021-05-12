"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Maps a number from the d1 domain to the d2 domain.
 * @param num
 * @param d1
 * @param d2
 */
function remap(debug, num, d1, d2) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('remap', arguments, 3);
    }
    if (Array.isArray(num)) {
        return num.map(num_val => remap(debug, num_val, d1, d2));
    }
    return (d2[0] +
        (((num - d1[0]) / (d1[1] - d1[0])) * (d2[1] - d2[0])));
}
exports.remap = remap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2FyaXRobWV0aWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvaW5saW5lL19hcml0aG1ldGljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOERBQXFEO0FBRXJEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLEtBQWMsRUFBRSxHQUFvQixFQUFFLEVBQVksRUFBRSxFQUFZO0lBQ2xGLElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFhLENBQUM7S0FBRTtJQUNqRyxPQUFPLENBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNWLENBQ0ksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN0RCxDQUNKLENBQUM7QUFDTixDQUFDO0FBVkQsc0JBVUMifQ==