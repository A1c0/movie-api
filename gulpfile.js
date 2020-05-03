const {watch} = require('gulp'),
  {spawn} = require('child_process');

const startServer = () => spawn('node', ['server.js'], {stdio: 'inherit'});

const autoReload = async () => {
  let p;
  const spawnChildren = async () => {
    // kill previous spawned process
    if (p) {
      p.kill();
    }
    // `spawn` a child `gulp` process linked to the parent `stdio`
    p = startServer();
  };

  watch('*.js', spawnChildren);
  watch('swagger/**/*.js*', spawnChildren);
  watch('app/**/*.js*', spawnChildren);
  await spawnChildren();
};

exports.server = autoReload;
