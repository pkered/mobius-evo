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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zcmMvbW9kZWwvcHJvY2VkdXJlL3R5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBWSxjQTRCWDtBQTVCRCxXQUFZLGNBQWM7SUFDdEIsMkRBQVEsQ0FBQTtJQUNSLCtDQUFFLENBQUE7SUFDRix1REFBTSxDQUFBO0lBQ04sbURBQUksQ0FBQTtJQUNKLHlEQUFPLENBQUE7SUFDUCxxREFBSyxDQUFBO0lBQ0wscURBQUssQ0FBQTtJQUNMLDJEQUFRLENBQUE7SUFFUixtRUFBWSxDQUFBO0lBQ1osdUVBQWMsQ0FBQTtJQUVkLDREQUFRLENBQUE7SUFDUiw4REFBUyxDQUFBO0lBRVQsMERBQU8sQ0FBQTtJQUVQLHNEQUFLLENBQUE7SUFFTCwwREFBTyxDQUFBO0lBQ1AsOERBQVMsQ0FBQTtJQUVULG9FQUFZLENBQUE7SUFDWix3REFBTSxDQUFBO0lBQ04sc0VBQWEsQ0FBQTtJQUViLHNEQUFLLENBQUEsQ0FBQyxLQUFLO0FBQ2YsQ0FBQyxFQTVCVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQTRCekIifQ==