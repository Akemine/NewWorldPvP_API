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

  let sql = "SELECT * FROM public.last_wars order by orderNumberWar desc limit 10"; // Retourne dernières wars

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

async function getAllLastWars(req, res) {

  let sql = "SELECT * FROM public.last_wars order by orderNumberWar desc"; // Retourne dernières wars

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
        if (parseInt(result.rows[0].count) > 0) {
          res.json(true)
          console.log("Compte trouvé")
        }
        else {
          res.json(false)
          console.log("Compte Invalide")
        }
      });
  });
}

async function getAccountData(req, res) {
  const {
    login,
    password
  } = req.body;
  pool.connect((err, client, release) => {
    client.query("SELECT * FROM public.account WHERE guild_name = $1 AND password = $2",
      [
        login,
        password
      ], (err, result) => {
        release();
        if (err) {
          throw err;
        }
        res.json(result.rows)
      });
  });
}

async function getAllGuild(req, res) {
  pool.connect((err, client, release) => {
    client.query("SELECT * FROM public.account WHERE role = 'guild' and banned = false order by guild_name ",
      (err, result) => {
        release();
        if (err) {
          throw err;
        }
        res.json(result.rows)
      });
  });
}

async function getBannedGuild(req, res) {
  pool.connect((err, client, release) => {
    client.query("SELECT * FROM public.account WHERE role = 'guild' and banned = true order by guild_name ",
      (err, result) => {
        release();
        if (err) {
          throw err;
        }
        res.json(result.rows)
      });
  });
}

async function getAllResultOfMyGuild(req, res) {
  const {
    guildName,
  } = req.body;
  pool.connect((err, client, release) => {
    client.query("SELECT * FROM public.last_wars WHERE win_guild = $1 or loose_guild = $1 ",
      [
        guildName,
      ],
      (err, result) => {
        release();
        if (err) {
          throw err;
        }
        res.json(result.rows)
      });
  });
}


async function findGuildWhoAreNotInMyFaction(req, res) {
  console.log("Guilds Found !")
  const {
    myGuild
  } = req.body;

  pool.connect((err, client, release) => {
    client.query("SELECT id, guild_name, faction FROM public.account WHERE role = 'guild' and faction != (SELECT faction FROM public.account WHERE guild_name = $1)",
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
    client.query("SELECT * FROM public.war_proposed WHERE guild_proposeur = $1 or guild_attaquer = $1",
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

// FONCTION QUI RENVOIE LA COTE D'UNE GUILDE
async function getCote(req, res) {
  const {
    id
  } = req.body;

  pool.connect((err, client, release) => {

    client.query("SELECT cote FROM public.ladder WHERE id = $1",
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

async function getLooser(req, result) {

  let guildName_winner

  const {
    idWar,
    guildNameLooser
  } = req.body;

  await pool.query("SELECT * FROM public.war_proposed WHERE id = $1", [idWar])
    .then(res => {
      if (guildNameLooser === res.rows[0].guild_proposeur) {
        guildName_winner = res.rows[0].guild_attaquer
      }
      else {
        guildName_winner = res.rows[0].guild_proposeur
      }
      console.log(idWar)
      console.log(guildName_winner)
      result.json(guildName_winner)
    })
    .catch(err => console.error('Error in query 1', err.stack))

}

async function synchroniseElo(req, result) {

  let cote_team1
  let cote_team2
  let cotes_teams
  let guildName_winner
  let guildName_looser
  let data
  let dif_team1
  let dif_team2

  const {
    idWar,
    guildNameWinner
  } = req.body;

  // DELETE LA WAR QUI EST FINI
  await pool.query("UPDATE public.war_proposed SET archive = true WHERE ID = $1", [idWar])
    .then(console.log("terminado !"))
    .catch(err => console.error('Error in query 1', err.stack))


  await pool.query("SELECT * FROM public.war_proposed WHERE id = $1", [idWar])
    .then(res => {
      if (guildNameWinner === res.rows[0].guild_proposeur) {
        guildName_winner = res.rows[0].guild_proposeur,
          guildName_looser = res.rows[0].guild_attaquer
      }
      else {
        guildName_winner = res.rows[0].guild_attaquer,
          guildName_looser = res.rows[0].guild_proposeur
      }
      data = res.rows
      result.json("OK")
    })
    .catch(err => console.error('Error in query 1', err.stack))

  // TROUVE LES COTES
  // UPDATE LES COTES
  await pool.query("SELECT name, cote FROM public.ladder WHERE name = $1", [guildName_winner])
    .then(result => {
      cote_team1 = result.rows[0].cote,
        guildName_winner = result.rows[0].name
    })
    .catch(err => console.error('Error in query 1', err.stack))

  await pool.query("SELECT name, cote FROM public.ladder WHERE name = $1", [guildName_looser])
    .then(result => {
      cote_team2 = result.rows[0].cote,
        guildName_looser = result.rows[0].name
    })
    .catch(err => console.error('Error in query 1', err.stack))

  // UPDATE LES COTES
  cotes_teams = await returnNewElo(cote_team1, cote_team2, 1)

  cote_team1 = cotes_teams[0]
  cote_team2 = cotes_teams[1]

  dif_team1 = cotes_teams[4]
  dif_team2 = cotes_teams[5]

  // console.log("WINNER IS : " + guildName_winner)
  // console.log("NEW RANK")
  // console.log(cote_team1)
  // console.log(guildName_winner)

  // console.log("---------")

  // console.log("NEW RANK")
  // console.log(cote_team2)
  // console.log(guildName_looser)

  // UPDATE LA TEAM QUI WIN
  await pool.query("UPDATE public.ladder SET win = win + 1, cote = $1 WHERE name = $2", [cote_team1, guildName_winner])
    .catch(err => console.error('Error in query 1', err.stack))

  // UPDATE LA TEAM QUI LOOSE
  await pool.query("UPDATE public.ladder SET loose = loose + 1, cote = $1 WHERE name = $2", [cote_team2, guildName_looser])
    .catch(err => console.error('Error in query 1', err.stack))


  console.log(data)
  // INSERT EN TANT QUE LAST WAR
  await pool.query("INSERT INTO public.LAST_WARS (id, win_guild, loose_guild, heure, date, nombrejoueurs, win_cote, loose_cote) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      idWar,
      guildName_winner,
      guildName_looser,
      data[0].heure,
      data[0].date_war,
      data[0].nombrejoueurs,
      dif_team1,
      dif_team2
    ])
    .catch(err => console.error('Error in query last_war', err.stack))



}

async function PrevisualisesynchroniseElo(req, res) {

  let cote_team1
  let cote_team2
  let cotes_teams

  const {
    id_winner,
    id_looser
  } = req.body;

  // TROUVE LES COTES
  // UPDATE LES COTES
  await pool.query("SELECT cote FROM public.ladder WHERE id in ($1, $2)", [id_winner, id_looser])
    .then(result => {
      cote_team1 = result.rows[0].cote,
        cote_team2 = result.rows[1].cote
    })
    .catch(err => console.error('Error in query 1', err.stack))

  // UPDATE LES COTES
  cotes_teams = await returnNewElo(cote_team1, cote_team2, 1)
  cote_team1 = cotes_teams[0]
  cote_team2 = cotes_teams[1]
}



async function guildLoose(req, res) {
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

async function getLeaderboard(req, res) {
  pool.connect((err, client, release) => {

    client.query("SELECT *  FROM public.ladder INNER JOIN public.account ON public.account.guild_name = public.ladder.name and banned = false ORDER BY cote desc",
      (err, result) => {
        release();
        if (err) {
          throw err;
        }
        // let ranking = result.rows.forEach(function(team, i) {console.log(team.cote + ' ' + team.guild_name + ' ' + i +1) })
        res.json(result.rows);
      });
  });
}

async function createNewAccount(req, res) {
  const {
    pseudo,
    guild_name,
    password,
    faction,
    server
  } = req.body;

  // CREE LA GUILDE
  await pool.query("INSERT INTO public.account (pseudo, guild_name, password, faction, server) VALUES ($1, $2, $3, $4, $5)", [pseudo, guild_name, password, faction, server])
    .catch(err => console.error('Error in query 1', err.stack))

  // CREE LE LADDER DE LA GUILDE
  await pool.query("INSERT INTO public.ladder (name, win, loose) VALUES ($1, 0, 0)", [guild_name])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// SYSTEME DE ELO ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Calcul la probability de la team 1 de gagner (estimation)
function probabilyToWin(elo_team1, elo_team2) {
  let probability = (elo_team2 - elo_team1) / 400
  return 1 / (1 + Math.pow(10, probability))
}

// calcul la valeur de "rate" en fonction de son elo de départ (valeur_k)
function getRate(elo) {
  let rate = 0

  if (elo < 1000) {
    rate = 80
  }
  else if (elo >= 1000 && elo < 2000) {
    rate = 50
  }
  else if (elo >= 2000 && elo <= 2400) {
    rate = 30
  }
  else if (elo > 2400) {
    rate = 20
  }
  return rate;
}

// calcul la nouvelle côte de la team 1 (calcul_elo_p1)
function newElo(elo_team1, elo_team2, score) {
  let rate = getRate(elo_team1)
  let probability = probabilyToWin(elo_team1, elo_team2)
  let newRank = elo_team1 + rate * (score - probability)

  if (newRank < 300) {
    newRank = 300
  }

  return [newRank, probability]
}

// Calcul des nouvelles côtes de P1 & P2
// SCORE = 1 si P1 WIN
// SCORE = 0 si P1 LOOSE
// SCORE = 0.5 si MATCH NUL
function newRanks(elo_team1, elo_team2, score_team1) {

  // Score pour P2
  let score_team2 = 1 - score_team1

  // CALCUL POUR P1
  let calcul_elo_team1 = newElo(elo_team1, elo_team2, score_team1)
  let probability_team1 = calcul_elo_team1[1] // RETURN LA PROBA TEAM 1
  let elo_p1 = Math.round(calcul_elo_team1[0]) // RETURN LE NEW ELO TEAM 1

  // CALCUL POUR P2
  let calcul_elo_team2 = newElo(elo_team2, elo_team1, score_team2)
  let probability_team2 = calcul_elo_team2[1] // RETURN LA PROBA TEAM 2
  let elo_p2 = Math.round(calcul_elo_team2[0]) // RETURN LE NEW ELO TEAM 2

  return [elo_p1, elo_p2, probability_team1, probability_team2]
}

// afficher la différence
function display_difference(nombre) {
  if (nombre >= 0) {
    nombre = nombre
  }
  return nombre
}

// Convertir en pourcentage
function convert_to_pourcent(nombre) {
  // console.log(Math.round(nombre * 100, 2) + '' + ' %')
  return Math.round(nombre * 100, 2) + ' %'
}


async function returnNewElo(elo_team1, elo_team2, SCORE) {

  retour = newRanks(elo_team1, elo_team2, SCORE)

  elo_p1 = retour[0]
  elo_p2 = retour[1]
  proba_p1 = retour[2]
  proba_p2 = retour[4]

  difference_p1 = display_difference(elo_p1 - elo_team1)
  difference_p2 = display_difference(elo_p2 - elo_team2)

  console.log("*** RANKING ***")
  console.log("COTE AVANT")
  console.log("TEAM 1 : " + elo_team1)
  console.log("TEAM 2 : " + elo_team2)
  console.log("APRES MATCH")
  console.log("TEAM 1 :" + elo_p1 + " | VARIATION " + difference_p1)
  console.log("TEAM 2 :" + elo_p2 + " | VARIATION " + difference_p2)

  return [elo_p1, elo_p2, proba_p1, proba_p2, difference_p1, difference_p2]

}

// retour = newRanks(elo_team1, elo_team2, SCORE)

// elo_p1 = retour[0]
// elo_p2 = retour[1]
// console.log(elo_p1)
// console.log(elo_p2)
// proba_p1 = retour[2]
// proba_p2 = retour[4]

// difference_p1 = display_difference(elo_p1 - elo_team1)
// difference_p2 = display_difference(elo_p2 - elo_team2)

// console.log("*** RANKING ***")
// console.log("COTE AVANT")
// console.log("TEAM 1 : " + elo_team1)
// console.log("TEAM 2 : " + elo_team2)
// console.log("APRES MATCH")
// console.log("TEAM 1 :" + elo_p1 +" | VARIATION "+difference_p1)
// console.log("TEAM 2 :" + elo_p2 +" | VARIATION "+difference_p2)


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////SYSTEME ADMIN//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function banGuild(req, res) {
  const {
    idGuild
  } = req.body;

  // BAN LA GUILDE
  await pool.query("UPDATE PUBLIC.ACCOUNT SET banned = true WHERE ID = $1", [idGuild])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

async function unBanGuild(req, res) {
  const {
    idGuild
  } = req.body;

  // UNBAN LA GUILDE
  await pool.query("UPDATE PUBLIC.ACCOUNT SET banned = false WHERE ID = $1", [idGuild])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}


async function warnGuild(req, res) {
  const {
    idGuild
  } = req.body;

  // WARN LA GUILD
  await pool.query("UPDATE PUBLIC.ACCOUNT SET warn = warn + 1 WHERE ID = $1", [idGuild])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

async function unWarnGuild(req, res) {
  const {
    idGuild
  } = req.body;

  // UNWARN LA GUILD
  await pool.query("UPDATE PUBLIC.ACCOUNT SET warn = warn - 1 WHERE ID = $1", [idGuild])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

async function cancelMatch(req, res) {

  let winner_name
  let winner_cote
  let looser_name
  let looser_cote

  const {
    idWar
  } = req.body;

  await pool.query("SELECT * FROM PUBLIC.LAST_WARS WHERE id = $1", [idWar])
    .then(res => {
      winner_name = res.rows[0].win_guild,
        winner_cote = res.rows[0].win_cote,
        looser_name = res.rows[0].loose_guild,
        looser_cote = res.rows[0].win_cote
    })
    .catch(err => console.error('Error in query 1', err.stack))

  // DELETE LA WAR
  await pool.query("DELETE FROM PUBLIC.LAST_WARS WHERE id = $1", [idWar])
    .catch(err => console.error('Error in query 1', err.stack))

  // GAGNANT REVIENT EN ARRIERE
  await pool.query("UPDATE PUBLIC.LADDER SET cote = cote - $1, win = win - 1 WHERE name = $2", [winner_cote, winner_name])
    .catch(err => console.error('Error in query 1', err.stack))

  // PERDANT REVIENT EN ARRIERE
  await pool.query("UPDATE PUBLIC.LADDER SET cote = cote + $1, loose = loose - 1 WHERE name = $2", [looser_cote, looser_name])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

async function replayMatch(req, res) {

  let winner_name
  let winner_cote
  let looser_name
  let looser_cote

  const {
    idWar
  } = req.body;

  await pool.query("SELECT * FROM PUBLIC.LAST_WARS WHERE id = $1", [idWar])
    .then(res => {
      winner_name = res.rows[0].win_guild,
        winner_cote = res.rows[0].win_cote,
        looser_name = res.rows[0].loose_guild,
        looser_cote = res.rows[0].win_cote
    })
    .catch(err => console.error('Error in query 1', err.stack))

  // REACTIVE LA WAR REVIENT EN ARRIERE
  await pool.query("UPDATE PUBLIC.WAR_PROPOSED SET archive = false WHERE id = $1", [idWar])
    .catch(err => console.error('Error in query 1', err.stack))

  // DELETE LA WAR
  await pool.query("DELETE FROM PUBLIC.LAST_WARS WHERE id = $1", [idWar])
    .catch(err => console.error('Error in query 1', err.stack))

  // GAGNANT REVIENT EN ARRIERE
  await pool.query("UPDATE PUBLIC.LADDER SET cote = cote - $1, win = win - 1 WHERE name = $2", [winner_cote, winner_name])
    .catch(err => console.error('Error in query 1', err.stack))

  // PERDANT REVIENT EN ARRIERE
  await pool.query("UPDATE PUBLIC.LADDER SET cote = cote + $1, loose = loose - 1 WHERE name = $2", [looser_cote, looser_name])
    .catch(err => console.error('Error in query 1', err.stack))

  res.json("OK")
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
  getGuild,
  getLastWars,
  getAllLastWars,
  getUpcomingWars,
  getServerList,
  checkLogin,
  findGuildWhoAreNotInMyFaction,
  getMyWarProposed,
  getMyWarIHaveToAccept,
  declareWarTo,
  acceptWar,
  declineWar,
  synchroniseElo,
  guildLoose,
  getLeaderboard,
  getCote,
  getLooser,
  createNewAccount,
  getAccountData,
  getAllGuild,
  banGuild,
  unBanGuild,
  warnGuild,
  unWarnGuild,
  getBannedGuild,
  cancelMatch,
  replayMatch,
  getAllResultOfMyGuild
};