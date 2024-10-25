// app.js
const fastify = require('fastify')({ logger: true });
const cors = require("@fastify/cors");
const neo4j = require('neo4j-driver');
const PORT = 3000;

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST"],
});

// Create a Neo4j driver instance
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

// Define a route
fastify.post('/', async (request, reply) => {
  const session = driver.session();
  try {
    const result = await session.run(request.body.query);
    reply.code(200).send(result);
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Neo4j query failed: ' + err.message, stack: err.stack });
  } finally {
    await session.close();
  }
});

fastify.setNotFoundHandler((request, reply) => {
  reply.header("Content-Type", "text/html; charset=utf-8");
  return reply.code(404).send(`<html><h1>Route Not Found</h1></html>`)
});

// Start server
const start = async () => {
  try {
    const addr = await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server is running at ${addr}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();