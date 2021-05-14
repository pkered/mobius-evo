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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydHR5cGVzLWF3YXJlLmRlY29yYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvZGVjb3JhdG9ycy9wb3J0dHlwZXMtYXdhcmUuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQTBDO0FBRTFDLFNBQWdCLGNBQWMsQ0FBQyxXQUFxQjtJQUNoRCxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxnQkFBUyxDQUFDO0lBRTVDLGFBQWE7SUFDYixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFTLENBQUMsQ0FBQztJQUNwQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQU5ELHdDQU1DIn0=