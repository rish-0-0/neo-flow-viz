import { Neo4jNode, Neo4jResponse } from "./NeoFlowViz";

// Regex for node definitions (variable name and type)
export const nodeRegex = /\((\w+)(?::(\w+))?\)/g; // Optional label
export const relationshipRegex = /\[(\w+)(?::(\w+))?\]/g; // Optional type

// this will tell you all the variables and their types in the query
function getResourceMappingFromQuery (query: string): {[key: string]: string} {
  let match: RegExpExecArray | null;
  const result: {[x: string]: string} = {};
  const seenVariables = new Set(); // Set to track already seen variables

  // Capture nodes
  while ((match = nodeRegex.exec(query)) !== null) {
    const variableName = match[1]; // match[1] is variable name
    const typeName = match[2]; // match[2] is type

    // Only add to result if the variable name hasn't been seen yet
    if (!seenVariables.has(variableName)) {
      result[variableName] = typeName; // Store variable and its type
      seenVariables.add(variableName); // Mark this variable as seen
    }
  }

  // Capture relationships
  while ((match = relationshipRegex.exec(query)) !== null) {
    const variableName = match[1]; // match[1] is relationship variable
    const typeName = match[2]; // match[2] is type

    // Only add to result if the relationship variable name hasn't been seen yet
    if (!seenVariables.has(variableName)) {
      result[variableName] = typeName; // Store relationship variable and its type
      seenVariables.add(variableName); // Mark this relationship variable as seen
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
  return response.records.flatMap(record => 
    record._fields.map((node: Neo4jNode, index) => {
      const _fieldLookup = record._fieldLookup;
      const label = retrieveLabel(resourceMap, index, _fieldLookup);
      return ({
        id: hashString(`${node.identity.low}:${node.identity.high}`), // Unique ID based on identity
        data: {
          label,
          properties: node.properties,
        },
        width: 100,
        height: 50,
        position: { x: 0, y: 0 }, // Start at default (0,0); positions can be updated later using ELKJS
      });
    })
  );
}

// Function to convert Neo4jResponse to React Flow edges
export function reactFlowEdges(response: Neo4jResponse, query: string): any[] {
  const resourceMap = getResourceMappingFromQuery(query);
  return response.records.flatMap(record => {
    return record._fields
      .map((node, index) => {
        if (!node.start || !node.end) return null;
        const _fieldLookup = record._fieldLookup;
        const label = retrieveLabel(resourceMap, index, _fieldLookup);
        return {
          id: `edge-${hashString(`${node.start.low}:${node.start.high}`)}-to-${hashString(`${node.end.low}:${node.end.high}`)}`,
          source: `${hashString(`${node.start.low}:${node.start.high}`)}`,
          target: `${hashString(`${node.end.low}:${node.end.high}`)}`,
          label,
        };
      }).filter(Boolean);
  });
}