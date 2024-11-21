const cluster = require('cluster');
const os = require('os');
const app = require('./app');
require('dotenv').config({ path: './../development/.env' });



// Cluster setup to utilize multiple CPU cores
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master cluster setting up ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started on port 3000`);
  });
}