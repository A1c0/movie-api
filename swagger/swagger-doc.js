const fs = require('fs');
const R = require('ramda');

const swaggerDir = 'swagger';

const buildName = name => `${swaggerDir}/${name}.json`;

const getSwaggerDoc = R.pipe(
  buildName,
  R.unary(fs.readFileSync),
  JSON.parse
);

const setCompleteHost = (host, port) =>
  R.assocPath(['swagger', 'host'], `${host}:${port}`);

const setScheme = R.pipe(
  R.of,
  R.assocPath(['swagger', 'schemes'])
);

const setRoutePrefix = R.assoc('routePrefix');

const getSwaggerGlobal = (host, port, scheme, routePrefix) =>
  R.pipe(
    getSwaggerDoc,
    setCompleteHost(host, port),
    setScheme(scheme),
    setRoutePrefix(routePrefix)
  )('swagger-global');

module.exports = {getSwaggerGlobal, getSwaggerDoc};
