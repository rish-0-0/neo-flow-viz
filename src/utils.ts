import { MarkerType } from "@xyflow/react";
import { Neo4jNode, Neo4jResponse } from "./NeoFlowViz";

// Regex for nodes and relationships
export const nodeRegex = /\((\w+)?(:\w+)?(?:\s*\{[^\}]*\})?\)/g;
export const relationshipRegex = /\[(\w+)?(:[^\]]+)?(?:\s*\{[^\}]*\})?\]/g;

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

function isPathQuery(query: string): boolean {
  // List of keywords indicating a path-related query
  const pathKeywords = ['shortestPath', 'allShortestPaths', 'dijkstra', 'CALL'];

  // Regular expression to match variable-length patterns
  const variableLengthPattern = /\(\w+\)-\[\*\d*\.\.\d*\]-\(\w+\)/;

  // Check for keywords and regex match
  return pathKeywords.some(keyword => query.includes(keyword))
    || variableLengthPattern.test(query);
}

export function parseNeo4jResult(response: Neo4jResponse, query: string) {
  const resourceMap = getResourceMappingFromQuery(query);
  const uniqueNodes = new Map();
  const uniqueEdges = new Map();

  response.records.forEach(record => {
    record._fields.forEach((element, index) => {
      const _fieldLookup = record._fieldLookup;
      const label = retrieveLabel(resourceMap, index, _fieldLookup);

      // Check if the query response includes segments (for path queries like shortestPath)
      if (isPathQuery(query) && element.segments) {
        element.segments.forEach(segment => {
          const { start, end, relationship } = segment;

          const edgeId = relationship.elementId ?? `edge-${hashString(start.elementId)}-to-${hashString(end.elementId)}`;
          if (!uniqueEdges.has(edgeId)) {
            uniqueEdges.set(edgeId, {
              id: edgeId,
              source: start.elementId ?? `${hashString(`${start.identity.low}:${start.identity.high}`)}`,
              target: end.elementId ?? `${hashString(`${end.identity.low}:${end.identity.high}`)}`,
              label: (label === 'UnknownType' || !label) ? (relationship.type ?? label) : label,
              data: {
                label,
                properties: relationship.properties,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });
          }

          // Handle nodes in segments (start and end nodes)
          [start, end].forEach(node => {
            const nodeId = node.elementId ?? hashString(`${node.identity.low}:${node.identity.high}`);
            if (!uniqueNodes.has(nodeId)) {
              uniqueNodes.set(nodeId, {
                id: nodeId,
                type: 'circularNode',
                data: {
                  label: node.labels.join('-'),
                  properties: node.properties,
                },
                position: { x: 0, y: 0 },
              });
            }
          });
        });
      } else if (element.start && element.end) {
        // Handle regular relationships
        const edgeId = element.elementId ?? `edge-${hashString(`${element.start.low}:${element.start.high}`)}-to-${hashString(`${element.end.low}:${element.end.high}`)}`;
        
        if (!uniqueEdges.has(edgeId)) {
          uniqueEdges.set(edgeId, {
            id: edgeId,
            source: element.startNodeElementId ?? `${hashString(`${element.start.low}:${element.start.high}`)}`,
            target: element.endNodeElementId ?? `${hashString(`${element.end.low}:${element.end.high}`)}`,
            label: label === 'UnknownType' ? (element.type ?? label) : label,
            data: {
              label,
              properties: element.properties,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }
      } else {
        // Handle nodes
        const nodeId = element.elementId ?? hashString(`${element.identity.low}:${element.identity.high}`);
        
        if (!uniqueNodes.has(nodeId)) {
          uniqueNodes.set(nodeId, {
            id: nodeId,
            type: 'circularNode',
            data: {
              label: label === 'UnknownType' ? (element.labels.join('-') ?? label) : label,
              properties: element.properties,
            },
            position: { x: 0, y: 0 },
          });
        }
      }
    });
  });

  // Return combined output
  return {
    nodes: Array.from(uniqueNodes.values()),
    edges: Array.from(uniqueEdges.values()),
  };
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