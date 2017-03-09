import type { Dispatch, MiddlewareAPI } from 'redux';
import type {
    RequestActionType,
    HydrateEntitiesActionType,
    SyncActionType,
    TransformsType,
} from 'redux-ntities';
import { REQUEST_START, HYDRATE_ENTITIES } from '../hoc/fetcher/actions';
import { SYNC_START } from '../hoc/sync/actions';
import { callRequestApiCreator, callSyncApi, hydrateEntities } from '../api/fetch';

type ActionType = RequestActionType | SyncActionType | HydrateEntitiesActionType;

type NextFnType<A> = (next: Dispatch<A>) => Dispatch<A>;

const fetcherMiddlewareCreator = (transforms: TransformsType) =>
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
