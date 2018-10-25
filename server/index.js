const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const pkg = require('./package.json');
const server = require('http').createServer(app);
const helmet = require('helmet');
const logger = require('morgan');
const apiRoutes = require('./routes');
const socket = require('./socket');

app.use(cors());
app.use(helmet());
app.use(logger('tiny'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version
  });
});

app.use(apiRoutes);

app.use((req, res, next) => {
  res.status(404).json({error: `${req.url} not found`});
});

app.use(require('./errorHandler'));

socket.init(server);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`> App listening on port ${PORT}`);
});
