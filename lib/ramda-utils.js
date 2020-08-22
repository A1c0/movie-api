const R = require('ramda');

const tryCatchPromise = R.curry(async (fnTry, fnCatch, value) => {
  try {
    return await Promise.resolve(fnTry(value));
  } catch (e) {
    return await Promise.resolve(fnCatch(value));
  }
});

const juxtAsyncInOrder = R.curry(async (fnArray, value) => {
  const resArray = [];
  for (let i in fnArray) {
    const fn = fnArray[i];
    resArray.push(await fn(value));
  }
  return resArray;
});

const applyPartialFn = ([fn, value]) => R.flip(fn)(value);

const buildUnaryFnArray = arrayFn =>
  R.pipe(R.zip(arrayFn), R.map(applyPartialFn));

const promiseResolve = R.bind(Promise.resolve, Promise);

const callFnWithPromiseAcc = (acc, asyncFn) =>
  R.pipe(promiseResolve, R.andThen(asyncFn))(acc);

const _reduceWithArrayFnProto = R.curry((reduceFn, arrayFn, array) =>
  R.converge(R.reduce(reduceFn), [
    R.head,
    R.pipe(R.tail, buildUnaryFnArray(arrayFn))
  ])(array)
);

const _reduceRightWithArrayFnProto = R.curry((reduceFn, arrayFn, array) =>
  R.converge(R.reduceRight(reduceFn), [
    R.last,
    R.pipe(R.init, buildUnaryFnArray(arrayFn))
  ])(array)
);

const reduceWithArrayFn = _reduceWithArrayFnProto(R.flip(R.call));
const reduceWithArrayFnAsync = _reduceWithArrayFnProto(callFnWithPromiseAcc);

const reduceRightWithArrayFn = _reduceRightWithArrayFnProto(R.call);
const reduceRightWithArrayFnAsync = _reduceRightWithArrayFnProto(
  R.flip(callFnWithPromiseAcc)
);

module.exports = {
  tryCatchPromise,
  juxtAsyncInOrder,
  reduceWithArrayFn,
  reduceWithArrayFnAsync,
  reduceRightWithArrayFn,
  reduceRightWithArrayFnAsync
};
