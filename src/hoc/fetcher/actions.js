// @flow
export const REQUEST_START = 'REQUEST_START';
export const REQUEST_SUCCESS = 'REQUEST_SUCCESS';
export const REQUEST_FAIL = 'REQUEST_FAIL';
export const HYDRATE_ENTITIES = 'HYDRATE_ENTITIES';

export type RequestEntityType = {
    url: string,
    entityName: string,
    id: string
};

export type RequestStartType = {
    type: 'REQUEST_START',
    entities: Array<RequestEntityType>
};

export type RequestSuccessType = {
    type: 'REQUEST_SUCCESS',
    entity: RequestEntityType,
    payload: *
};

export type RequestFailType = {
    type: 'REQUEST_FAIL',
    entity: RequestEntityType,
    err: Error
};

export type HydrateEntitiesActionType = {
    type: 'HYDRATE_ENTITIES',
    entities: Array<RequestEntityType>
};

export type RequestActionType = RequestStartType | RequestSuccessType | RequestFailType;

export const requestStart = (entities: Array<RequestEntityType>): RequestStartType => ({
    type: REQUEST_START,
    entities,
});

export const requestSuccess = (entity: RequestEntityType, payload: *): RequestSuccessType => ({
    type: REQUEST_SUCCESS,
    entity,
    payload,
});

export const requestFail = (entity: RequestEntityType, err: Error): RequestFailType => ({
    type: REQUEST_FAIL,
    entity,
    err,
});

export const hydrateEntities = (entities: Array<RequestEntityType>): HydrateEntitiesActionType => ({
    type: HYDRATE_ENTITIES,
    entities,
});
