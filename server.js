const fastify = require('fastify')();
const fastifySwagger = require('fastify-swagger');
const L = require('loggy-log')();
const fs = require('fs');
const R = require('ramda');

const {getSwaggerDoc, getSwaggerGlobal} = require('./swagger/swagger-doc');
const {getDVD} = require('./app/api/dvd-finder');
const {createUser, getAllUsers, getUser} = require('./app/api/user');
const {init} = require('./app/db/db');
const {parseEachProperty} = require('./app/validator/validator');

const APP_HOST = process.env.APP_HOST || 'localhost';
const APP_PORT = process.env.APP_PORT || 5000;
const APP_SCHEME = process.env.APP_SCHEME || 'http';
const SWAGGER_PREFIX = process.env.SWAGGER_PREFIX || '/';

const pino = L.getPino();

const logo = fs.readFileSync('asset/logo.txt').toString();

fastify.register(
  fastifySwagger,
  getSwaggerGlobal(APP_HOST, APP_PORT, APP_SCHEME, SWAGGER_PREFIX)
);

fastify.get(
  '/provider/:barcode',
  getSwaggerDoc('get-provider-barcode'),
  async (request, reply) => {
    const params = parseObject(request.params);
    const barcode = params.barcode;
    pino.debug(`Call: /provider/${barcode}`);
    pino.trace('request: \n%fo', request);
    reply.code(200).send(await getDVD(barcode));
  }
);

// USER Route

fastify.post('/users/', async (request, reply) => {
  pino.debug(`Call: POST /users/`);
  pino.trace('request: \n%fo', R.dissoc('raw', request));
  const body = parseEachProperty(request.body);
  pino.debug('%o', body);
  try {
    const successReturn = await createUser(body);
    reply.code(201).send(`/users/${successReturn.id}`);
  } catch (e) {
    reply.code(409).send(e);
  }
});

fastify.get('/users/', async (request, reply) => {
  pino.debug(`Call: GET /users/`);
  pino.trace('request: \n%fo', R.dissoc('raw', request));
  try {
    const successReturn = await getAllUsers();
    reply.code(200).send(successReturn);
  } catch (e) {
    reply.send(e);
  }
});

fastify.get('/users/:userId', async (request, reply) => {
  pino.debug(`Call: GET /users/:userId`);
  pino.trace('request: \n%fo', R.dissoc('raw', request));
  const params = parseEachProperty(request.params);
  pino.trace('params: \n%fo', params);

  try {
    const successReturn = await getUser(params.userId);
    reply.code(200).send(successReturn);
  } catch (e) {
    reply.send(e);
  }
});

fastify.put('/users/:userId', async (request, reply) => {
  pino.debug(`Call: PUT /users/:userId`);
  pino.trace('request: \n%fo', R.dissoc('raw', request));
  const params = parseEachProperty(request.params);
  pino.trace('params: \n%fo', params);

  try {
    const successReturn = await setUser(params.userId);
    reply.code(200).send(successReturn);
  } catch (e) {
    reply.send(e);
  }
});

fastify.ready(err => {
  if (err) throw err;
  fastify.swagger();
});

// Run the server!
fastify.listen(APP_PORT, APP_HOST, async err => {
  await init();
  pino.info('\n%s', logo);
  pino.info('the server is listen on port %d', APP_PORT);
  pino.info(
    'the server swagger is available on %s',
    `${APP_SCHEME}://${APP_HOST}:${APP_PORT}${SWAGGER_PREFIX}`
  );
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
