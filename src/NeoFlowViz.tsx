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
  addEdge
} from "@xyflow/react";
import { reactFlowEdges, reactFlowNodes } from "./utils";
import '@xyflow/react/dist/style.css';

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

interface ELKOptions {
  'elk.algorithm'?: string;
  'elk.layered.spacing.nodeNodeBetweenLayers'?: string;
  'elk.spacing.nodeNode'?: string;
  'elk.direction'?: string;
}

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
      width: 150,
      height: 50,
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
}

function Flow ({width = 1500, height = 800, query, response, colorMode = 'system'}: NeoFlowVizProps) {
  const initialNodes = React.useMemo(() => reactFlowNodes(response, query), [query]);
  const initialEdges = React.useMemo(() => reactFlowEdges(response, query), [query]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView } = useReactFlow();

  const onConnect = React.useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onLayout = React.useCallback(
    ({ direction, useInitialNodes = false }: {direction:string; useInitialNodes?: boolean;}) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
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
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);

  React.useEffect(() => {console.log({nodes, edges})});

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        height={height}
        width={width}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        colorMode={colorMode}
        fitView
      />
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