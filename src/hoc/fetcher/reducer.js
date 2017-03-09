// @flow
import { curryN } from 'ramda';
import { REQUEST_SUCCESS } from '../../hoc/fetcher/actions';
import { SYNC_START } from '../../hoc/sync/actions';
import type { RequestEntityWithPayloadType } from '../../hoc/sync/actions';
import { updateEntities } from '../../index';
import type { MapType, GenericEntityType } from '../../index';

type EntitiesStateType = MapType<Array<GenericEntityType>>;

const updateEntityArity = 2;
const updateEntity = curryN(
    updateEntityArity,
    ({ payload, entity }: RequestEntityWithPayloadType,
        state: $Shape<EntitiesStateType>,
    ): $Shape<EntitiesStateType> => {
        const currentEntityState = state[entity.entityName] || [];

        return {
            ...state,
            [entity.entityName]: updateEntities(payload)(currentEntityState),
        };
    },
);

/* eslint-disable flowtype/require-parameter-type */
export default {
    [REQUEST_SUCCESS]: (state, action) => updateEntity(action, state),
    [SYNC_START]: (state, action) => updateEntity(action, state),
};
