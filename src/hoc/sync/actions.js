// @flow
import type {
    RequestEntityWithPayloadType,
    SyncStartType,
    RequestEntityType,
    SyncSuccessType,
    SyncFailType,
} from 'redux-ntities';

export const SYNC_START = 'SYNC_START';
export const SYNC_SUCCESS = 'SYNC_SUCCESS';
export const SYNC_FAIL = 'SYNC_FAIL';

export const syncStart = (entityWithPayload: RequestEntityWithPayloadType): SyncStartType => ({
    type: SYNC_START,
    entity: entityWithPayload.entity,
    payload: entityWithPayload.payload,
});

export const syncSuccess = (entity: RequestEntityType): SyncSuccessType => ({
    type: SYNC_SUCCESS,
    entity,
});

export const syncFail = (entity: RequestEntityType, err: Error): SyncFailType => ({
    type: SYNC_FAIL,
    entity,
    err,
});
