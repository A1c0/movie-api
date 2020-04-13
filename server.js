const fastify = require('fastify')();
const fastifySwagger = require('fastify-swagger');
const L = require('loggy-log')();
const fs = require('fs');
const R = require('ramda');

const PORT = process.env.PORT || 5000;

const pino = L.getPino();

const {getDVD} = require('./app/api/dvd-finder');

const logo = fs.readFileSync('asset/logo.txt').toString();

fastify.register(fastifySwagger, {
  routePrefix: '/',
  swagger: {
    info: {
      title: 'Test swagger',
      description: 'testing the fastify swagger api',
      version: '0.1.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {name: 'user', description: 'User related end-points'},
      {name: 'code', description: 'Code related end-points'}
    ],
    definitions: {
      User: {
        $id: 'User',
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: {type: 'string', format: 'uuid'},
          firstName: {type: 'string', nullable: true},
          lastName: {type: 'string', nullable: true},
          email: {type: 'string', format: 'email'}
        }
      }
    },
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'apiKey',
        in: 'header'
      }
    }
  },
  exposeRoute: true
});

// Declare a route
fastify.get('/movies-DVD/:barcode', async (request, reply) => {
  const barcode = request.params.barcode;
  pino.debug('Call: /movies-DVD/:barcode');
  pino.trace('request: \n%fo', request);
  reply.code(200).send(await getDVD(barcode));
});
// Run the server!
fastify.listen(PORT, err => {
  pino.info('\n%s', logo);
  pino.info('the server is listen on port %d', PORT);
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
