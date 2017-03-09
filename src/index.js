import { find, map, ifElse, union } from 'ramda';

export const INVALID_ENTITY = 'INVALID_ENTITY';

export type GenericEntityType = { id: string | number };
export type PayloadType = $Shape<GenericEntityType>;
export type MapType<E> = { [string]: E };

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
