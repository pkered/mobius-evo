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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydC51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NyYy9tb2RlbC9wb3J0L3BvcnQudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBMEQ7QUFHMUQsTUFBYSxTQUFTO0lBRWxCLE1BQU0sQ0FBQyxXQUFXO1FBQ2QsTUFBTSxHQUFHLEdBQTJCO1lBQ2hDLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxFQUFFLGdCQUFRLENBQUMsS0FBSztZQUNwQixLQUFLLEVBQUUsU0FBUztZQUNoQixLQUFLLEVBQUUsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDRixJQUFJLEVBQUUsaUJBQVMsQ0FBQyxXQUFXO2dCQUMzQixJQUFJLEVBQUUsRUFBRTthQUNYO1NBQ0osQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZO1FBQ2YsTUFBTSxHQUFHLEdBQTZCO1lBQ2xDLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLGdCQUFRLENBQUMsTUFBTTtZQUNyQixLQUFLLEVBQUUsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDRixJQUFJLEVBQUUsa0JBQVUsQ0FBQyxJQUFJO2FBQ3hCO1NBQ0osQ0FBQztRQUNGLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUVKO0FBN0JELDhCQTZCQyJ9