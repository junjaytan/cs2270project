const SERVER_URL = "http://localhost:8000"

class Client {

  async getDatasets() {
    console.log("getting datasets");
    let response = await fetch(SERVER_URL + "/datasets");
    return await response.json();
  }

  async getStats(dataset) {
    console.log("getting stats");
    let response = await fetch(SERVER_URL + "/stats?dataset=" + dataset);
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
