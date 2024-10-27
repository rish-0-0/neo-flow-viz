import { MarkerType } from "@xyflow/react";
import { Neo4jNode, Neo4jResponse } from "./NeoFlowViz";

// Regex to match only nodes with defined variable names and optional types
export const nodeRegex = /\((\w+):?(\w+)?(?:\s*\{[^\}]*\})?\)/g;
// Regex to match only relationships with defined variable names and optional types
export const relationshipRegex = /\[(\w+):?(\w+)?(?:\s*\{[^\}]*\})?\]/g;

function getResourceMappingFromQuery(query: string): { [key: string]: string } {
  let match: RegExpExecArray | null;
  const result: { [x: string]: string } = {};
  const seenVariables = new Set(); // Track already seen variables

  // Capture nodes with variable names
  while ((match = nodeRegex.exec(query)) !== null) {
    const variableName = match[1]; // Variable name
    const typeName = match[2] || 'UnknownType'; // Type if provided

    // Only add to result if the variable name hasn't been seen yet
    if (!seenVariables.has(variableName)) {
      result[variableName] = typeName;
      seenVariables.add(variableName);
    }
  }

  // Capture relationships with variable names
  while ((match = relationshipRegex.exec(query)) !== null) {
    const variableName = match[1]; // Relationship variable
    const typeName = match[2] || 'UnknownType'; // Type if provided

    // Only add to result if the relationship variable name hasn't been seen yet
    if (!seenVariables.has(variableName)) {
      result[variableName] = typeName;
      seenVariables.add(variableName);
    }
  }

  return result;
}

function hashString(str: string): string {
  let hash: number = 2166136261;  // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);   // XOR with character code
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);  // Faster bit mixing
  }

  // Return as a 32-bit unsigned integer in hex format
  return (hash >>> 0).toString(16);
}

function reverseObject(obj: { [key: string]: number }): { [key: number]: string } {
  const reversed: { [key: number]: string } = {};

  Object.keys(obj).forEach(key => {
      reversed[obj[key]] = key;
  });

  return reversed;
}

function retrieveLabel(resourceMap: {[key: string]: string}, index: number, _fieldLookup: {[key: string]: number}): string {
  const lookup = reverseObject(_fieldLookup);
  const key = lookup[index];
  return resourceMap[key] ?? "";
}

export function reactFlowNodes(response: Neo4jResponse, query: string): any[] {
  const resourceMap = getResourceMappingFromQuery(query);
  const uniqueNodes = new Map(); // To store unique nodes based on ID

  response.records.forEach(record => {
    record._fields.forEach((node: Neo4jNode, index) => {
      if (node.start && node.end) return; // only nodes
      const _fieldLookup = record._fieldLookup;
      const label = retrieveLabel(resourceMap, index, _fieldLookup);
      const nodeId = hashString(`${node.identity.low}:${node.identity.high}`); // Unique ID

      // Check if the nodeId is already present to avoid duplication
      if (!uniqueNodes.has(nodeId)) {
        uniqueNodes.set(nodeId, {
          id: nodeId,
          type: 'circularNode',
          data: {
            label,
            properties: node.properties,
          },
          position: { x: 0, y: 0 }, // Default position; ELKJS can update it later
        });
      }
    });
  });

  // Return the unique nodes as an array
  return Array.from(uniqueNodes.values());
}

export function reactFlowEdges(response: Neo4jResponse, query: string): any[] {
  const resourceMap = getResourceMappingFromQuery(query);
  const uniqueEdges = new Map(); // Store edges based on unique ID

  response.records.forEach(record => {
    record._fields.forEach((node, index) => {
      if (!node.start || !node.end) return; // only relationships
      const _fieldLookup = record._fieldLookup;
      const label = retrieveLabel(resourceMap, index, _fieldLookup);
      const edgeId = `edge-${hashString(`${node.start.low}:${node.start.high}`)}-to-${hashString(`${node.end.low}:${node.end.high}`)}`;

      // Add edge only if it doesn't already exist
      if (!uniqueEdges.has(edgeId)) {
        uniqueEdges.set(edgeId, {
          id: edgeId,
          source: `${hashString(`${node.start.low}:${node.start.high}`)}`,
          target: `${hashString(`${node.end.low}:${node.end.high}`)}`,
          label,
          data: {
            label,
            properties: node.properties,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed
          }
        });
      }
    });
  });

  // Return unique edges as an array
  return Array.from(uniqueEdges.values());
}

function fnv1aHash(label: string): number {
  let hash = 2166136261; // prime
  for (let i = 0; i < label.length; i++) {
    hash ^= label.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

export function getColorFromLabel(label:string): string {
  const hash = fnv1aHash(label);

  // Extract RGB values with large gaps to make colors more distinct
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;

  return `rgb(${r}, ${g}, ${b})`;
}

export function darkenColor(rgb:string, factor = 0.2): string {
  const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
  const darkened = (value:number) => Math.max(0, value - value * factor);
  return `rgb(${darkened(r)}, ${darkened(g)}, ${darkened(b)})`;
}

function getLuminance(r: number, g: number, b: number) {
  // Convert to a luminance value
  const [red, green, blue] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function getContrastColor(backgroundColor: string): string {
  // Extract RGB values
  const rgb = backgroundColor.match(/\d+/g)?.map(Number) ?? [0, 0, 0]; // Expecting 'rgb(r, g, b)'
  const luminance = getLuminance(rgb[0], rgb[1], rgb[2]);
  return luminance > 0.5 ? 'black' : 'white'; // Higher luminance means lighter background
}