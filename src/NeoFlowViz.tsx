import * as React from "react";
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from "elkjs";
import {
  ColorMode,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import { reactFlowEdges, reactFlowNodes } from "./utils";

interface Identity {
  low: number;
  high: number;
}

type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONArray 
  | JSONObject;

interface JSONArray extends Array<JSONValue> {}

interface JSONObject {
  [key: string]: JSONValue;
}

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
      nodes: layoutedGraph?.children?.map((node_1) => ({
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
  width: number | undefined;
  height: number | undefined;
  colorMode: ColorMode;
}

function NeoFlowViz ({query, response, width, height, colorMode}: NeoFlowVizProps) {
  const initialNodes = React.useMemo(() => reactFlowNodes(response, query), [query]);
  const initialEdges = React.useMemo(() => reactFlowEdges(response, query), [query]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView } = useReactFlow();

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
  return (
    <ReactFlow
      height={height}
      width={width}
      nodes={nodes}
      edges={edges}
      colorMode={colorMode}
      fitView
    />
  );
}

export default NeoFlowViz;