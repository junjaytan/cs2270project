export function changeSelectedDataset(data) {
  return({ type: 'CHANGE_SELECTED_DATASET', data})
}

export function changeQueryType(data) {
  return({ type: 'CHANGE_QUERY_TYPE', data})
}

export function changeMinVal(data) {
  return({ type: 'CHANGE_MIN_VAL', data})
}

export function changeMaxVal(data) {
  return({ type: 'CHANGE_MAX_VAL', data})
}

export function changeStartTS(data) {
  return({ type: 'CHANGE_START_TS', data})
}

export function changeEndTS(data) {
  return({ type: 'CHANGE_END_TS', data})
}

export function changeLoadingStats(data) {
  return({ type: 'CHANGE_LOADING_STATS', data})
}

export function changeLoadingCharts(data) {
  return({ type: 'CHANGE_LOADING_CHART', data})
}

export function fetchDatasets(data) {
  return({ type: 'CHANGE_DATASETS', data})
}

export function fetchStats(data) {
  return({ type: 'CHANGE_STATS', data});
}

export function searchData(data) {
  return({ type: 'CHANGE_DATA', data})
}

export function changeError(data) {
  return({ type: 'CHANGE_ERROR', data})
}

export function changeDbParams(data) {
  return({ type: 'CHANGE_DBPARAMS', data})
}

export function changeBackendConnSuccess(data) {
  return({ type: 'CHANGE_BACKEND_CONN_SUCCESS', data})
}

export function changeDbQuerySuccess(data) {
  return({ type: 'CHANGE_DBQUERY_SUCCESS', data});
}

export function changeDbErrorMsg(data) {
  return({ type: 'CHANGE_DB_ERROR_MSG', data});
}

export function changeChartPane(data) {
  return({ type: 'CHANGE_CHART_PANE', data})
}

export function changeMainChart(data) {
  return({ type: 'CHANGE_MAIN_CHART', data})
}

export function changeMainChartData(data) {
  return({ type: 'CHANGE_MAIN_CHART_DATA', data})
}
