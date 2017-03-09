// @flow
import React, { Component } from 'react';
import type { Dispatch } from 'redux';
import { INVALID_ENTITY } from '../../index';
import { validate, getDisplayName, wrapEntityMap } from '../../internal';
import type { MapType } from '../../index';
import type { RequestEntityType } from './actions';
import { requestStart, hydrateEntities } from './actions';

type PropsType = {
    dispatch: Dispatch<*>
};

type HocType = (el: ReactClass<*>) => ReactClass<*>;

type FetcherOptionsType = {
    useCache: boolean,
    mapEntitiesToRestUrl: MapType<() => string>,
    entityIdSelector: MapType<() => string>
};

const getEntityUrl = (mapEntitiesToRestUrl: MapType<() => string>) => (props: PropsType, entity: string): string => {
    const decoratedMap = wrapEntityMap(mapEntitiesToRestUrl);

    if (typeof decoratedMap[entity] === 'function') {
        return decoratedMap[entity](props);
    }

    return decoratedMap[INVALID_ENTITY](props);
};

export const fetcherCreator = ({
    useCache,
    mapEntitiesToRestUrl,
    entityIdSelector,
}: FetcherOptionsType) => (entities: Array<string>): HocType => (ComposedComponent: ReactClass<*>): ReactClass<*> =>
    class extends Component {
        props: PropsType;

        static displayName = `Fetcher(${getDisplayName(ComposedComponent)})`;

        componentWillMount() {
            validate(useCache, 'boolean');
            validate(mapEntitiesToRestUrl, 'object');
            validate(entityIdSelector, 'object');

            const entityIdSelectorDecorated = wrapEntityMap(entityIdSelector);

            const urls = entities.map((entity: string): RequestEntityType => ({
                url: getEntityUrl(mapEntitiesToRestUrl)(this.props, entity),
                entityName: entity,
                id: entityIdSelectorDecorated[entity](this.props),
            }));

            const action = useCache ? hydrateEntities(urls) : requestStart(urls);

            this.props.dispatch(action);
        }

        render(): React$Element<*> {
            return (
                <ComposedComponent {...this.props} />
            );
        }
    };

export default fetcherCreator;
