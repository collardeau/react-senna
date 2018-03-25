import * as React from "react";
import * as PropTypes from "prop-types";
import * as R from "ramda";

// TYPES

type HandlerItem = (Props: {}) => (...args: any[]) => {};
type DeriveStateItem = [string[], Function];
type Render = (props: object) => JSX.Element;

interface State {
  [name: string]: any;
}
interface Setters {
  [name: string]: Function;
}
interface Props {
  render: Render;
  state: State;
  deriveState: DeriveStateItem[];
  withHandlers: Setters; // object of functions
}

// FUNCTIONS

const reduceDeriveState = (
  prevState: State,
  state: State,
  deriveState: DeriveStateItem[] = []
) =>
  R.reduce((acc, [on, fn]) => {
    const hasChanged = R.reduce(
      (bool, next: string) => bool || prevState[next] !== state[next],
      false
    )(on);
    if (!hasChanged) return acc;
    return fn({ ...state, ...acc });
  }, {})(deriveState);

const createSetters = (comp: any, state: State) => {
  const setters: Setters = {};
  Object.keys(state).forEach(key => {
    setters[`set${cap(key)}`] = (newState: State, cb: () => {}) => {
      comp.setState(
        {
          [key]: newState
        },
        cb
      );
    };
  });
  return setters;
};

const createHandlers = (comp: any, withHandlers: Setters = {}) =>
  R.map(fn => (...args: any[]) => fn(comp.state)(...args), withHandlers);

// REACT

const propTypes = {
  render: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  withHandlers: PropTypes.objectOf(PropTypes.func),
  deriveState: PropTypes.arrayOf(
    PropTypes.arrayOf(
      (
        propValue,
        key: number | string,
        componentName,
        location,
        propFullName
      ) => {
        if (propValue.length < 2) {
          return new Error(
            `Invalid prop ${propFullName} supplied to ${componentName}. Expected an array of length 2`
          );
        }
        if (key === 0) {
          const val = propValue[key];
          if (!Array.isArray(val) || val.some(v => typeof v !== "string")) {
            return new Error(
              `Invalid prop ${propFullName} supplied to ${componentName}. Expected an array of strings`
            );
          }
        }
        if (key === 1) {
          const val = propValue[key];
          if (typeof val !== "function") {
            return new Error(
              `Invalid prop ${propFullName} supplied to ${componentName}. Expected a function`
            );
          }
        }
        return null;
      }
    )
  )
};

export default class Container extends React.Component<Props, {}> {
  state = {};
  static propTypes = propTypes;
  componentDidMount() {
    const { state, withHandlers } = this.props;
    const setters = createSetters(this, state);
    const handlers = createHandlers(this, withHandlers);
    this.setState({ ...state, ...setters, ...handlers });
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const derivedState = reduceDeriveState(
      prevState,
      this.state,
      this.props.deriveState
    );
    if (Object.keys(derivedState).length) {
      this.setState(derivedState);
    }
  }
  render() {
    const userProps = R.omit(Object.keys(propTypes))(this.props);
    return this.props.render({ ...this.state, ...userProps });
  }
}

// HELPERS

const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);
