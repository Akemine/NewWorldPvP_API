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

/** Requête qui crée une mission
 * @param difficulte : renvoi la difficulté de la mission
 */
async function createGuild(req, res) {
  // Constante qui récupère les informations du body (from FRONT)
  const {
    id_type_mission,
    id_type_remuneration,
    titremission,
    montantproposeur,
    nombredepersonnes,
    difficulte,
    localisation,
    adresse, 
    ville, 
    codepostal,
    duree,
    description
  } = req.body;

  // Connection à l'API et insertion des données
  pool.connect((err, client, release) => {
    client.query(
      "INSERT INTO DEV.mission (id_type_mission, id_type_remuneration, titremission, montantproposeur, nombredepersonnes, difficulte, localisation, adresse, ville, codepostal, duree, description) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        id_type_mission,
        id_type_remuneration,
        titremission,
        montantproposeur,
        nombredepersonnes,
        difficulte,
        localisation,
        adresse,
        ville,
        codepostal,
        duree,
        description
      ], (err, res) => {
        client.release(); // Release la connection de l'utilisateur car plus nécessaire
        // Throw les erreurs
        if (err) {
          throw err;
        }
      }
    );
  });
  // Renvoie le status OK
  res.sendStatus(200);
}

async function getGuild(req, res) {

  let sql = "SELECT * FROM public.guild"; // Retourne les guildes

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

  let sql = "SELECT * FROM public.war_en_attente order by ID desc limit 10"; // Retourne dernières wars

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

  let sql = "SELECT distinct server FROM public.guild"; // Retourne dernières wars

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
    client.query("SELECT count(*) FROM public.guild WHERE login = $1 AND password = $2", 
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
  client.query("SELECT id, nom, faction FROM public.guild WHERE faction != (SELECT faction FROM public.guild WHERE nom = $1)", 
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
  client.query("SELECT * FROM public.war_en_attente WHERE guild_proposeur = $1", 
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
  client.query("SELECT * FROM public.war_en_attente WHERE guild_attaquer = $1", 
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
  client.query("INSERT INTO public.war_en_attente (guild_proposeur, guild_attaquer, lieu, heure, date_war, nombreJoueurs, accepted) VALUES ($1, $2, $3, $4, $5, $6, null)", 
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
  client.query("UPDATE public.war_en_attente SET accepted = true WHERE id = $1", 
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
  client.query("UPDATE public.war_en_attente SET accepted = false WHERE id = $1", 
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

module.exports = {
  createGuild,
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
  declineWar
};
