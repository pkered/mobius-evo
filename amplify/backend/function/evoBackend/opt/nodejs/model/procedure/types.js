"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProcedureTypes;
(function (ProcedureTypes) {
    ProcedureTypes[ProcedureTypes["Variable"] = 0] = "Variable";
    ProcedureTypes[ProcedureTypes["If"] = 1] = "If";
    ProcedureTypes[ProcedureTypes["Elseif"] = 2] = "Elseif";
    ProcedureTypes[ProcedureTypes["Else"] = 3] = "Else";
    ProcedureTypes[ProcedureTypes["Foreach"] = 4] = "Foreach";
    ProcedureTypes[ProcedureTypes["While"] = 5] = "While";
    ProcedureTypes[ProcedureTypes["Break"] = 6] = "Break";
    ProcedureTypes[ProcedureTypes["Continue"] = 7] = "Continue";
    ProcedureTypes[ProcedureTypes["MainFunction"] = 8] = "MainFunction";
    ProcedureTypes[ProcedureTypes["globalFuncCall"] = 9] = "globalFuncCall";
    ProcedureTypes[ProcedureTypes["Constant"] = 10] = "Constant";
    ProcedureTypes[ProcedureTypes["EndReturn"] = 11] = "EndReturn";
    ProcedureTypes[ProcedureTypes["AddData"] = 12] = "AddData";
    ProcedureTypes[ProcedureTypes["Blank"] = 13] = "Blank";
    ProcedureTypes[ProcedureTypes["Comment"] = 14] = "Comment";
    ProcedureTypes[ProcedureTypes["Terminate"] = 15] = "Terminate";
    ProcedureTypes[ProcedureTypes["LocalFuncDef"] = 16] = "LocalFuncDef";
    ProcedureTypes[ProcedureTypes["Return"] = 17] = "Return";
    ProcedureTypes[ProcedureTypes["LocalFuncCall"] = 18] = "LocalFuncCall";
    ProcedureTypes[ProcedureTypes["Error"] = 19] = "Error"; // 19
})(ProcedureTypes = exports.ProcedureTypes || (exports.ProcedureTypes = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL21vZGVsL3Byb2NlZHVyZS90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQVksY0E0Qlg7QUE1QkQsV0FBWSxjQUFjO0lBQ3RCLDJEQUFRLENBQUE7SUFDUiwrQ0FBRSxDQUFBO0lBQ0YsdURBQU0sQ0FBQTtJQUNOLG1EQUFJLENBQUE7SUFDSix5REFBTyxDQUFBO0lBQ1AscURBQUssQ0FBQTtJQUNMLHFEQUFLLENBQUE7SUFDTCwyREFBUSxDQUFBO0lBRVIsbUVBQVksQ0FBQTtJQUNaLHVFQUFjLENBQUE7SUFFZCw0REFBUSxDQUFBO0lBQ1IsOERBQVMsQ0FBQTtJQUVULDBEQUFPLENBQUE7SUFFUCxzREFBSyxDQUFBO0lBRUwsMERBQU8sQ0FBQTtJQUNQLDhEQUFTLENBQUE7SUFFVCxvRUFBWSxDQUFBO0lBQ1osd0RBQU0sQ0FBQTtJQUNOLHNFQUFhLENBQUE7SUFFYixzREFBSyxDQUFBLENBQUMsS0FBSztBQUNmLENBQUMsRUE1QlcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUE0QnpCIn0=