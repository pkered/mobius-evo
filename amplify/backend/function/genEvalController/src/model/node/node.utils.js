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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NyYy9tb2RlbC9ub2RlL25vZGUudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBc0Q7QUFDdEQsMkNBQTZDO0FBQzdDLHVDQUEwQztBQUMxQyxpREFBOEM7QUFDOUMsZ0RBQXFEO0FBRXJELE1BQXNCLFNBQVM7SUFFM0IsTUFBTSxDQUFDLFVBQVU7UUFDYixNQUFNLElBQUksR0FBaUI7WUFDdkIsSUFBSSxFQUFFLE1BQU07WUFDWixFQUFFLEVBQUUsbUJBQVcsQ0FBQyxTQUFTLEVBQUU7WUFDM0IsUUFBUSxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO1lBQ3RCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsSUFBSSxFQUFFLEVBQUU7WUFDUixTQUFTLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7b0JBQ3pCLE1BQU0sRUFBRSxTQUFTO29CQUNqQixJQUFJLEVBQUUsRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUM7b0JBQzVCLFFBQVEsRUFBRSxTQUFTO29CQUNuQixRQUFRLEVBQUUsU0FBUztvQkFDbkIsUUFBUSxFQUFFLENBQUM7b0JBQ1gsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osT0FBTyxFQUFFLElBQUk7b0JBQ2IsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQztZQUNyQixTQUFTLEVBQUUsQ0FBQyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLGtCQUFrQjtvQkFDekMsTUFBTSxFQUFFLFNBQVM7b0JBQ2pCLElBQUksRUFBRSxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVB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