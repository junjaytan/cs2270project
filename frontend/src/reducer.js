import Immutable from 'seamless-immutable';

const initialState = Immutable({
  // if true, means connection to express backend succeeded
  // (note that db connection and/or query itself may still fail)
  backendConnSuccess: null,
  dbParams: {
              host: 'localhost',
              dbName: 'ecgdb',
              user: 'postgres',
              pw: 'postgres',
              schema: "public",
              metadataTable: "anomaly_meta"
            },
  dbErrorMsg: '',   // used if db connection or query fails
  dbQuerySuccess: null,
  responseCode: null,  // express http response code
  selectedDataset: "",
  datasets: [],
  stats: {},
  queryType: { query: "", symbol: "", fields: []},
  minVal: 0,
  maxVal: 300,
  error: "",
  data: [],
  loadingStats: false, // if spinner should be showing
  loadingCharts: false,
  startTS: null,
  endTS: null,
  chartPane: "tsmini",
  mainChart: { startTS: null, endTS: null }
});


export default function reduce(state = initialState, action = {}) {
  console.log(state);
  console.log(action);
  switch (action.type) {
    case 'CHANGE_DATA':
      return state.merge({
        data: action.data
      });
    case 'CHANGE_DBPARAMS':
      return state.merge({
        dbParams: action.data
      });
    case 'CHANGE_BACKEND_CONN_SUCCESS':
      return state.merge({
        backendConnSuccess: action.data
      });
    case 'CHANGE_DB_ERROR_MSG':
      return state.merge({
        dbErrorMsg: action.data
      });
    case 'CHANGE_DBQUERY_SUCCESS':
      return state.merge({
        dbQuerySuccess: action.data
      });
    case 'CHANGE_SELECTED_DATASET':
      return state.merge({
        selectedDataset: action.data
      });
    case 'CHANGE_DATASETS':
      return state.merge({
        datasets: action.data
      });
    case 'CHANGE_STATS':
      return state.merge({
        stats: action.data
      });
    case 'CHANGE_QUERY_TYPE':
      return state.merge({
        queryType: action.data
      });
    case 'CHANGE_MIN_VAL':
      return state.merge({
        minVal: action.data
      });
    case 'CHANGE_MAX_VAL':
      return state.merge({
        maxVal: action.data
      });
    case 'CHANGE_START_TS':
      return state.merge({
        startTS: action.data
      });
    case 'CHANGE_END_TS':
      return state.merge({
        endTS: action.data
      });
    case 'CHANGE_LOADING_STATS':
      return state.merge({
        loadingStats: action.data
      });
    case 'CHANGE_LOADING_CHART':
      return state.merge({
        loadingCharts: action.data
      });
    case 'CHANGE_CHART_PANE':
      return state.merge({
        chartPane: action.data
      });
    case 'CHANGE_MAIN_CHART':
      return state.merge({
        mainChart: action.data
      });
    case 'CHANGE_ERROR':
      return state.merge({
        error: action.data
      });
    default:
      return state;
  }
}

export function getData(state) {
  return state.data;
}

export function getDbParams(state) {
  return state.dbParams;
}

export function getBackendConnSuccess(state) {
  return state.backendConnSuccess;
}

export function getDbErrorMsg(state) {
  return state.dbErrorMsg;
}

export function getDbQuerySuccess(state) {
  return state.dbQuerySuccess;
}

export function getSelectedDataset(state) {
  return state.selectedDataset;
}

export function getDatasets(state) {
  return state.datasets;
}

export function getStats(state) {
  return state.stats;
}

export function getQueryType(state) {
  return state.queryType;
}

export function getMinVal(state) {
  return state.minVal;
}

export function getMaxVal(state) {
  return state.maxVal;
}

export function getStartTS(state) {
  return state.startTS;
}

export function getEndTS(state) {
  return state.endTS;
}

export function getLoadingStats(state) {
  return state.loadingStats;
}

export function getLoadingCharts(state) {
  return state.loadingCharts;
}

export function getChartPane(state) {
  return state.chartPane;
}

export function getMainChart(state) {
  return state.mainChart;
}

export function getError(state) {
  return state.error;
}
