"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("../model/port");
function PortTypesAware(constructor) {
    constructor.prototype.PortTypes = port_1.InputType;
    // array form
    const keys = Object.keys(port_1.InputType);
    constructor.prototype.PortTypesArr = keys.slice(keys.length / 2);
}
exports.PortTypesAware = PortTypesAware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydHR5cGVzLWF3YXJlLmRlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3NyYy9kZWNvcmF0b3JzL3BvcnR0eXBlcy1hd2FyZS5kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3Q0FBMEM7QUFFMUMsU0FBZ0IsY0FBYyxDQUFDLFdBQXFCO0lBQ2hELFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLGdCQUFTLENBQUM7SUFFNUMsYUFBYTtJQUNiLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQVMsQ0FBQyxDQUFDO0lBQ3BDLFdBQVcsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDO0FBTkQsd0NBTUMifQ==