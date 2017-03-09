// @flow
import type { Middleware } from 'redux';

type ReducerType<S, A> = (state: S, action: A) => S;

declare module 'redux-ntities' {
    declare type GenericEntityType = { id: string | number };

    declare type MapType<E> = { [string]: E };

    declare type PayloadType = $Shape<GenericEntityType>;

    declare type RequestEntityType = {
        url: string,
        entityName: string,
        id: string
    };

    declare type RequestStartType = {
        type: 'REQUEST_START',
        entities: Array<RequestEntityType>
    };

    declare type RequestSuccessType = {
        type: 'REQUEST_SUCCESS',
        entity: RequestEntityType,
        payload: *
    };

    declare type RequestFailType = {
        type: 'REQUEST_FAIL',
        entity: RequestEntityType,
        err: Error
    };

    declare type HydrateEntitiesActionType = {
        type: 'HYDRATE_ENTITIES',
        entities: Array<RequestEntityType>
    };

    declare type RequestActionType = RequestStartType | RequestSuccessType | RequestFailType;

    declare type RequestEntityWithPayloadType = {
        entity: RequestEntityType,
        payload: *
    };

    declare type SyncStartType = {
        type: 'SYNC_START',
        entity: RequestEntityType,
        payload: *
    };

    declare type SyncSuccessType = {
        type: 'SYNC_SUCCESS',
        entity: RequestEntityType
    };

    declare type SyncFailType = {
        type: 'SYNC_FAIL',
        entity: RequestEntityType,
        err: Error
    };

    declare type SyncActionType = SyncStartType | SyncSuccessType | SyncFailType;

    declare type HocType = (el: ReactClass<*>) => ReactClass<*>;

    declare type SyncHandlerType = () => void;

    declare type SyncHandlersMapType = MapType<SyncHandlerType>;

    declare type WrappedUrlType = () => string;

    declare type ObjectType = $Shape<*>;

    declare type SyncOptionsType = {
        mapEntitiesToRestUrl: MapType<(props: ObjectType, entity: ObjectType) => string>,
        entityIdSelector: MapType<(props: ObjectType) => string>
    };

    declare type TransformsType = MapType<() => $Shape<GenericEntityType>>;

    declare type FetcherOptionsType = {
        useCache: boolean,
        mapEntitiesToRestUrl: MapType<(props: ObjectType, entity: ObjectType) => string>,
        entityIdSelector: MapType<(props: ObjectType) => string>
    };

    declare type EntitiesHocType = (entities: Array<string>) => HocType;

    /*

     S = State
     A = Action

     */

    declare type EntitiesActionsType = {
        syncFail: (entity: RequestEntityType, err: Error) => SyncFailType,
        syncStart: (entityWithPayload: RequestEntityWithPayloadType) => SyncStartType,
        syncSuccess: (entity: RequestEntityType) => SyncSuccessType,
        requestStart: (entities: Array<RequestEntityType>) => RequestStartType,
        requestFail: (entity: RequestEntityType, err: Error) => RequestFailType,
        requestSuccess: (entity: RequestEntityType, payload: *) => RequestSuccessType,
        hydrateEntities: (entities: Array<RequestEntityType>) => HydrateEntitiesActionType
    };

    declare function middlewareCreator<S, A>(transforms: TransformsType): Middleware<S, A>;
    declare var partialReducer: MapType<ReducerType<*, *>>;
    declare function fetchHOCCreator(options: FetcherOptionsType): EntitiesHocType;
    declare function syncHOCCreator(options: SyncOptionsType): EntitiesHocType;
    declare var actions: EntitiesActionsType;
}
