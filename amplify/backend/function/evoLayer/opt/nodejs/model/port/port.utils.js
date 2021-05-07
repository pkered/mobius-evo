"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class PortUtils {
    static getNewInput() {
        const inp = {
            name: 'input',
            type: types_1.PortType.Input,
            value: undefined,
            edges: [],
            meta: {
                mode: types_1.InputType.SimpleInput,
                opts: {}
            }
        };
        return inp;
    }
    static getNewOutput() {
        const oup = {
            name: 'output',
            type: types_1.PortType.Output,
            edges: [],
            meta: {
                mode: types_1.OutputType.Text,
            }
        };
        return oup;
    }
}
exports.PortUtils = PortUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydC51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbW9kZWwvcG9ydC9wb3J0LnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQTBEO0FBRzFELE1BQWEsU0FBUztJQUVsQixNQUFNLENBQUMsV0FBVztRQUNkLE1BQU0sR0FBRyxHQUEyQjtZQUNoQyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxnQkFBUSxDQUFDLEtBQUs7WUFDcEIsS0FBSyxFQUFFLFNBQVM7WUFDaEIsS0FBSyxFQUFFLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLGlCQUFTLENBQUMsV0FBVztnQkFDM0IsSUFBSSxFQUFFLEVBQUU7YUFDWDtTQUNKLENBQUM7UUFFRixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBWTtRQUNmLE1BQU0sR0FBRyxHQUE2QjtZQUNsQyxJQUFJLEVBQUUsUUFBUTtZQUNkLElBQUksRUFBRSxnQkFBUSxDQUFDLE1BQU07WUFDckIsS0FBSyxFQUFFLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLGtCQUFVLENBQUMsSUFBSTthQUN4QjtTQUNKLENBQUM7UUFDRixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FFSjtBQTdCRCw4QkE2QkMifQ==