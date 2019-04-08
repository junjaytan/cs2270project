const SERVER_URL = "http://localhost:8000"

class Client {

  static async getTimeSeries(id: string, granularity: string, aggregation: string): Promise<TimeseriesModel> {
    let response = await fetch(this.constructUrl("timeseries/" + id + "?granularity=" + granularity + "&aggregation=" + aggregation));
    return await response.json();
  }

  async getDatasets() {
    console.log("getting a datset");
    let response = await fetch(SERVER_URL + "/datasets");
    return await response.json();
  }

  async searchData() {
    console.log("getting data");
    let response = await fetch(SERVER_URL + "/data");
    return await response.json();
  }

  static async setCustomDataset(timeseries:Array<Array<number>>) {
    let url = this.constructUrl("setcustomdataset")
    let response = await fetch(url,
      {
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(timeseries)
      });
    return await response.json();
  }

}

export default new Client();
