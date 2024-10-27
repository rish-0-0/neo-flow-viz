"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relationships = exports.NoRelation = exports.Basic = void 0;
const NeoFlowViz_1 = __importDefault(require("neo-flow-viz/src/NeoFlowViz"));
const s_r_p_r1_c_2_json_1 = __importDefault(require("./responses/s_r_p_r1_c_2.json"));
const s_c_2_json_1 = __importDefault(require("./responses/s_c_2.json"));
const cust_1_json_1 = __importDefault(require("./responses/cust_1.json"));
const meta = {
    title: 'NeoFlowViz',
    tags: ['neo4j-visualization'],
    component: NeoFlowViz_1.default,
    parameters: {
        layout: 'fullscreen',
    },
};
exports.default = meta;
const typedQueryResponse1 = s_r_p_r1_c_2_json_1.default;
const typedQueryResponse2 = s_c_2_json_1.default;
const typedQueryResponse3 = cust_1_json_1.default;
exports.Basic = {
    args: {
        query: "match (s:Supplier)-[r:SUPPLIES]->(p:Product)-[r1:PART_OF]->(c:Category) return * LIMIT 2;",
        response: typedQueryResponse1
    }
};
exports.NoRelation = {
    args: {
        query: "MATCH (c:Category {categoryName:\"Produce\"})<--(:Product)<--(s:Supplier) RETURN DISTINCT *;",
        response: typedQueryResponse2
    }
};
exports.Relationships = {
    args: {
        query: "MATCH (cust:Customer)-[:PURCHASED]->(o1:Order)-[o:ORDERS]->(p:Product),(p)-[:PART_OF]->(c:Category {categoryName:\"Produce\"})RETURN * LIMIT 1;",
        response: typedQueryResponse3,
        direction: "DOWN"
    }
};
