// @flow
import type { Dispatch } from 'redux';
import type { RequestEntityType, RequestActionType, RequestStartType } from '../hoc/fetcher/actions';
import type { SyncActionType, SyncStartType } from '../hoc/sync/actions';
import type { MapType, GenericEntityType } from '../index';
import { requestSuccess, requestFail, requestStart } from '../hoc/fetcher/actions';
import { syncSuccess, syncFail } from '../hoc/sync/actions';
import { requestIdleCallback } from '../internal';
import { persistEntities, persistEntity, retrieveEntities } from './cache';

type GetStateFnType<S> = () => S;

const getOptions: RequestOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 28000,
};

const putOptions = (body: *): RequestOptions => ({
    ...getOptions,
    method: 'PUT',
    body: JSON.stringify(body),
});

const identity = (a: *): * => a;

const toPersistenceShape = (entity: RequestEntityType) => (e: *) => ({
    entityName: entity.entityName,
    payload: e,
});

const callRequestApiBase = (
    dispatch: Dispatch<RequestActionType>,
    entity: RequestEntityType,
    options: RequestOptions,
    transforms: MapType<() => $Shape<GenericEntityType>>,
) => fetch(entity.url, options)
    .then((response: Response): Promise<*> => response.json())
    .then((json: *) => {
        const maybeTransform = transforms[entity.entityName];
        const transform = typeof maybeTransform === 'function' ? maybeTransform : identity;
        const transformedPayload = transform(json);
        const wrappedEntities = Array.isArray(transformedPayload) ? transformedPayload : [transformedPayload];
        const entities = wrappedEntities.map(toPersistenceShape(entity));

        persistEntities(entities).then(() => {
            dispatch(requestSuccess(entity, transform(json)));
        });
    })
    .catch((err: Error) => {
        dispatch(requestFail(entity, err));
    });

const callSyncApiBase = (dispatch: Dispatch<SyncActionType>, action: SyncStartType, options: RequestOptions) =>
    Promise.all([
        persistEntity({ entityName: action.entity.entityName, payload: action.payload }),
        fetch(action.entity.url, options)
            .then((response: Response): Promise<*> => response.json())
            .then(() => {
                dispatch(syncSuccess(action.entity));
            })
            .catch((err: Error) => {
                // failures: [validation fail, cant process entity => maybe 4** statusCode?]
                // @todo define HTTP status and do not use failure action if server is not available
                // @todo somehow revert state to previous in case of failure
                dispatch(syncFail(action.entity, err));
            }),
    ]);

export const callRequestApiCreator = (transforms: MapType<() => $Shape<GenericEntityType>>) => (
    dispatch: Dispatch<RequestActionType>,
    getState: GetStateFnType<*>,
    action: RequestStartType,
): RequestStartType => {
    action.entities.forEach(
        (entity: RequestEntityType) => callRequestApiBase(dispatch, entity, getOptions, transforms),
    );

    return action;
};

export const callSyncApi = (
    dispatch: Dispatch<SyncActionType>,
    getState: GetStateFnType<*>,
    action: SyncStartType,
): SyncStartType => {
    callSyncApiBase(dispatch, action, putOptions(action.payload));

    return action;
};

export const hydrateEntities = (dispatch: Dispatch<RequestActionType>, entities: Array<RequestEntityType>) => {
    retrieveEntities(entities)
        .then((entitiesFromCache: Array<*>) => {
            if (typeof entitiesFromCache[0] !== 'undefined') {
                dispatch(requestSuccess(entities[0], entitiesFromCache[0]));
            }

            requestIdleCallback(() => {
                dispatch(requestStart(entities));
            });
        })
        .catch(() => {
            dispatch(requestStart(entities));
        });
};
