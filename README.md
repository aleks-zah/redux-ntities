# Redux-ntities

This is redux entities management library. It consists of 2 HOCs and
redux middleware. It allows you to persist your entities in
IndexedDB/localStorage and provides common approach to save your entites
in redux state.

## Installation

```bash
npm i --save redux-ntities redux react localforage ramda
```

or same with yarn add if you are using yarn

## Basic usage

### Setting up middleware 
In order to set up middleware, you will need to provide a map with 
transform functions, which will be used to re-shape data right after
fetching from server

```javascript
// entities.js
export const TEMPLATE = 'TEMPLATE';

// transforms.js
import { TEMPLATE } from './entities';

export default {
    // here we are transforming whatever came from API to the array of whatever
    [TEMPLATE]: (data: *): Array<*> => [data],
};
```


Then, inside your configureStore module:

```javascript
import { createStore, applyMiddleware } from 'redux';
import transforms from './transforms';
import { middlewareCreator as entitiesMiddlewareCreator } from 'redux-ntities';

const createStore = applyMiddleware(
    entitiesMiddlewareCreator(transforms),
)(createStore);

const store = createStore(initialState);
...
```


### Using HOCs:

To make sure your entities are fetched from the API, you can enhance your
containers using redux-ntities HOCs. Just add them into compose function
with your react-redux's connect or other HOC's and provide config options:

```jsx
// entites.js:
export const mapEntitiesToSyncRestUrl = {
    [TEMPLATE]: (props) => `localhost/templates/${props.params.id}`,
}

export const entityIdSelector = {
    [TEMPLATE]: (props) => props.params.id,
};

export const mapEntitiesToSyncRestUrl = {
    [TEMPLATE]: (props, template) => `localhost/templates/${template.id}`,
};

export const syncEntityIdSelector = {
    [TEMPLATE]: (template) => template.id,
};

// template.js
import { connect } from 'react-redux';
import { compose } from 'ramda';
import { fetchHOCCreator, syncHOCCreator } from 'redux-ntities';
import { TEMPLATE } from './entities';
import {
    mapEntitiesToSyncRestUrl,
    syncEntityIdSelector,
    mapEntitiesToRestUrl,
    entityIdSelector,
} from '../entities';

const mapStateToProps = (state, props) => ({
    // templateSelector is selecting your template from redux-state
    template: templateSelector(state, props),
});

const fetcher = fetchHOCCreator({
    useCache: true,
    mapEntitiesToRestUrl,
    entityIdSelector,
});

const sync = syncHOCCreator({
    mapEntitiesToRestUrl: mapEntitiesToSyncRestUrl,
    entityIdSelector: syncEntityIdSelector
});

const Template = (props: PropsType): React$Element<*> =>
    <div className="title">
        {props.template.title}
    </div>

const enhancer = compose(
    connect(mapStateToProps),
    sync([TEMPLATE]),
    fetcher([TEMPLATE]),
);

export default enhancer(Template);
```

#### TODO
- Consider changing shitty generic namings like entity
- Handle invalid entities more concisely
- Handle failed HTTP requests more concisely
