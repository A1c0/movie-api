const fastify = require('fastify')({
  logger: true
});

// Declare a route
fastify.get('/', (request, reply) => {
  reply.code(200).send({hello: 'world'});
});

// Run the server!
fastify.listen(3000, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
