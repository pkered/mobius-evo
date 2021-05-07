"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const procedure_1 = require("../../model/procedure");
const port_1 = require("../../model/port");
const utils_1 = require("../../utils");
const decorators_1 = require("../../decorators");
const modules_1 = require("../../core/modules");
class NodeUtils {
    static getNewNode() {
        const node = {
            name: 'Node',
            id: utils_1.IdGenerator.getNodeID(),
            position: { x: 0, y: 0 },
            enabled: false,
            type: '',
            procedure: [{ type: 13, ID: '',
                    parent: undefined,
                    meta: { name: '', module: '' },
                    variable: undefined,
                    children: undefined,
                    argCount: 0,
                    args: [],
                    print: false,
                    enabled: true,
                    selected: false,
                    selectGeom: false,
                    hasError: false }],
            localFunc: [{ type: 13, ID: 'local_func_blank',
                    parent: undefined,
                    meta: { name: '', module: '' },
                    variable: undefined,
                    children: undefined,
                    argCount: 0,
                    args: [],
                    print: false,
                    enabled: true,
                    selected: false,
                    selectGeom: false,
                    hasError: false }],
            state: {
                procedure: [],
                show_code: true,
                show_func: true
            },
            input: port_1.PortUtils.getNewInput(),
            output: port_1.PortUtils.getNewOutput()
        };
        node.input.parentNode = node;
        node.output.parentNode = node;
        return node;
    }
    static getStartNode() {
        const node = NodeUtils.getNewNode();
        // node.procedure = [];
        node.enabled = true;
        node.state.show_code = false;
        node.state.show_func = false;
        node.name = 'Start';
        node.type = 'start';
        return node;
    }
    static getEndNode() {
        const node = NodeUtils.getNewNode();
        const returnMeta = modules_1._parameterTypes.return.split('.');
        let check = false;
        for (const i of decorators_1.ModuleList) {
            if (i.module !== returnMeta[0]) {
                continue;
            }
            for (const j of i.functions) {
                if (j.name !== returnMeta[1]) {
                    continue;
                }
                const newReturn = {
                    type: procedure_1.ProcedureTypes.EndReturn,
                    ID: 'Return',
                    parent: undefined,
                    meta: { name: '', module: '' },
                    children: undefined,
                    variable: undefined,
                    argCount: j.argCount,
                    args: j.args,
                    print: false,
                    enabled: true,
                    selected: false,
                    terminate: false,
                    hasError: false
                };
                for (const arg of newReturn.args) {
                    arg.value = '';
                    arg.jsValue = '';
                }
                node.procedure.push(newReturn);
                check = true;
                break;
            }
            break;
        }
        if (!check) {
            console.log('CORE FUNCTION ERROR: Unable to retrieve return procedure, please check "Return" in _ParameterTypes.ts');
        }
        // node.procedure = [];
        node.name = 'End';
        node.type = 'end';
        return node;
    }
}
exports.NodeUtils = NodeUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbW9kZWwvbm9kZS9ub2RlLnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscURBQXNEO0FBQ3RELDJDQUE2QztBQUM3Qyx1Q0FBMEM7QUFDMUMsaURBQThDO0FBQzlDLGdEQUFxRDtBQUVyRCxNQUFzQixTQUFTO0lBRTNCLE1BQU0sQ0FBQyxVQUFVO1FBQ2IsTUFBTSxJQUFJLEdBQWlCO1lBQ3ZCLElBQUksRUFBRSxNQUFNO1lBQ1osRUFBRSxFQUFFLG1CQUFXLENBQUMsU0FBUyxFQUFFO1lBQzNCLFFBQVEsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQztZQUN0QixPQUFPLEVBQUUsS0FBSztZQUNkLElBQUksRUFBRSxFQUFFO1lBQ1IsU0FBUyxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO29CQUN6QixNQUFNLEVBQUUsU0FBUztvQkFDakIsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFDO29CQUM1QixRQUFRLEVBQUUsU0FBUztvQkFDbkIsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLFFBQVEsRUFBRSxDQUFDO29CQUNYLElBQUksRUFBRSxFQUFFO29CQUNSLEtBQUssRUFBRSxLQUFLO29CQUNaLE9BQU8sRUFBRSxJQUFJO29CQUNiLFFBQVEsRUFBRSxLQUFLO29CQUNmLFVBQVUsRUFBRSxLQUFLO29CQUNqQixRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUM7WUFDckIsU0FBUyxFQUFFLENBQUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0I7b0JBQ3pDLE1BQU0sRUFBRSxTQUFTO29CQUNqQixJQUFJLEVBQUUs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