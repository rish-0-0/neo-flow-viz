import{j as e}from"./_commonjs-dynamic-modules-O7U1px_y.js";import{useMDXComponents as s}from"./index-BrnU7xv7.js";import{ae as i,af as r}from"./index-BAGpLTTB.js";import{N as a,B as d}from"./NeoFlowViz.stories-CGhLqVX1.js";import"./index-DJO9vBfz.js";import"./iframe-DfdRyw_1.js";import"../sb-preview/runtime.js";import"./index-rCr475hU.js";import"./index-D-8MO0q_.js";import"./index-CvTBScqg.js";import"./index-DrFu-skq.js";function n(o){return e.jsxs(e.Fragment,{children:[e.jsx(i,{of:a}),`
`,e.jsx("h1",{children:"Code Examples"}),`
`,e.jsx("br",{}),`
`,e.jsx("h2",{children:"Getting Started"}),`
`,e.jsx(r,{dark:!0,of:d}),`
`,e.jsx("h2",{children:"Complete Example"}),`
`,e.jsx(r,{dark:!0,code:`
  <NeoFlowViz
    query={query} // CYPHER Query
    response={response} // NodeJS style Neo4j Raw Response (checkout neo4j-server directory for an example)
    width={1500} // width
    height={800} // height
    colorMode="system" // dark, light, system
    direction="DOWN" // direction of ELKJS based layout
    onNodeClick={(event, node) => console.log({node})} // callback
    onEdgeClick={(event, edge) => console.log({edge})} // callback
    showDetails={true} // shows the panel with the properties on the right side
  />
`})]})}function y(o={}){const{wrapper:t}={...s(),...o.components};return t?e.jsx(t,{...o,children:e.jsx(n,{...o})}):n()}export{y as default};
