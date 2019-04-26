var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');  // reqd for parsing request body in express4+
const port = 8000;

const pgp = require('pg-promise')();

app.use(cors());
app.use(bodyParser());


// DB global connection params
var dbUser = '';
var dbPw = '';
var dbName = '';
var dbHost = '';
var dbPort = '5432';
var isDbConnected = false;
var dbconn;  // holds the db connection instance


// Do not create multiple connections if one already exists
function initializeOrResetDB(user, pw, host, port, db) {
  if (!isDbConnected) {
    dbUser = user;
    dbPw = pw;
    dbHost = host;
    // Using hard coded port
    dbName = db;

    let pgUri = `postgres://${user}:${pw}@${host}:${port}/${dbName}`;
    dbconn = pgp(pgUri);

    isDbConnected = true;
    return;
  }

  // Stop current connection and recreate a new one if settings have changed.
  if (isDbConnected && (user != dbUser || pw != dbPw ||
    host != dbHost || db != dbName)) {
      pgp.end();

      dbUser = user;
      dbPw = pw;
      dbHost = host;
      // Using hard coded port
      dbName = db;

      let pgUri = `postgres://${user}:${pw}@${host}:${port}/${dbName}`;
      dbconn = pgp(pgUri);
  }
  // Otherwise using the same db connection, so don't create another connection.
}

app.post('/datasets', function (req, res) {

  let user = req.body.user;
  let pw = '';
  if (req.body.pw) {
    pw = req.body.pw;
  }
  let host = req.body.host;
  let db = req.body.dbName;
  let schema = req.body.schema;
  let metadataTable = req.body.metadataTable;

  // Hard coded for now, but variables in case we need to
  // parameterize these in the future
  let datatableNameColumn = 'data_tablename';
  let port = '5432';

  // Verify required params are not empty before trying to connect to DB.
  // Reminder: pw can be empty string
  // TODO: I don't think this is correct expressjs error handling...
  if (!user || !host || !db || !schema || !metadataTable) {
    res.status(400);
    res.send('Mising a required DB connection parameter! ' +
             'You must provide user, host, dbName, schema, and metadataTable');
    return;
  }

  initializeOrResetDB(user, pw, host, port, db);

  let query = `SELECT "${datatableNameColumn}" FROM "${schema}"."${metadataTable}";`;

  // TODO: Prevent creating a second database connection. Need to either close
  // it or create a pool of connections we can reuse.
  dbconn.any(query).then(
    function (data) {
      res.status(200);
      res.send(data.map( (val) => val[datatableNameColumn]))
    })
  .catch(function (error) {
    let errorMsg = 'Error: ' + error;
    console.log(errorMsg);
    res.status(500);
    res.send(errorMsg);
  })
})

app.get('/stats', function (req, res) {
  let dbCon = 'postgres://postgres@localhost:5432/' + req.query.dataset;
  let db = pgp(dbCon);
  db.one(`SELECT * FROM anomaly_meta;`)
  .then(function (data) {
    res.send(data)
  })
  .catch(function (error) {
    console.log('ERROR: ', error)
  })
})

app.get('/data', function (req, res) {
  console.log(req.query);
  let dbCon = 'postgres://postgres@localhost:5432/' + req.query.dataset;
  let db = pgp(dbCon);
  let table = 'NULL::public.' + req.query.table;
  let ts_col = req.query.tscol;
  let anomaly_col = req.query.thresholdcol;
  let value_col = req.query.valuecol;
  let min = Number(req.query.min);
  let max = Number(req.query.max);
  console.log([table, ts_col, anomaly_col, value_col, min, max]);
  db.any(`SELECT segment_start_ts as start_date, MAX(cur_ts) AS end_date, COUNT(*) AS number_points, json_agg(value_to_passthru ORDER BY cur_ts) AS json_agg
  FROM filter_segments($1:raw, $2, $3, $4, $5, $6)
  GROUP BY segment_start_ts
  ORDER BY number_points DESC
  LIMIT 10;`, [table, ts_col, anomaly_col, value_col, min, max])
  .then(function (data) {
    res.send(data)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
