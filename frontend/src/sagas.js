import { takeLatest, takeEvery, call, put, all } from 'redux-saga/effects';
import Client from './client';
import * as actions from './actions'

// -------------FETCHING SAGAS -----------------
function* fetchDatasets(action) {
  yield put(actions.fetchDatasets([]));  // Reset datasets dropdown to empty
  // Reset stats table before each request attempt.
  yield put(actions.fetchStats({}));

  try {
    const resp = yield call(Client.getDatasets, action.payload.dbParams);
    let httpstatus = resp.status;
    let queryErrText = '';
    let querySuccess = null;
    let respBody = null;

    if (httpstatus !== 200) {
      // 400 or 500 means the query failed.
      // This may be because your db connection params are wrong
      // and the db is not available there, or your query is malformed.
      querySuccess = false;
      respBody = yield resp.text();
      queryErrText = respBody;
    } else {
      querySuccess = true;
      respBody = yield resp.json();
      yield put(actions.fetchDatasets(respBody));
    }
    yield put(actions.changeBackendConnSuccess(true));
    yield put(actions.changeDbQuerySuccess(querySuccess))
    yield put(actions.changeDbErrorMsg(queryErrText));

  } catch(error) {
    // Backend is not available!
    yield put(actions.changeBackendConnSuccess(false));
  }
}

function* fetchStats(action) {
  // Reset stats table before each request attempt.
  yield put(actions.fetchStats({}));

  try {
    yield put(actions.changeLoadingStats(true));
    const resp = yield call(Client.getStats, action.payload.dataset);
    let httpstatus = resp.status;
    let querySuccess = null;
    let respBody = null;
    let queryErrText = '';

    if (httpstatus !== 200) {
      querySuccess = false;
      respBody = yield resp.text();
      queryErrText = respBody;
    } else {
      querySuccess = true;
      respBody = yield resp.json();
      let startTS = yield new Date(respBody.oldestTs).toISOString().slice(0,23);
      let endTS = yield new Date(respBody.newestTs).toISOString().slice(0,23);
      yield put(actions.fetchStats(respBody));
      if (respBody.thresholdComparator === ">="){
        yield put(actions.changeMinVal(respBody.threshold));
        yield put(actions.changeMaxVal(respBody.detectorMax));
      } else if (respBody.thresholdComparator === "<=") {
        yield put(actions.changeMinVal(respBody.detectorMin));
        yield put(actions.changeMaxVal(respBody.threshold));
      } else{
        yield put(actions.changeMinVal(respBody.detectorMin));
        yield put(actions.changeMaxVal(respBody.detectorMax));
      }

      yield put(actions.changeStartTS(startTS));
      yield put(actions.changeEndTS(endTS));
    }
    yield put(actions.changeDbQuerySuccess(querySuccess))
    yield put(actions.changeDbErrorMsg(queryErrText));
    yield put(actions.changeLoadingStats(false));
  } catch(error) {
    // Backend is not available!
    yield put(actions.changeBackendConnSuccess(false));
  }
}

function* searchData(action) {

  try {
    yield put(actions.changeLoadingCharts(true));
    const resp = yield call(Client.searchData, action.payload);
    let httpstatus = resp.status;
    let querySuccess = null;
    let respBody = null;
    let queryErrText = '';

    if (httpstatus !== 200) {
      querySuccess = false;
      respBody = yield resp.text();
      queryErrText = respBody;
    } else {
      querySuccess = true;
      respBody = yield resp.json();
      yield put(actions.searchData(respBody));
    }
    yield put(actions.changeDbQuerySuccess(querySuccess))
    yield put(actions.changeDbErrorMsg(queryErrText));
    yield put(actions.changeLoadingCharts(false));
  } catch(error) {
    // Backend is not available!
    yield put(actions.changeBackendConnSuccess(false));
  }
}

function* fetchRawData(action) {

  try {
    const resp = yield call(Client.getRawData, action.payload);
    let httpstatus = resp.status;
    let querySuccess = null;
    let respBody = null;
    let queryErrText = '';

    if (httpstatus !== 200) {
      querySuccess = false;
      respBody = yield resp.text();
      queryErrText = respBody;
    } else {
      querySuccess = true;
      respBody = yield resp.json();
      var data = respBody.map((val) => {
        var newX = new Date(val.x)
        return {x: newX, y: val.y}
      });
      yield put(actions.changeMainChartData(data));
      yield put(actions.changeMainChart({startTS: action.payload.start, endTS: action.payload.end }))
    }
    yield put(actions.changeDbQuerySuccess(querySuccess))
    yield put(actions.changeDbErrorMsg(queryErrText));
  } catch(error) {
    // Backend is not available!
    yield put(actions.changeBackendConnSuccess(false));
  }
}

// -------------ROOT SAGA-----------------

export default function* rootSaga() {
  yield all([
    takeEvery('FETCH_DATASETS', fetchDatasets),
    takeEvery('FETCH_STATS', fetchStats),
    takeEvery('SEARCH_DATA', searchData),
    takeLatest('FETCH_RAW_DATA', fetchRawData)
  ])

}
