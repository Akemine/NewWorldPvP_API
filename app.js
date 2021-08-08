// Constantes nécessaire à l'API
const express = require("express"); // Framework Express

const app = express();

// Variables d'environnement
// Nécessaires pour utiliser les process.env (fichier .env)
const dotenv = require("dotenv");
dotenv.config();

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DATABASE_USER_NAME,
  host: "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

async function getGuild(req, res) {

  let sql = "SELECT * FROM public.account"; // Retourne les guildes

  pool.connect((err, client, release) => {
    client.query(sql, [], (err, result) => {
      release();
      if (err) {
        throw err;
      }
      res.json(result.rows);
    });
  });
}

async function getLastWars(req, res) {

  let sql = "SELECT * FROM public.last_wars order by ID desc limit 10"; // Retourne dernières wars

  pool.connect((err, client, release) => {
    client.query(sql, [], (err, result) => {
      release();
      if (err) {
        throw err;
      }
      res.json(result.rows);
    });
  });
}

async function getUpcomingWars(req, res) {

  console.log("Upcoming wars")

  let sql = "SELECT * FROM public.war_proposed order by ID desc limit 10"; // Retourne dernières wars

  pool.connect((err, client, release) => {
    client.query(sql, [], (err, result) => {
      release();
      if (err) {
        throw err;
      }
      res.json(result.rows);
      console.log("Upcoming wars found !")
    });
  });
}

async function getServerList(req, res) {

  let sql = "SELECT distinct server FROM public.account"; // Retourne dernières wars

  pool.connect((err, client, release) => {
    client.query(sql, [], (err, result) => {
      release();
      if (err) {
        throw err;
      }
      res.json(result.rows);
    });
  });
}

async function checkLogin(req, res) {
  const {
    login,
    password
  } = req.body;
  console.log("test 2")
  pool.connect((err, client, release) => {
    client.query("SELECT count(*) FROM public.account WHERE guild_name = $1 AND password = $2", 
    [
      login,
      password
    ], (err, result) => {
      release();
      if (err) {
        throw err;
      }
      if(parseInt(result.rows[0].count) > 0){
        res.json(true)
        console.log("Compte trouvé")
      }
      else{
        res.json(false)
        console.log("Compte Invalide")
      }
    });
  });
}


async function findGuildWhoAreNotInMyFaction(req, res) {
  console.log("Guilds Found !")
  const {
    myGuild
  } = req.body;

pool.connect((err, client, release) => {
  client.query("SELECT id, guild_name, faction FROM public.account WHERE faction != (SELECT faction FROM public.account WHERE guild_name = $1)", 
  [
    myGuild
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}

async function getMyWarProposed(req, res) {
  const {
    myGuild
  } = req.body;

pool.connect((err, client, release) => {
  client.query("SELECT * FROM public.war_proposed WHERE guild_proposeur = $1", 
  [
    myGuild
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}


async function getMyWarIHaveToAccept(req, res) {
  const {
    myGuild
  } = req.body;

pool.connect((err, client, release) => {
  client.query("SELECT * FROM public.war_proposed WHERE guild_attaquer = $1", 
  [
    myGuild
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}

async function declareWarTo(req, res) {
  const {
    guild_proposeur,
    guild_attaquer,
    lieu,
    heure,
    date_war,
    nombreJoueurs
  } = req.body;

pool.connect((err, client, release) => {
  client.query("INSERT INTO public.war_proposed (guild_proposeur, guild_attaquer, lieu, heure, date_war, nombrejoueurs, accepted) VALUES ($1, $2, $3, $4, $5, $6, null)", 
  [
    guild_proposeur,
    guild_attaquer,
    lieu,
    heure,
    date_war,
    nombreJoueurs
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}

async function acceptWar(req, res) {
  const {
    id
  } = req.body;
pool.connect((err, client, release) => {
  client.query("UPDATE public.war_proposed SET accepted = true WHERE id = $1", 
  [
    id
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}

async function declineWar(req, res) {
  const {
    id
  } = req.body;

pool.connect((err, client, release) => {
  client.query("UPDATE public.war_proposed SET accepted = false WHERE id = $1", 
  [
    id
  ], (err, result) => {
    release();
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
});
}

async function guildWon(req, res) {
  const {
    id_winner,
    id_looser
  } = req.body;

pool.connect((err, client, release) => {
  client.query("UPDATE public.ladder SET win = win + 1, cote = cote + 100 WHERE id = $1", 
  [
    id_winner
  ], (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
  
});
}

async function guildLoose(req, res) {
  console.log("test guild loose ?!")
  const {
    id_looser
  } = req.body;

pool.connect((err, client, release) => {
  client.query("UPDATE public.ladder SET loose = loose + 1, cote = cote - 100 WHERE id = $1", 
  [
    id_looser
  ], (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
  
});
}

async function archiveWar(req, res) {
  const {
    id
  } = req.body;

pool.connect((err, client, release) => {
  client.query("UPDATE public.war_proposed SET archive = true WHERE id = $1", 
  [
    id
  ], (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result.rows);
  });
  
});
}

module.exports = {
  getGuild,
  getLastWars,
  getUpcomingWars,
  getServerList,
  checkLogin,
  findGuildWhoAreNotInMyFaction,
  getMyWarProposed,
  getMyWarIHaveToAccept,
  declareWarTo,
  acceptWar,
  declineWar,
  guildWon,
  guildLoose,
  archiveWar
};