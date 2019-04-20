var express = require('express')
var app = express()
var cors = require('cors')
const port = 8000

var pgp = require('pg-promise')()


app.use(cors())

// respond with "hello world" when a GET request is made to the homepage
app.get('/datasets', function (req, res) {
  let db = pgp('postgres://postgres@localhost:5432/postgres')
  db.any(`SELECT datname FROM pg_database WHERE pg_database.datname NOT LIKE 'postgres' AND pg_database.datname NOT LIKE 'template%';`)
  .then(function (data) {
    res.send(data.map( (val) => val.datname))
  })
  .catch(function (error) {
    console.log('ERROR: ', error)
  })
  // res.send('["datset1","otherdata"]')
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
