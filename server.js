const fastify = require('fastify')();
const L = require('loggy-log')();
const fs = require('fs');
const R = require('ramda');

const PORT = process.env.PORT || 5000;

const pino = L.getPino();

const {getDVD} = require('./app/api/dvd-finder');

const logo = fs.readFileSync('asset/logo.txt').toString();

// Declare a route
fastify.get('/', (request, reply) => {
  const barcode = request.params.barcode;
  pino.debug('Call: /');
  pino.trace('request: \n%fo', request);
  pino.trace('request.params: \n%fo', R.clone(request.params));
  reply.code(200).send({message: 'coucou '});
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
