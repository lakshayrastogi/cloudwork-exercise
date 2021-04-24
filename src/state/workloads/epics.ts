import { combineEpics, Epic } from 'redux-observable';
import { filter, map, tap, ignoreElements, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';
import { WorkloadService } from './services'

const workloadService = new WorkloadService

type AppEpic = Epic<RootAction, RootAction, RootState>;

const logWorkloadSubmissions: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.submit)),
    map(action => action.payload),
    tap((payload) => console.log('Workload submitted', payload)),
    ignoreElements(),
  )
);

const submitWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
  	filter(isActionOf(workloadsActions.submit)),
  	mergeMap(async (action) => {
  		const createdCall = await workloadService.create(action.payload)
  		return workloadsActions.created(createdCall)
  	})
  )
);


export const epics = combineEpics(
  logWorkloadSubmissions,
  submitWorkload
);

export default epics;
