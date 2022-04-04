const express = require('express');
const request = require('request-promise');
const cron = require('node-cron');
const cache = require('memory-cache');

const options = {
  method: 'GET',
  uri: 'https://randomuser.me/api?results=50&inc=gender,name,location,email',
};

const requestApi = () => {
  request(options)
    .then(function (body) {
      writeInCache(body);
    })
    .catch(function (error) {
      console.error(error);
    });
};

const runCronJob = () => {
  //This will run every 30 seconds
  cron.schedule('*/30 * * * * *', () => {
    requestApi();
  });
};

requestApi();
runCronJob();

const writeInCache = (data) => {
  cache.put('data', data);
};

const app = express();
app.use(express.json());
//  allow cors
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// middleware collects cached data into request
app.use((req, res, next) => {
  if (cache.get('data')) req.cachedData = JSON.parse(cache.get('data'));
  next();
});

const userRouter = require('./routes/userRoutes');

app.use('/api/users', userRouter);

app.get('/', function (res, req) {
  req.send('Node server is running');
});

module.exports = app;
