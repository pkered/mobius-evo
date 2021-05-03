"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const procedure_1 = require("../model/procedure");
function ProcedureTypesAware(constructor) {
    constructor.prototype.ProcedureTypes = procedure_1.ProcedureTypes;
    // array form
    const keys = Object.keys(procedure_1.ProcedureTypes);
    constructor.prototype.ProcedureTypesArr = keys.slice(keys.length / 2);
}
exports.ProcedureTypesAware = ProcedureTypesAware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHR5cGVzLWF3YXJlLmRlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3NyYy9kZWNvcmF0b3JzL3Byb2R0eXBlcy1hd2FyZS5kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBb0Q7QUFFcEQsU0FBZ0IsbUJBQW1CLENBQUMsV0FBcUI7SUFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsMEJBQWMsQ0FBQztJQUV0RCxhQUFhO0lBQ2IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBYyxDQUFDLENBQUM7SUFDekMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUUsQ0FBQztBQU5ELGtEQU1DIn0=