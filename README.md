[![Build Status](https://travis-ci.org/collardeau/react-senna.svg?branch=master)](https://travis-ci.org/collardeau/react-senna)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-senna/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-senna?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-senna

A store component to quickly initialize state and `setState` handlers in React.

## Installation

`npm install react-senna --save`

## Usage

```javascript
import React from "react";
import { Store } from "react-senna";

// describe the state you want in a `seeds` array, for example:
const seeds = [
  {
    name: "counter",
    initialState: 0,
    resetable: true,
    handlers: {
      incr: state => state + 1
    }
  }
];

// Use the Store component to initiate React state, with handlers to update that state
const App = () => (
  <Store
    seeds={seeds}
    render={props => {
      console.log(props);
      /*
      {
        counter: 0
        handlers: {
          setCounter: [Function],
          incrCounter: [Function],
          resetCounter: [Function]
        }
      }
      */
      return <div />; // render whatever you want with the state and handlers you just created!
    }}
  />
)

```

# Props API

The Store component accepts the following props: `render`, `seeds` and `withHandlers`.

## render
`PropTypes.func.isRequired`

A component to render which will receive `react-senna` props!

## seeds
`PropTypes.array.isRequired`

An array of seed objects that will initialize the store, which have **the following keys**:

#### - name `PropTypes.string.isRequired`

The name of the state to be created.

#### - initialState `PropTypes.any`

The initial (and reset) value of the state being seeded.

#### - handlers `PropTypes.objOf(PropTypes.func)`

Here, you can create handlers using the current state as a parameter:

```javascript

const seed = {
  name: 'counter',
  initialState: 0,
  handlers: {
    incr: state => state + 1
  }
}
/*
results in these props:
{
  counter: 0,
  handlers: {
    setCounter: [Function],
    incrCounter: [Function],
  }
}
*/

```
The `props.handlers.incrCounter` function increments the `counter` state by 1

#### - toggleable `PropTypes.bool`

default: `false`

`toggleable: true` will create a handler that will set the state to its opposite:

```javascript

const seed = {
  name: 'isActive',
  initialState: false,
  toggleable: true
}
/*
results in these props:
{
  isActive: false,
  handlers: {
    setIsActive: [Function],
    toggleActive: [Function],
  }
}
*/

```

`props.handlers.toggleIsActive` which will flip the state of `isActive`

`toggleable: true` could also be written as `{ handlers: { toggle: state => !state } }`

#### - loadable `PropTypes.bool`

default: `false`

`loadable: true` creates a loaded state:

```javascript

const seed = {
  name: 'users',
  initialState: {},
  loadable: true
}
/*
results in these props:
{
  users: {},
  usersLoaded: false
  handlers: {
    setUsers: [Function],
    setUsersLoaded: [Function],
  }
}
*/

```

In the example, `usersLoaded` is automatically set to `true` when `users` is updated.


#### - resetable `PropTypes.bool`

default: `false`

`resetable: true` will create a handler that will set the state to its initial value. For example, `resetCounter`.

## withHandlers
`PropTypes.objOf(PropTypes.func)`

`withHandlers` takes an object of high-order functions.

Here you can access the `react-senna` props so you can you create more complex state changes.
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
    // run multiple react-senna handlers
    handlers.setCounterA(num);
    handlers.setCounterB(num);
  }
};

const App = () => (
  <Store
    seeds={seeds}
    withHandlers={withHandlers}
    // use new `props.handlers.setAll` in render:
    render={({ handlers, counterA, counterB }) => (
       <div>
        A: {props.counterA}
        <br />
        B: {props.counterB}
        <br />
        <button onClick={() => handlers.setAll(10)}>
          set all counters to 10
        </button>
      </div
    )}
  />
)
```

You can do aysnc stuff too in `withHandlers`:

```javascript

const seeds = [
  {
    name: "users",
    initialState: {}
  }
];

const withHandlers = {
  get: ({ handlers }) => () => {
    setTimeout(() => {
      handlers.setUsers(
        {
          some: "users"
        },
        1000
      );
    });
  }
};

// creates a `handlers.getUsers` prop

```
