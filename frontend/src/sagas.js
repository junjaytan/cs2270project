import { takeLatest, takeEvery, call, put, all } from 'redux-saga/effects';
import Client from './client';
import * as actions from './actions'
import * as _ from 'lodash';

const errorText = "Something went wrong.  Please refresh the page in a few minutes and try again.";

// -------------FETCHING SAGAS -----------------
function* fetchDatasets(action) {

  try {
    const data = yield call(Client.getDatasets);
    yield put(actions.fetchDatasets(data));
  } catch(error) {
    yield put(actions.changeError(errorText));
  }

}

function* searchData(action) {

  try {
    const data = yield call(Client.searchData);
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
    takeEvery('SEARCH_DATA', searchData)
  ])
}
