var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');  // reqd for parsing request body in express4+
const port = 8000;

var pgp = require('pg-promise')();

app.use(cors());
app.use(bodyParser());

// respond with "hello world" when a GET request is made to the homepage
app.post('/datasets', function (req, res) {

  let user = req.body.user;
  let pw = '';
  if (req.body.pw) {
    pw = req.body.pw;
  }
  let host = req.body.host;
  let dbName = req.body.dbName;
  let schema = req.body.schema;
  let metadataTable = req.body.metadataTable;

  // Hard coded for now, but variables in case we need to
  // parameterize these in the future
  let datatableNameColumn = 'data_tablename';
  let port = '5432';

  // Verify required params are not empty before trying to connect to DB.
  // Reminder: pw can be empty string
  // TODO: I don't think this is correct expressjs error handling...
  if (!user || !host || !dbName || !schema || !metadataTable) {
    res.status(400);
    res.send('Mising a required DB connection parameter. ' +
             'You must provider user, host, dbName, schema, and metadataTable');
    return;
  }

  let pgUri = `postgres://${user}:${pw}@${host}:${port}/${dbName}`;
  let dbconn = pgp(pgUri);

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
