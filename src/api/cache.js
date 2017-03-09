// @flow
import localforage from 'localforage';
import { INVALID_ENTITY, updateEntities } from '../index';
import type { GenericEntityType } from '../index';
import type { RequestEntityType } from '../hoc/fetcher/actions';

localforage.setDriver([localforage.INDEXEDDB, localforage.LOCALSTORAGE]);

type EntityType = {
    entityName: string,
    payload: $Shape<GenericEntityType>
};

export const persistEntity = ({ entityName, payload }: EntityType): Promise<*> =>
    new Promise((resolve: () => void, reject: () => void) => {
        localforage
            .getItem(entityName)
            .then((entities: Array<$Shape<GenericEntityType>>) => {
                if (Array.isArray(entities)) {
                    localforage.setItem(entityName, updateEntities(payload)(entities), resolve());
                } else {
                    localforage.setItem(entityName, [payload], resolve());
                }
            })
            .catch(reject);
    });

export const persistEntities = (entities: Array<EntityType>) => Promise.all(entities.map(persistEntity));

export const retrieveEntityById = ({ entityName, id }: RequestEntityType): Promise<*> =>
    new Promise((resolve: () => void, reject: () => void) => {
        localforage
            .getItem(entityName)
            .then((entities: Array<$Shape<GenericEntityType>>) => {
                if (Array.isArray(entities)) {
                    const maybeEntity = entities.find((e: $Shape<GenericEntityType>): boolean => e.id === id);

                    if (typeof maybeEntity !== 'undefined') {
                        resolve(maybeEntity);
                    } else {
                        reject(INVALID_ENTITY);
                    }
                } else {
                    reject(INVALID_ENTITY);
                }
            })
            .catch(reject);
    });

export const retrieveEntities = (entities: Array<RequestEntityType>): Promise<*> =>
    Promise.all(entities.map(retrieveEntityById));
