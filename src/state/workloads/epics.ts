import { combineEpics, Epic } from 'redux-observable';
import { filter, map, tap, ignoreElements, mergeMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootAction, RootState } from '../reducer';
import * as workloadsActions from './actions';
import { WorkloadService } from './services'

const workloadService = new WorkloadService()
const timer = (time: number) => new Promise(resolve => setTimeout(() => resolve(), time)) 
const createdTimes: { [key: string]: number } = {}

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
  		createdTimes[`${createdCall.id}`] = Date.now()
  		return workloadsActions.created(createdCall)
  	})
  )
);

const cancelWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.cancel)),
    mergeMap(async (action) => {
      const currentWorkloadStatus = await workloadService.checkStatus(action.payload)
      if (currentWorkloadStatus.status === 'WORKING') {
        const cancelledCall = await workloadService.cancel(action.payload)
        return workloadsActions.updateStatus(cancelledCall) 
      }
      return workloadsActions.updateStatus(currentWorkloadStatus) 
    })
  )
);

const createWorkload: AppEpic = (action$, state$) => (
  action$.pipe(
    filter(isActionOf(workloadsActions.created)),
    mergeMap(async (action) => {
      const countDownAmount = <any> action.payload.completeDate - createdTimes[action.payload.id]
      delete createdTimes[action.payload.id]
      await timer(countDownAmount)
      const currentWorkloadStatus = await workloadService.checkStatus(action.payload)
      return workloadsActions.updateStatus(currentWorkloadStatus) 
    })
  )
);


export const epics = combineEpics(
  logWorkloadSubmissions,
  submitWorkload,
  cancelWorkload,
  createWorkload
);

export default epics;
