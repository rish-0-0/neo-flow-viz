# neo-flow-viz
React Flow based Neo4j Vizualization Library written in TypeScript

[Storybook](https://rish-0-0.github.io/neo-flow-viz/)

```shell
npm install neo-flow-viz
```

## Documentation

```javascript
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
```

## Neo4j Server

```shell
npm run neo4j-server
```

# Development

> Make sure you install all dependencies first. Both in the test directory and main directory.

### Running the neo4j server, for getting some sample responses

```shell
cd test/neo4j-server && npm install && docker compose build
```
```bash
docker compose up -d
```

### Running storybook

This will run the storybook server (from the root)

```shell
npm test
```

Contributors: @rish-0-0