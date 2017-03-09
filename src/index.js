// @flow
import { find, map, ifElse, union } from 'ramda';
import type { GenericEntityType, PayloadType } from 'redux-ntities';
import middlewareCreator from './middleware';
import fetchHOCCreator from './hoc/fetcher/index';
import syncHOCCreator from './hoc/sync/index';
import partialReducer from './reducer';
import { syncFail, syncStart, syncSuccess } from './hoc/sync/actions';
import { requestStart, requestFail, requestSuccess, hydrateEntities } from './hoc/fetcher/actions';

export const INVALID_ENTITY = 'INVALID_ENTITY';

export const withId = (id: string | number) => (entity: GenericEntityType): boolean => entity.id === id;

// updateEntities :: PayloadType => Array<GenericEntityType> => Array<GenericEntityType>'
export const updateEntities = (payload: PayloadType) => ifElse(
    find(withId(payload.id)),
    map(
        (e: $Shape<GenericEntityType>): $Shape<GenericEntityType> =>
            e.id === payload.id ? payload : e,
    ),
    union([payload]),
);

const actions = {
    syncFail,
    syncStart,
    syncSuccess,
    requestStart,
    requestFail,
    requestSuccess,
    hydrateEntities,
};

export { middlewareCreator, fetchHOCCreator, syncHOCCreator, partialReducer, actions };
