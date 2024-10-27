"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const elk_bundled_js_1 = __importDefault(require("elkjs/lib/elk.bundled.js"));
const react_1 = require("@xyflow/react");
const react_json_pretty_1 = __importDefault(require("react-json-pretty"));
const utils_1 = require("./utils");
const CircularNode_1 = __importDefault(require("./CircularNode"));
const const_1 = require("./const");
require("@xyflow/react/dist/style.css");
require("react-json-pretty/themes/monikai.css");
const elk = new elk_bundled_js_1.default();
const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
};
async function getLayoutedElements(nodes, edges, options = {}) {
    var _a, _b, _c;
    const isHorizontal = (options === null || options === void 0 ? void 0 : options['elk.direction']) === 'RIGHT';
    const graph = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => (Object.assign(Object.assign({}, node), { 
            // Adjust the target and source handle positions based on the layout
            // direction.
            targetPosition: isHorizontal ? 'left' : 'top', sourcePosition: isHorizontal ? 'right' : 'bottom', 
            // Hardcode a width and height for elk to use when layouting.
            width: const_1.DEFAULT_NODE_WIDTH, height: const_1.DEFAULT_NODE_HEIGHT }))),
        edges: edges,
    };
    try {
        const layoutedGraph = await elk
            .layout(graph);
        return ({
            nodes: (_b = (_a = layoutedGraph === null || layoutedGraph === void 0 ? void 0 : layoutedGraph.children) === null || _a === void 0 ? void 0 : _a.map((node_1) => (Object.assign(Object.assign({}, node_1), { 
                // React Flow expects a position property on the node instead of `x`
                // and `y` fields.
                position: { x: node_1.x, y: node_1.y } })))) !== null && _b !== void 0 ? _b : [],
            edges: (_c = layoutedGraph === null || layoutedGraph === void 0 ? void 0 : layoutedGraph.edges) !== null && _c !== void 0 ? _c : [],
        });
    }
    catch (message) {
        console.error(message);
        return ({
            nodes: [],
            edges: []
        });
    }
}
;
const nodeTypes = { circularNode: CircularNode_1.default };
function Flow({ width = 1500, height = 800, query, response, colorMode = 'system', direction = 'DOWN', onNodeClick: onNodeClickFromProps = () => { }, onEdgeClick: onEdgeClickFromProps = () => { }, showDetails = true }) {
    const initialNodes = React.useMemo(() => (0, utils_1.reactFlowNodes)(response, query), [query]);
    const initialEdges = React.useMemo(() => (0, utils_1.reactFlowEdges)(response, query), [query]);
    const [nodes, setNodes, onNodesChange] = (0, react_1.useNodesState)(initialNodes);
    const [edges, setEdges, onEdgesChange] = (0, react_1.useEdgesState)(initialEdges);
    const [selectedNode, setSelectedNode] = React.useState(null);
    const [selectedEdge, setSelectedEdge] = React.useState(null);
    const { fitView } = (0, react_1.useReactFlow)();
    const onConnect = React.useCallback((params) => setEdges((eds) => (0, react_1.addEdge)(params, eds)), []);
    const onNodeClick = React.useCallback((event, node) => {
        setSelectedEdge(null);
        setSelectedNode(node);
        onNodeClickFromProps(event, node);
    }, []);
    const onEdgeClick = React.useCallback((event, edge) => {
        setSelectedNode(null);
        setSelectedEdge(edge);
        onEdgeClickFromProps(event, edge);
    }, []);
    const onPaneClick = React.useCallback((event) => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);
    const onLayout = React.useCallback(({ direction, useInitialNodes = false }) => {
        const opts = Object.assign({ 'elk.direction': direction }, elkOptions);
        const ns = useInitialNodes ? initialNodes : nodes;
        const es = useInitialNodes ? initialEdges : edges;
        getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
            window.requestAnimationFrame(() => fitView());
        });
    }, [nodes, edges]);
    // Calculate the initial layout on mount.
    React.useLayoutEffect(() => {
        onLayout({ direction, useInitialNodes: true });
    }, []);
    return (<div style={{ width: '100vw', height: '100vh' }}>
      <react_1.ReactFlow height={height} width={width} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onPaneClick={onPaneClick} onConnect={onConnect} colorMode={colorMode} onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} fitView nodeTypes={nodeTypes}>
        {showDetails && (<react_1.Panel position="top-right">
            <div className="react-json-pretty-container" style={{
                maxWidth: '30vw',
                height: '100%',
                padding: '5px 10px'
            }}>

              {selectedNode && (<>
                    <react_json_pretty_1.default id="neo-flow-viz-json-pretty" data={selectedNode.data}/>
                  </>)}
              {selectedEdge && (<react_json_pretty_1.default id="neo-flow-viz-json-pretty" data={selectedEdge.data}/>)}
            </div>
          </react_1.Panel>)}
        <react_1.Controls />
      </react_1.ReactFlow>
    </div>);
}
function NeoFlowViz(props) {
    return (<react_1.ReactFlowProvider>
      <Flow {...props}/>
    </react_1.ReactFlowProvider>);
}
exports.default = NeoFlowViz;
