const SERVER_URL = "http://localhost:8000"

class Client {

  /**
   *
   * @param {*} dbParams is an object structured like state.db
   * in ChartOptions.
   */
  async getDatasets(dbParams) {

    let response = await fetch(SERVER_URL + "/datasets", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: dbParams.host,
        user: dbParams.user,
        pw: dbParams.pw,  // Obviously not a secure way to send this, but oh well...
        dbName: dbParams.dbName,
        schema: dbParams.schema,
        metadataTable: dbParams.metadataTable,
      })
    });
    return await response.json();
  }

  async getStats(database) {
    console.log("getting stats");
    let response = await fetch(SERVER_URL + "/stats?dataset=" + database);
    return await response.json();
  }

  async searchData(queryInfo) {
    console.log("getting data");
    let response = await fetch(SERVER_URL + "/data?dataset=" + queryInfo.dataset
      + "&table=" + queryInfo.stats.data_tablename
      + "&tscol=" + queryInfo.stats.ts_colname
      + "&thresholdcol=" + queryInfo.stats.threshold_colname
      + "&valuecol=" + queryInfo.stats.value_colname
      + "&min=" + queryInfo.min
      + "&max=" + queryInfo.max
    );
    return await response.json();
  }

}

export default new Client();
