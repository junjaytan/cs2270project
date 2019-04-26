import Immutable from 'seamless-immutable';

const initialState = Immutable({
  dbParams: {},
  selectedDataset: "",
  datasets: [],
  stats: {},
  queryType: { query: "", symbol: "", fields: []},
  minVal: 0,
  maxVal: 300,
  error: "",
  data: []
});


export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case 'CHANGE_DATA':
      return state.merge({
        data: action.data
      });
    case 'CHANGE_DBPARAMS':
      return state.merge({
        dbParams: action.data
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

export function getError(state) {
  return state.error;
}
