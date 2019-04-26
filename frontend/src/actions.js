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

export function fetchDatasets(data) {
  return({ type: 'CHANGE_DATASETS', data})
}

export function fetchStats(data) {
  return({ type: 'CHANGE_STATS', data})
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