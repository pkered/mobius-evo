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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd2NoYXJ0LnV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vZ2VuX2V2YWxfcHJvY2Vzc19iYWNrZW5kL3NyYy9tb2RlbC9mbG93Y2hhcnQvZmxvd2NoYXJ0LnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0RBQStEO0FBQy9ELGtDQUEyQztBQUUzQyx1Q0FBMEM7QUFFMUMsTUFBYSxjQUFjO0lBRWhCLE1BQU0sQ0FBQyxZQUFZO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDM0MsSUFBSSxRQUFRLEdBQUcsZ0NBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLFFBQVEsR0FBRyxRQUFRLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVwQyxTQUFTLENBQUMsUUFBUSxHQUFHLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsZ0NBQVUsR0FBRyxDQUFDLEVBQUMsQ0FBQztRQUV0RCxNQUFNLFVBQVUsR0FBRyxnQkFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsRUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsZ0NBQVUsR0FBRyxDQUFDLEVBQUMsQ0FBQztRQUU3RCxNQUFNLE9BQU8sR0FBRyxnQkFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsRUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsZ0NBQVUsR0FBRyxDQUFDLEVBQUMsQ0FBQztRQUUxRCxNQUFNLFFBQVEsR0FBVTtZQUNwQixNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU07WUFDeEIsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLO1lBQ3hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUM7UUFDRixT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