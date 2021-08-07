const http = require('http');
// const app = require('./app');

const express = require("express"); // Framework Express
const app = express();

const db = require('./app')

// Permet de parser en json avec Express (anciennement Body parser)
app.use(express.json());

// MIDDLEWARE QUI DONNE LES DROITS A LA PAGE HTML
// On le garde ici à cause de problème d'itinéraire
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Content-Type", "application/json");

  next();
});

app.get('/api/v1/getGuild', db.getGuild) // Return les guildes
app.get('/api/v1/getServerList', db.getServerList) // Return les servers
app.get('/api/v1/getLastWars', db.getLastWars) // Return les dernières wars
app.get('/api/v1/getUpcomingWars', db.getUpcomingWars) // Return les wars à venir
app.post('/api/v1/createGuild', db.createGuild) // Crée une guilde
app.post('/api/v1/checkLogin', db.checkLogin) // Crée une guilde
app.post('/api/v1/findGuildWhoAreNotInMyFaction', db.findGuildWhoAreNotInMyFaction) // Return les wars à venir
app.post('/api/v1/getMyWarProposed', db.getMyWarProposed) // Return mes wars en attentes d'acceptation ou non
app.post('/api/v1/getMyWarIHaveToAccept', db.getMyWarIHaveToAccept) // Return les wars que je peux accepter
app.post('/api/v1/declareWarTo', db.declareWarTo) // Propose une war à quelqu'un
app.post('/api/v1/acceptWar', db.acceptWar) // Accept une war
app.post('/api/v1/declineWar', db.declineWar) // Decline une war




const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);