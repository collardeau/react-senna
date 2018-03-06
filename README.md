[![Build Status](https://travis-ci.org/collardeau/react-senna.svg?branch=master)](https://travis-ci.org/collardeau/react-senna)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-senna/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-senna?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# react-senna

A store component to quickly initialize state and `setState` handlers in React.

## Installation

`npm install react-senna`

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

## Props

A Senna store takes in the following props:

### seeds

`PropTypes.array.isRequired`

An array of seed objects that will initialize our store, with the following keys:

#### - name
`PropTypes.string.isRequired`

The name of the state to be created.

#### - initialState
`PropTypes.any`

The initial (and reset) value of the state in question.

#### - handlers

`PropTypes.objOf(PropTypes.func)`

To create custom handlers with the current state as a param.

For example a seed with:

`{ name: 'counter', initialState: 0, handlers: {incr: state => state + 1}`
will receive `handlers.incrCounter` as a `prop`, which as suggested would increment the `counter` state by 1.

#### - resetable

`PropTypes.objOf(PropTypes.bool)`
default: `false`

`resetable: true` will create a handler that will set the state to its initial value.

For example a seed with:

`{ name: 'counter', initialState: 0, resetable: true }`
will receive `handlers.resetCounter` as a `prop`, which sets the `counter` state to 0.

#### - toggleable

`PropTypes.objOf(PropTypes.bool)`
default: `false`

`toggleable: true` will create a handler that will set the state to its opposite.

For example a seed with:

`{ name: 'isActive', initialState: false, toggleable: true }`
will receive `handlers.toggleIsActive` as a `prop`, which will flip the state(`!state`)

`toggleable: true` is a shorcut for `{ handlers: { toggle: state => !state } }`

