import type { Meta, StoryObj } from '@storybook/react';

import NeoFlowViz, { Neo4jResponse } from 'neo-flow-viz/src/NeoFlowViz';

import query1Response from "./responses/s_r_p_r1_c_2.json";

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

export const Test: Story = {
  args: {
    query: "match (s:Supplier)-[r:SUPPLIES]->(p:Product)-[r1:PART_OF]->(c:Category) return * LIMIT 2;",
    response: typedQueryResponse1
  }
};

