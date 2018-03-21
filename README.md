[![Build Status](https://travis-ci.org/collardeau/react-with-state-props.svg?branch=master)](https://travis-ci.org/collardeau/react-with-state-props)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-with-state-props/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-with-state-props?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-with-state-props

A store component to quickly initialize state and state handlers in React.

## Installation

`npm install react-senna`

## Usage

```javascript
import React from "react";
import { Store } from "react-senna";

// describe the state you want in a `seeds` array, for example:
const seeds = [
  {
    name: "todos",
    initialState: []
  }
];

// Use the Store component to initiate React state and setState handlers
const AppState = () => (
  <Store
    seeds={seeds}
    render={props => {
      console.log(props);
      /*
            {
              todos: []
              handlers: {
                setTodos: [Function]
              }
            }
            */
      // render whatever you want with the state and handler you just created!
      return <App {...props} />;
    }}
  />
);
```

You can easily create more handlers out of the box. Read on!

# Props API

The Store component accepts the following props: `render`, `seeds`, `withHandlers`, `omitHandlers` and `flatten`.

## render `func.isRequired`

Your render function which will receive state and actions props!

## seeds `array.isRequired`

An array of seed objects that will initialize the store, which have **the following keys**:

#### name `string.isRequired`

The name of the state to be created.

#### initialState `any`

The initial (and reset) value of the state being seeded.

#### handlers `objOf(func)`

Here, you can create handlers using the current state as a parameter:

```javascript
const seed = {
  name: "counter",
  initialState: 0,
  handlers: {
    incr: state => state + 1
  }
};
/*
results in these props:
{
  counter: 0,
  handlers: {
    setCounter: [Function],
    incrCounter: [Function]  <-- new handler
  }
}
*/
```

The resulting `props.handlers.incrCounter` function increments the `counter` state by 1

#### toggleable `bool` default: `false`

`toggleable: true` will create a handler that will set the state to its opposite:

```javascript
const seed = {
  name: "isActive",
  initialState: false,
  toggleable: true
};
/*
results in these props:
{
  isActive: false,
  handlers: {
    setIsActive: [Function],
    toggleIsActive: [Function],  <-- new handler
  }
}
*/
```

The resulting `props.handlers.toggleIsActive` will flip the state of `isActive`

In fact, `toggleable: true` is a shortcut for `{ handlers: { toggle: state => !state } }`

#### loadable `bool` default: `false`

`loadable: true` creates an additional loaded state:

```javascript
const seed = {
  name: "users",
  initialState: {},
  loadable: true
};
/*
results in these props:
{
  users: {},
  usersLoaded: false   <-- new state
  handlers: {
    setUsers: [Function],
    setUsersLoaded: [Function],  <-- new handler
  }
}
*/
```

`usersLoaded` is automatically set to `true` when `users` is updated.

#### resetable `bool` default: `false`

`resetable: true` will create a handler that will set the state to its initialState. For example, `handlers.resetCounter`.

## withHandlers `objOf(func)`

`withHandlers` takes an object of high-order functions.

Here you can access the newly-created props so you can you create more complex state changes.
For example, controlling two separate counter states:

```javascript
const seeds = [
  {
    name: "counterA",
    initialState: 0
  },
  {
    name: "counterB",
    initialState: 0
  }
];

const withHandlers = {
  setAll: ({ handlers }) => num => {
    // run multiple handlers
    handlers.setCounterA(num);
    handlers.setCounterB(num);
  }
};

const AppState = () => (
  <Store
    seeds={seeds}
    withHandlers={withHandlers}
    // use new `props.handlers.setAll` in render:
    render={({ handlers, counterA, counterB }) => (
       <div>
        A: {counterA}
        <br />
        B: {counterB}
        <br />
        <button onClick={() => handlers.setAll(10)}>
          set all counters to 10
        </button>
      </div
    )}
  />
)
```

## omitHandlers `array`

Remove handlers before the props are passed on to the render function. This is good place to remove handlers you used in `withHandlers` but don't want to pass forward:

```javascript
const seeds = [
  {
    name: "movies",
    initialState: {}
  }
];
const withHandlers = {
  fetchMovies: ({ handlers }) => () => {
    // some imaginary db
    db.fetchMovies().then(movies => {
      handlers.setMovies(movies);
    });
  }
};

// we want to drop `setMOvies` (and only pass on `fetchMovies`)
const omitHandlers = ["setMovies"];

const AppState = () => (
  <Store
    seeds={seeds}
    withHandlers={withHandlers}
    omitHandlers={omitHandlers}
    render={props => {
      console.log(props);
      /*
            {
              movies: {}
              handlers: {   <-- without `setMovies`
                fetchMovies: [Function]
              }
            }
            do as you please with the props:
            */
      return <MyApp {...props} />;
    }}
  />
);
```

## flatten `bool`

default: `false`

If you don't like the `handlers` key you don't have to use it:

```javascript
const seeds = [
  {
    name: "movies",
    initialState: {}
  }
];

const AppState = () => (
  <Store
    seeds={seeds}
    flatten={true}
    render={props => {
      console.log(props);
      /*
            {
              movies: {},
              setMovies: [Function]   <-- without the `handlers` key
            }
            */
      return <MyApp {...props} />;
    }}
  />
);
```

# Inspirations

* Andrew Clark's [recompose](https://github.com/acdlite/recompose) library
* Kent C. Dodds Advanced React Component Patterns [Egghead course](https://egghead.io/courses/advanced-react-component-patterns)
* Never Write Another HOC [talk](https://www.youtube.com/watch?v=BcVAq3YFiuc) by Michael Jackson
