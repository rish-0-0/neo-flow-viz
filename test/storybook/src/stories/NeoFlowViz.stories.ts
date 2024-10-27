import type { Meta, StoryObj } from '@storybook/react';

import NeoFlowViz, { Neo4jResponse } from 'neo-flow-viz/src/NeoFlowViz';

import query1Response from "./responses/s_r_p_r1_c_2.json";
import query2Response from "./responses/s_c_2.json";
import query3Response from "./responses/cust_1.json";

const meta = {
  title: 'NeoFlowViz',
  tags: ['neo4j-visualization'],
  component: NeoFlowViz,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof NeoFlowViz>;

export default meta;

type Story = StoryObj<typeof meta>;

const typedQueryResponse1 = query1Response as Neo4jResponse;
const typedQueryResponse2 = query2Response as Neo4jResponse;
const typedQueryResponse3 = query3Response as Neo4jResponse;

export const Basic: Story = {
  args: {
    query: "match (s:Supplier)-[r:SUPPLIES]->(p:Product)-[r1:PART_OF]->(c:Category) return * LIMIT 2;",
    response: typedQueryResponse1
  }
};

export const NoRelation: Story = {
  args: {
    query: "MATCH (c:Category {categoryName:\"Produce\"})<--(:Product)<--(s:Supplier) RETURN DISTINCT *;",
    response: typedQueryResponse2
  }
};

export const Relationships: Story = {
  args: {
    query: "MATCH (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product),(p)-[:PART_OF]->(c:Category {categoryName:\"Produce\"}) RETURN DISTINCT * LIMIT 2;",
    response: typedQueryResponse3,
    direction: "DOWN"
  }
}
