import * as React from "react";
import ELK from 'elkjs/lib/elk.bundled.js';
import {LayoutOptions, ElkExtendedEdge, ElkNode} from "elkjs";
import {
  ColorMode,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  Controls,
  Panel,
  Node,
  Edge,
} from "@xyflow/react";
import JSONPretty from "react-json-pretty";
import { reactFlowEdges, reactFlowNodes } from "./utils";
import CircularNode from "./CircularNode";
import {DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT} from "./const";
import '@xyflow/react/dist/style.css';
import 'react-json-pretty/themes/monikai.css';

interface Identity {
  low: number;
  high: number;
}

type JSONValue = string | number | boolean | JSONObject | JSONArray | null;

interface JSONObject {
  [key: string]: JSONValue | undefined;
}

interface JSONArray extends Array<JSONValue> {}


export interface Neo4jNode {
  identity: Identity;
  start?: Identity;
  end?: Identity;
  labels: string[];
  properties: JSONObject;
  elementId: string;
}

interface Record {
  keys: string[];
  length: number;
  _fields: Neo4jNode[];
  _fieldLookup: { [key: string]: number };
}

export interface Neo4jResponse {
  records: Record[];
}

const elk = new ELK();

const elkOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

async function getLayoutedElements (nodes: ElkNode[], edges: ElkExtendedEdge[], options: LayoutOptions = {}) {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph: ElkNode= {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
    })),
    edges: edges,
  };

  try {
    const layoutedGraph = await elk
      .layout(graph);
    return ({
      nodes: layoutedGraph?.children?.map((node_1:ElkNode) => ({
        ...node_1,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node_1.x, y: node_1.y },
      })) ?? [] as ElkNode[],

      edges: layoutedGraph?.edges ?? [] as ElkExtendedEdge[],
    });
  } catch (message) {
    console.error(message);
    return ({
      nodes: [] as ElkNode[],
      edges: [] as ElkExtendedEdge[]
    });
  }
};

interface NeoFlowVizProps {
  query: string;
  response: Neo4jResponse;
  width?: number | undefined;
  height?: number | undefined;
  colorMode?: ColorMode;
  direction?: 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  showDetails?: boolean;
}

const nodeTypes = { circularNode: CircularNode };

function Flow (
  {
    width = 1500,
    height = 800,
    query,
    response,
    colorMode = 'system',
    direction = 'DOWN',
    onNodeClick: onNodeClickFromProps = () => {},
    onEdgeClick: onEdgeClickFromProps = () => {},
    showDetails = true
  }
  : NeoFlowVizProps) {
  const initialNodes = React.useMemo(() => reactFlowNodes(response, query), [query]);
  const initialEdges = React.useMemo(() => reactFlowEdges(response, query), [query]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null);

  const { fitView } = useReactFlow();

  const onConnect = React.useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onNodeClick = React.useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedEdge(null);
    setSelectedNode(node);
    onNodeClickFromProps(event, node);
  }, []);

  const onEdgeClick = React.useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
    onEdgeClickFromProps(event, edge);
  }, []);

  const onPaneClick = React.useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [])

  const onLayout = React.useCallback(
    ({ direction, useInitialNodes = false }: {direction:string; useInitialNodes?: boolean;}) => {
      const opts: LayoutOptions = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({nodes: layoutedNodes, edges: layoutedEdges}: {nodes: ElkNode[]; edges: ElkExtendedEdge[]}) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          window.requestAnimationFrame(() => fitView());
        },
      );
    },
    [nodes, edges],
  );

  // Calculate the initial layout on mount.
  React.useLayoutEffect(() => {
    onLayout({ direction, useInitialNodes: true });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        height={height}
        width={width}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        colorMode={colorMode}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        nodeTypes={nodeTypes}
      >
        {showDetails && (
          <Panel position="top-right">
            <div className="react-json-pretty-container" style={{
              maxWidth: '30vw',
              height: '100%',
              padding: '5px 10px'
            }}>

              {
                selectedNode && (
                  <>
                    <JSONPretty id="neo-flow-viz-json-pretty" data={selectedNode.data} />
                  </>
                )
              }
              {
                selectedEdge && (
                  <JSONPretty id="neo-flow-viz-json-pretty" data={selectedEdge.data} />
                )
              }
            </div>
          </Panel>
        )}
        <Controls />
      </ReactFlow>
    </div>
  );
}

function NeoFlowViz (props: NeoFlowVizProps) {
  
  return (
    <ReactFlowProvider>
      <Flow
        {...props}
      />
    </ReactFlowProvider>
  );
}

export default NeoFlowViz;