[![Build Status](https://travis-ci.org/collardeau/react-senna.svg?branch=master)](https://travis-ci.org/collardeau/react-senna)
[![Coverage Status](https://coveralls.io/repos/github/collardeau/react-senna/badge.svg?branch=master)](https://coveralls.io/github/collardeau/react-senna?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Installation

`npm install react-senna`

## Usage

```javascript
import React from "react";
import { Store } from "react-senna";

// describe the state you want in a `seeds` array, as in a counter example:
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
        handlers: { <- use `setState` behind the scenes
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
