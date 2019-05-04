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
    return await response;
  }

  async getStats(database) {
    let response = await fetch(SERVER_URL + "/datasetstats?dataset=" + database);
    return await response;
  }

  async searchData(queryInfo) {
    // console.log("searching data");
    let response = await fetch(SERVER_URL + "/data?dataset=" + queryInfo.dataset
      + "&min=" + queryInfo.min
      + "&max=" + queryInfo.max
      + "&start=" + queryInfo.start
      + "&end=" + queryInfo.end
    );
    return await response;
  }

  async getRawData(queryInfo) {
    // console.log("getting data");
    let response = await fetch(SERVER_URL + "/rawdata?dataset=" + queryInfo.dataset
      + "&start=" + queryInfo.start
      + "&end=" + queryInfo.end
    );
    return await response;
  }

}

export default new Client();
