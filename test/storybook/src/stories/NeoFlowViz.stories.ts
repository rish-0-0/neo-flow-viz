import type { Meta, StoryObj } from '@storybook/react';

import NeoFlowViz, { Neo4jResponse } from 'neo-flow-viz/src/NeoFlowViz';

import query1Response from "./responses/s_r_p_r1_c_2.json";
import query2Response from "./responses/s_c_2.json";
import query3Response from "./responses/cust_1.json";
import query4Response from "./responses/multi.json";
import query5Response from "./responses/shortestPath.json";
import query6Response from "./responses/complex.json";

const meta = {
  title: 'NeoFlowViz',
  tags: ['neo4j-visualization'],
  component: NeoFlowViz,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof NeoFlowViz>;

export default meta;

type Story = StoryObj<typeof NeoFlowViz>;

const typedQueryResponse1 = query1Response as Neo4jResponse;
const typedQueryResponse2 = query2Response as Neo4jResponse;
const typedQueryResponse3 = query3Response as Neo4jResponse;
const typedQueryResponse4 = query4Response as Neo4jResponse;
const typedQueryResponse5 = query5Response as Neo4jResponse;
const typedQueryResponse6 = query6Response as Neo4jResponse;

export const Basic: Story = {
  args: {
    query: "match (s:Supplier)-[r:SUPPLIES]->(p:Product)-[r1:PART_OF]->(c:Category) return * LIMIT 2;",
    response: typedQueryResponse1
  },
  parameters: {
    docs: {
      source: {
        language: 'tsx',
        code: `<NeoFlowViz query={query} response={response} />`
      }
    }
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
    query: "MATCH (cust:Customer)-[:PURCHASED]->(o1:Order)-[o:ORDERS]->(p:Product),(p)-[:PART_OF]->(c:Category {categoryName:\"Produce\"})RETURN * LIMIT 1;",
    response: typedQueryResponse3,
    direction: "DOWN"
  }
}

export const MultipleRelations: Story = {
  args: {
    query: "MATCH (people:Person)-[relatedTo]-(m:Movie {title: \"Cloud Atlas\"}) RETURN *;",
    response: typedQueryResponse4
  }
};

export const ShortestPath: Story = {
  args: {
    query: "MATCH p=shortestPath((bacon:Person {name:\"Kevin Bacon\"})-[*]-(meg:Person {name:\"Meg Ryan\"}))RETURN *",
    response: typedQueryResponse5
  }
};

export const ComplexQuery: Story = {
  args: {
    query: "MATCH (tom:Person {name:\"Tom Hanks\"})-[r1:ACTED_IN]->(m:Movie)<-[r2:ACTED_IN]-(coActors),(coActors)-[r3:ACTED_IN]->(m2:Movie)<-[r4:ACTED_IN]-(cruise:Person {name:\"Tom Cruise\"}) RETURN *",
    response: typedQueryResponse6,
    direction: "LEFT"
  }
};