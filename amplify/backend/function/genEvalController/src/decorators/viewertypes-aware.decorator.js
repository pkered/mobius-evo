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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld2VydHlwZXMtYXdhcmUuZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvc3JjL2RlY29yYXRvcnMvdmlld2VydHlwZXMtYXdhcmUuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQTJDO0FBRTNDLFNBQWdCLGdCQUFnQixDQUFDLFdBQXFCO0lBQ2xELFdBQVcsQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLGlCQUFVLENBQUM7SUFFL0MsYUFBYTtJQUNiLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQVUsQ0FBQyxDQUFDO0lBQ3JDLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RSxDQUFDO0FBTkQsNENBTUMifQ==