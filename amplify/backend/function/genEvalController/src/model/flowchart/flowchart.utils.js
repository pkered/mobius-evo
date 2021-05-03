"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flowchart_interface_1 = require("./flowchart.interface");
const node_1 = require("../node");
const utils_1 = require("../../utils");
class FlowchartUtils {
    static newflowchart() {
        const startNode = node_1.NodeUtils.getStartNode();
        let startPos = flowchart_interface_1.canvasSize * 1.07 / 2;
        startPos = startPos - startPos % 20;
        startNode.position = { x: startPos, y: flowchart_interface_1.canvasSize / 2 };
        const middleNode = node_1.NodeUtils.getNewNode();
        middleNode.position = { x: startPos, y: 200 + flowchart_interface_1.canvasSize / 2 };
        const endNode = node_1.NodeUtils.getEndNode();
        endNode.position = { x: startPos, y: 400 + flowchart_interface_1.canvasSize / 2 };
        const startMid = {
            source: startNode.output,
            target: middleNode.input,
            selected: false
        };
        startNode.output.edges = [startMid];
        middleNode.input.edges = [startMid];
        const midEnd = {
            source: middleNode.output,
            target: endNode.input,
            selected: false
        };
        middleNode.output.edges = [midEnd];
        endNode.input.edges = [midEnd];
        middleNode.enabled = true;
        endNode.enabled = true;
        const flw = {
            id: utils_1.IdGenerator.getId(),
            name: 'Untitled',
            description: '',
            language: 'js',
            meta: {
                selected_nodes: [1]
            },
            nodes: [startNode, middleNode, endNode],
            edges: [startMid, midEnd],
            functions: [],
            ordered: true,
            model: null
        };
        return flw;
    }
    static checkNode(nodeOrder, node, enabled) {
        if (node.hasExecuted) {
            return;
        }
        else if (node.type === 'start') {
            nodeOrder.push(node);
        }
        else {
            for (const edge of node.input.edges) {
                if (!edge.source.parentNode.hasExecuted) {
                    return;
                }
            }
            nodeOrder.push(node);
        }
        node.hasExecuted = true;
        // node.enabled = enabled;
        for (const edge of node.output.edges) {
            FlowchartUtils.checkNode(nodeOrder, edge.target.parentNode, enabled);
        }
    }
    static orderNodes(flw) {
        let startNode;
        const selectedNodesID = [];
        for (const nodeIndex of flw.meta.selected_nodes) {
            selectedNodesID.push(flw.nodes[nodeIndex].id);
        }
        for (const node of flw.nodes) {
            if (node.type === 'start') {
                startNode = node;
            }
            node.hasExecuted = false;
        }
        const nodeOrder = [];
        FlowchartUtils.checkNode(nodeOrder, startNode, true);
        if (nodeOrder.length < flw.nodes.length) {
            /*
            for (const node of flw.nodes) {
                if (node.type !== 'start' && node.input.edges.length === 0) {
                    FlowchartUtils.checkNode(nodeOrder, node, false);
                }
            }
            */
            for (const node of flw.nodes) {
                let check = false;
                for (const existingNode of nodeOrder) {
                    if (existingNode === node) {
                        check = true;
                        break;
                    }
                }
                if (check) {
                    continue;
                }
                // node.enabled = false;
                nodeOrder.push(node);
            }
        }
        if (nodeOrder[nodeOrder.length - 1].type !== 'end') {
            for (let i = nodeOrder.length - 2; i > 0; i--) {
                if (nodeOrder[i].type === 'end') {
                    const endN = nodeOrder[i];
                    nodeOrder.splice(i, 1);
                    nodeOrder.push(endN);
                    break;
                }
            }
        }
        flw.meta.selected_nodes = [];
        for (const nodeID of selectedNodesID) {
            for (let i = 0; i < nodeOrder.length; i++) {
                if (nodeOrder[i].id === nodeID) {
                    flw.meta.selected_nodes.push(i);
                    break;
                }
            }
        }
        flw.nodes = nodeOrder;
        flw.ordered = true;
    }
}
exports.FlowchartUtils = FlowchartUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd2NoYXJ0LnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvc3JjL21vZGVsL2Zsb3djaGFydC9mbG93Y2hhcnQudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrREFBK0Q7QUFDL0Qsa0NBQTJDO0FBRTNDLHVDQUEwQztBQUUxQyxNQUFhLGNBQWM7SUFFaEIsTUFBTSxDQUFDLFlBQVk7UUFDdEIsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQyxJQUFJLFFBQVEsR0FBRyxnQ0FBVSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFDckMsUUFBUSxHQUFHLFFBQVEsR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRXBDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsRUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxnQ0FBVSxHQUFHLENBQUMsRUFBQyxDQUFDO1FBRXRELE1BQU0sVUFBVSxHQUFHLGdCQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxFQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxnQ0FBVSxHQUFHLENBQUMsRUFBQyxDQUFDO1FBRTdELE1BQU0sT0FBTyxHQUFHLGdCQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkMsT0FBTyxDQUFDLFFBQVEsR0FBRyxFQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxnQ0FBVSxHQUFHLENBQUMsRUFBQyxDQUFDO1FBRTFELE1BQU0sUUFBUSxHQUFVO1lBQ3BCLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN4QixNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFDeEIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQztRQUNGLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsUUFB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