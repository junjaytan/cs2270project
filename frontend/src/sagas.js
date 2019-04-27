import { takeLatest, takeEvery, call, put, all } from 'redux-saga/effects';
import Client from './client';
import * as actions from './actions'
import * as _ from 'lodash';

const errorText = "Something went wrong.  Please refresh the page in a few minutes and try again.";

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

    if (httpstatus != 200) {
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
    const resp = yield call(Client.getStats, action.payload.dataset);
    let httpstatus = resp.status;
    let querySuccess = null;
    let respBody = null;
    let queryErrText = '';

    if (httpstatus != 200) {
      querySuccess = false;
      respBody = yield resp.text();
      queryErrText = respBody;
    } else {
      querySuccess = true;
      respBody = yield resp.json();
      yield put(actions.fetchStats(respBody));
    }
    yield put(actions.changeDbQuerySuccess(querySuccess))
    yield put(actions.changeDbErrorMsg(queryErrText));
  } catch(error) {
    // Backend is not available!
    yield put(actions.changeBackendConnSuccess(false));
  }
}

function* searchData(action) {

  try {
    const data = yield call(Client.searchData, action.payload);
    console.log(data);
    yield put(actions.searchData(data));
  } catch(error) {
    yield put(actions.changeError(errorText));
  }

}

// -------------ROOT SAGA-----------------

export default function* rootSaga() {
  yield all([
    takeEvery('FETCH_DATASETS', fetchDatasets),
    takeEvery('FETCH_STATS', fetchStats),
    takeEvery('SEARCH_DATA', searchData)
  ])

}
