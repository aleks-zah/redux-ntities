// @flow
export const SYNC_START = 'SYNC_START';
export const SYNC_SUCCESS = 'SYNC_SUCCESS';
export const SYNC_FAIL = 'SYNC_FAIL';

export type RequestEntityType = {
    url: string,
    entityName: string,
    id: string
};

export type RequestEntityWithPayloadType = {
    entity: RequestEntityType,
    payload: *
};

export type SyncStartType = {
    type: 'SYNC_START',
    entity: RequestEntityType,
    payload: *
};

export type SyncSuccessType = {
    type: 'SYNC_SUCCESS',
    entity: RequestEntityType
};

export type SyncFailType = {
    type: 'SYNC_FAIL',
    entity: RequestEntityType,
    err: Error
};

export type SyncActionType = SyncStartType | SyncSuccessType | SyncFailType;

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
