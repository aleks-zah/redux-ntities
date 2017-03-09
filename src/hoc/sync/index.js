// @flow
import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { identity } from 'ramda';
import { INVALID_ENTITY } from '../../index';
import { wrapEntityMap, validate, getDisplayName } from '../../internal';
import type { MapType } from '../../index';
import { syncStart } from './actions';
import type { SyncStartType, RequestEntityWithPayloadType } from './actions';

type PropsType = {
    dispatch: Dispatch<*>
};

type HocType = (el: ReactClass<*>) => ReactClass<*>;
type SyncHandlerType = () => void;
export type SyncHandlersMapType = MapType<SyncHandlerType>;
type WrappedUrlType = () => string;

type SyncOptionsType = {
    mapEntitiesToRestUrl: MapType<() => string>,
    entityIdSelector: MapType<() => string>
};

const currentEntityUrl = (mapEntitiesToRestUrl: MapType<() => string>) => (entity: string): WrappedUrlType => {
    const decoratedMap = wrapEntityMap(mapEntitiesToRestUrl);

    if (typeof decoratedMap[entity] === 'function') {
        return decoratedMap[entity];
    }

    return decoratedMap[INVALID_ENTITY];
};

const sync = ({
    mapEntitiesToRestUrl,
    entityIdSelector,
}: SyncOptionsType) => (entities: Array<string>): HocType => (ComposedComponent: ReactClass<*>): ReactClass<*> =>
    class extends Component {
        props: PropsType;

        static displayName = `Sync(${getDisplayName(ComposedComponent)})`;

        render(): React$Element<*> {
            validate(mapEntitiesToRestUrl, 'object');
            validate(entityIdSelector, 'object');

            const entityIdSelectorDecorated = wrapEntityMap(entityIdSelector);

            const syncHandlers = entities.reduce((acc: SyncHandlersMapType, entity: string): SyncHandlersMapType => {
                const currentEntityWithPayload = (entityData: *): RequestEntityWithPayloadType => ({
                    entity: {
                        url: currentEntityUrl(mapEntitiesToRestUrl)(entity)(this.props, entityData),
                        entityName: entity,
                        id: entityIdSelectorDecorated[entity](this.props),
                    },
                    payload: entityData,
                });

                return {
                    ...acc,
                    [entity]: (entityData: *): SyncStartType => {
                        if (entityData.isSyncing) {
                            return identity;
                        }

                        return this.props.dispatch(syncStart(currentEntityWithPayload(entityData)));
                    },
                };
            }, {});

            return (
                <ComposedComponent {...this.props} syncHandlers={syncHandlers} />
            );
        }
    };

export default sync;
