import type { Middleware, Dispatch, MiddlewareAPI } from 'redux';
import type { RequestActionType, HydrateEntitiesActionType } from '../hoc/fetcher/actions';
import type { SyncActionType } from '../hoc/sync/actions';
import type { MapType, GenericEntityType } from '../index';
import { REQUEST_START, HYDRATE_ENTITIES } from '../hoc/fetcher/actions';
import { SYNC_START } from '../hoc/sync/actions';
import { callRequestApiCreator, callSyncApi, hydrateEntities } from '../api/fetch';

type ActionType = RequestActionType | SyncActionType | HydrateEntitiesActionType;

type NextFnType<A> = (next: Dispatch<A>) => Dispatch<A>;

const fetcherMiddlewareCreator: Middleware<*, ActionType> =
    (transforms: MapType<() => $Shape<GenericEntityType>>) =>
        ({ dispatch, getState }: MiddlewareAPI<*, ActionType>): NextFnType<ActionType> =>
            (next: Dispatch<ActionType>): * => (action: ActionType): * => {
                const callRequestApi = callRequestApiCreator(transforms);

                if (action.type === REQUEST_START) {
                    callRequestApi(dispatch, getState, action);
                }

                if (action.type === SYNC_START) {
                    callSyncApi(dispatch, getState, action);
                }

                if (action.type === HYDRATE_ENTITIES) {
                    hydrateEntities(dispatch, action.entities);
                }

                return next(action);
            };

export default fetcherMiddlewareCreator;
