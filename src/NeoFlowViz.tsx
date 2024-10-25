import * as React from "react";
import {
  ColorMode,
  ReactFlow,
  useEdgesState,
  useNodesState
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

interface NeoFlowVizProps {
  query: string;
  response: Neo4jResponse;
  width: number | undefined;
  height: number | undefined;
  colorMode: ColorMode;
}

function NeoFlowViz ({query, response, width, height, colorMode}: NeoFlowVizProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes(response, query));
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges(response, query));
  return (
    <ReactFlow
      height={height}
      width={width}
      nodes={nodes}
      edges={edges}
      colorMode={colorMode}
    />
  );
}

export default NeoFlowViz;