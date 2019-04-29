var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');  // reqd for parsing request body in express4+
const port = 8000;

const pgp = require('pg-promise')();

app.use(cors());
app.use(bodyParser());


// DB global connection params
// These will be initialized when we first fetch a list of datasets
// and reused for subsequent requests
var globalDbUser = '';
var globalDbPw = '';
var globalDbName = '';
var globalDbHost = '';
var globalDbPort = '5432';
var globalIsDbConnected = false;
var globalDbconn;  // holds the db connection instance
var globalDbSchema = '';

// Cache all available datasets we've found keyed by dataset name
// (i.e., postgres table name)
var globalDatasets = {};

// Each dataset will be represented as an instance of this class
class Dataset {
  constructor(name) {
    this.datetimeCol = null;
    this.valueCol = null;
    this.detectorRawValuesCol = null;  // Column that holds AD raw output
    this.threshold = null;  // The actual numerical threshold
    // currently a string, e.g., 'greater_than' 'less_than',
    // 'greaterorequal_than', lessorequal_than'
    this.thresholdComparator = null;

    this.stats = null;  // A plain ol JS object.

    // Whether table has appended lagging timestamp column
    this.laggingTSColExists = false;
    this.laggingTSCol = null;  // name of column
  }

  setDatetimeColName(colName) {
    this.datetimeCol = colName;
  }

  getDateTimeColName() {
    return this.datetimeCol;
  }

  setValueColName(colName) {
    this.valueCol = colName;
  }

  getValueColName() {
    return this.valueCol;
  }

  setDetectorRawValuesColName(colName) {
    this.detectorRawValuesCol = colName;
  }

  getDetectorRawValuesColName() {
    return this.detectorRawValuesCol;
  }

  getThreshold() {
    return this.threshold;
  }

  setThreshold(value) {
    this.threshold = value;
  }

  setThresholdComparatorStr(value) {
    this.thresholdComparator = value;
  }

  getThresholdComparatorStr() {
    return this.thresholdComparator;
  }

  setStats(stats) {
    this.stats = stats;
  }

  getStats() {
    // Returns null if no stats have been calculated yet.
    return this.stats;
  }

  setLaggingTSColName(value) {
    // This sets it appropriately even if input is null or empty string.
    console.log('Lagging TS Col name is: ' + value);
    if (value) {
      this.laggingTSCol = value;
      this.laggingTSColExists = true;
    }
  }

  getLaggingTSColName() {
    return this.laggingTSCol;
  }

  hasLaggingTSCol() {
    return this.laggingTSColExists;
  }
}


// Do not create multiple connections if one already exists
function initializeOrResetDB(user, pw, host, port, db, schema) {
  if (!globalIsDbConnected) {
    globalDbUser = user;
    globalDbPw = pw;
    globalDbHost = host;
    // Using hard coded port
    globalDbName = db;
    globalDbSchema = schema;

    let pgUri = `postgres://${user}:${pw}@${host}:${port}/${globalDbName}`;
    globalDbconn = pgp(pgUri);

    globalIsDbConnected = true;
    return;
  }

  // Stop current connection and recreate a new one if settings have changed.
  if (globalIsDbConnected && (user != globalDbUser || pw != globalDbPw ||
    host != globalDbHost || db != globalDbName)) {
      pgp.end();

      globalDbUser = user;
      globalDbPw = pw;
      globalDbHost = host;
      // Using hard coded port
      globalDbName = db;

      let pgUri = `postgres://${user}:${pw}@${host}:${port}/${globalDbName}`;
      globalDbconn = pgp(pgUri);
  }
  // Otherwise using the same db connection, so don't create another connection.
}

app.post('/datasets', function (req, res) {

  // Each time we run this request, clear the cache of existing datasets
  globalDatasets = {};

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
  let datetimeColNameMetaCol = 'ts_colname';
  let thresholdColNameMetaCol = 'threshold_colname';
  let valueColNameMetaCol = 'value_colname';
  let thresholdCol = 'threshold';  // this col holds the actual numerical threshold
  let thresholdComparatorCol = 'comparator';
  let prevTSCol = 'ts_lag_colname';
  let port = globalDbPort;

  // Verify required params are not empty before trying to connect to DB.
  // Reminder: pw can be empty string
  // TODO: I don't think this is correct expressjs error handling...
  if (!user || !host || !db || !schema || !metadataTable) {
    res.status(400);
    res.send('Mising a required DB connection parameter! ' +
             'You must provide user, host, dbName, schema, and metadataTable');
    return;
  }

  // Do not create a new database connection each time this endpoint is pinged.
  // Instead, we either close the existing connection (if new db params are provided)
  // or use the existing client.
  initializeOrResetDB(user, pw, host, port, db, schema);

  // Return all metadata, since we'll need it for later requests
  let query = `SELECT * FROM "${schema}"."${metadataTable}";`;

  globalDbconn.any(query).then(
    function (data) {
      res.status(200);
      // Cache dataset metadata so we can reuse it for other requests
      // Use a for loop so we can easily append additional metadata as the need
      // arises
      for (let i = 0; i < data.length; i++) {
        let curTblRow = data[i];
        let curDataTableName = curTblRow[datatableNameColumn];
        globalDatasets[curDataTableName] = new Dataset(curDataTableName);

        globalDatasets[curDataTableName].setDatetimeColName(
          curTblRow[datetimeColNameMetaCol]);
        globalDatasets[curDataTableName].setDetectorRawValuesColName(
          curTblRow[thresholdColNameMetaCol]);
        globalDatasets[curDataTableName].setValueColName(
          curTblRow[valueColNameMetaCol]);
        globalDatasets[curDataTableName].setThreshold(parseFloat(
          curTblRow[thresholdCol]));
        globalDatasets[curDataTableName].setThresholdComparatorStr(
          curTblRow[thresholdComparatorCol]);
        globalDatasets[curDataTableName].setLaggingTSColName(
          curTblRow[prevTSCol]);
      }
      res.send(data.map( (val) => val[datatableNameColumn]));
    })
  .catch(function (error) {
    let errorMsg = String(error);
    res.status(500);
    res.send(errorMsg);
  })
})

app.get('/datasetstats', function (req, res) {
  let datasetId = req.query.dataset;

  if (!datasetId || !(datasetId in globalDatasets)) {
    res.status(400);
    res.send('Missing or unrecognized dataset name. ' +
             'Please provide query param "dataset"');
    return;
  }

  let num_rows = null;
  let oldest_ts = null;
  let newest_ts = null;

  let ts_colname = globalDatasets[datasetId].getDateTimeColName();
  let detectorValColName = globalDatasets[datasetId].getDetectorRawValuesColName();

  // Use previously cache stats if available. Otherwise, cache after we get results.
  if (globalDatasets[datasetId].getStats()) {
    console.log("using cached dataset stats.");
    res.status(200);
    res.send(globalDatasets[datasetId].getStats());
    return;
  }

  // Note that schema is from the global var set during previous fetch datasets
  // request.
  query = `SELECT COUNT(*) AS num_rows, MIN("${ts_colname}") as oldest_ts, ` +
  `MAX("${ts_colname}") AS newest_ts, MIN("${detectorValColName}") as detector_min, ` +
  `MAX("${detectorValColName}") as detector_max FROM "${globalDbSchema}"."${datasetId}";`;
  console.log('running query:');
  console.log(query);

  globalDbconn.one(query)
    .then(function (data) {
      console.log("success query");
      result = {
        'rows': parseInt(data['num_rows']),
        'oldestTs': String(data['oldest_ts']),  // just return dates as strings
        'newestTs': String(data['newest_ts']),
        'threshold': globalDatasets[datasetId].getThreshold(),
        'thresholdComparator': globalDatasets[datasetId].getThresholdComparatorStr(),
        'detectorMin': data['detector_min'],
        'detectorMax': data['detector_max']
      }
      globalDatasets[datasetId].setStats(result);  // cache in JSON

      res.status(200);
      res.send(result);
    })
    .catch(function (error) {
      let errorMsg = String(error);
      res.status(500);
      res.send(errorMsg);
    })
})

app.get('/data', function (req, res) {
  let datasetId = req.query.dataset;

  if (!datasetId || !(datasetId in globalDatasets)) {
    res.status(400);
    res.send('Missing or unrecognized dataset name. ' +
             'Please provide query param "dataset"');
    return;
  }

  let table = 'NULL::' + globalDbSchema + '.' + datasetId;
  let ts_col = globalDatasets[datasetId].getDateTimeColName();
  let prev_ts_col = globalDatasets[datasetId].getLaggingTSColName();
  let anomaly_col = globalDatasets[datasetId].getDetectorRawValuesColName();
  let value_col = globalDatasets[datasetId].getValueColName();
  let min = Number(req.query.min);
  let max = Number(req.query.max);
  let start = req.query.start;
  let end = req.query.end;

  let query = '';
  let params = [];
  if (globalDatasets[datasetId].hasLaggingTSCol()) {
    // If there is an additional column with lagging timestamp, run the appropriate
    // faster function
    query = `SELECT segment_start_ts as start_date, MAX(cur_ts) AS end_date,
    COUNT(*) AS number_points, json_agg(value_to_passthru ORDER BY cur_ts) AS json_agg
    FROM filter_segments($1:raw, $2, $3, $4, $5, $6, $7)
    WHERE segment_start_ts >= $8
    AND segment_start_ts <= $9
    GROUP BY segment_start_ts
    ORDER BY number_points DESC
    LIMIT 10;`;
    params = [table, ts_col, prev_ts_col, anomaly_col, value_col, min, max, start, end];
  } else {
    query = `SELECT segment_start_ts as start_date, MAX(cur_ts) AS end_date,
    COUNT(*) AS number_points, json_agg(value_to_passthru ORDER BY cur_ts) AS json_agg
    FROM filter_segments($1:raw, $2, $3, $4, $5, $6)
    WHERE segment_start_ts >= $7
    AND segment_start_ts <= $8
    GROUP BY segment_start_ts
    ORDER BY number_points DESC
    LIMIT 10;`;
    params = [table, ts_col, anomaly_col, value_col, min, max, start, end];
  }
  console.log('running segment search query:');
  console.log(query);

  globalDbconn.any(query, params)
  .then(function (data) {
    res.status(200);
    res.send(data);
  })
  .catch(function (error) {
    let errorMsg = String(error);
    res.status(500);
    res.send(errorMsg);
    console.log('ERROR:', error)
  })
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
