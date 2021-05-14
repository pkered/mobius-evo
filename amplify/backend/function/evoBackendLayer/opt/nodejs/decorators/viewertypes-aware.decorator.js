"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const port_1 = require("../model/port");
function ViewerTypesAware(constructor) {
    constructor.prototype.ViewerTypes = port_1.OutputType;
    // array form
    const keys = Object.keys(port_1.OutputType);
    constructor.prototype.ViewerTypesArr = keys.slice(keys.length / 2);
}
exports.ViewerTypesAware = ViewerTypesAware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld2VydHlwZXMtYXdhcmUuZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9kZWNvcmF0b3JzL3ZpZXdlcnR5cGVzLWF3YXJlLmRlY29yYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUEyQztBQUUzQyxTQUFnQixnQkFBZ0IsQ0FBQyxXQUFxQjtJQUNsRCxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxpQkFBVSxDQUFDO0lBRS9DLGFBQWE7SUFDYixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFVLENBQUMsQ0FBQztJQUNyQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkUsQ0FBQztBQU5ELDRDQU1DIn0=