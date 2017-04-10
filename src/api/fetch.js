// @flow
import type { Dispatch } from 'redux';
import type {
    MapType,
    GenericEntityType,
    RequestEntityType,
    RequestActionType,
    RequestStartType,
    SyncStartType,
    SyncActionType,
} from 'redux-ntities';
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
    timeout: 10000,
};

const RETRY_TIMEOUT = 5000;
const pendingRequestsMap = {};
const pendingSyncsMap = {};

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

type PendingResponseType = {
    response: Response,
    json: Promise<*>
};

const fetchWrapper = (url: string, options: RequestOptions) =>
    new Promise((resolve: () => void, reject: () => void) => {
        fetch(url, options)
            .then((response: Response) => response.json().then((json: *) => ({
                json,
                response,
            })))
            .then(({ response, json }: PendingResponseType): void => {
                if (!response.ok) {
                    const error = {
                        ...json,
                        status: response.status,
                    };

                    return reject(error);
                }

                return resolve(json);
            })
            .catch((err: Error) => {
                reject(err);
            });
    });

const callRequestApiBase = (
    dispatch: Dispatch<RequestActionType>,
    entity: RequestEntityType,
    options: RequestOptions,
    transforms: MapType<() => $Shape<GenericEntityType>>,
) => fetchWrapper(entity.url, options)
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
        if (typeof err.status === 'undefined') {
            if (pendingRequestsMap[entity.url]) clearTimeout(pendingRequestsMap[entity.url]);

            pendingRequestsMap[entity.url] =
                setTimeout(callRequestApiBase, RETRY_TIMEOUT, dispatch, entity, options, transforms);
        }

        dispatch(requestFail(entity, err));
    });

const callSyncApiBase = (dispatch: Dispatch<SyncActionType>, action: SyncStartType, options: RequestOptions) =>
    Promise.all([
        persistEntity({ entityName: action.entity.entityName, payload: action.payload }),
        fetchWrapper(action.entity.url, options)
            .then(() => {
                dispatch(syncSuccess(action.entity));
            })
            .catch((err: Error) => {
                if (typeof err.status === 'undefined') {
                    if (pendingSyncsMap[action.entity.url]) clearTimeout(pendingSyncsMap[action.entity.url]);

                    pendingSyncsMap[action.entity.url] =
                        setTimeout(callRequestApiBase, RETRY_TIMEOUT, dispatch, action, options);
                }

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
