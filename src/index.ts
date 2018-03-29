import * as React from "react";
import * as PropTypes from "prop-types";
import * as map from "ramda/src/map";
import * as omit from "ramda/src/omit";

// TYPES

type Render = React.StatelessComponent<State>;
type Comp = React.Component;
type HandlerItem = (Props: {}) => (...args: any[]) => {};

interface State {
  [name: string]: any;
}

interface Functions {
  [name: string]: Function;
}

interface DeriveStateItem {
  onStateChange: string[] | string;
  derive: (state: State) => State;
}

interface ContainerProps {
  render: Render;
  state: State;
  deriveState?: DeriveStateItem[];
  withHandlers?: Functions;
  omitProps?: string[];
}

// FUNCTIONS

const stateHasChanged = (list: string[], prevState: State, state: State) =>
  Array.isArray(list) &&
  list.reduce(
    (bool, next: string) => bool || prevState[next] !== state[next],
    false
  );

const reduceDerivedState = (
  deriveState: DeriveStateItem[] = [],
  // only pass deriveState to derive all states
  // regardless of listeners
  prevState?: State,
  state?: State
) =>
  deriveState.reduce((acc, { onStateChange, derive }) => {
    if (typeof onStateChange === "string") onStateChange = [onStateChange];
    if (state && stateHasChanged(onStateChange, prevState, state)) {
      return derive({ ...state, ...acc });
    }
    return acc;
  }, {});

const createSetters = (comp: Comp, state: State = {}) => {
  const setters: Functions = {};
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

const createHandlers = (comp: Comp, withHandlers: Functions = {}) =>
  map(fn => (...args: any[]) => fn(comp.state)(...args), withHandlers);

// REACT

const propTypes = {
  render: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  withHandlers: PropTypes.objectOf(PropTypes.func),
  omitProps: PropTypes.arrayOf(PropTypes.string),
  deriveState: PropTypes.arrayOf(
    PropTypes.shape({
      onStateChange: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
      ]).isRequired,
      derive: PropTypes.func.isRequired
    })
  )
};

const defaultProps = {
  state: {},
  withHandlers: {},
  deriveState: [] as DeriveStateItem[],
  omitProps: [] as string[],
  render: () => {
    warn("Please pass in a render function to your container");
    return null as null;
  }
};

const initialState = {
  _loaded: false
};

export class Container extends React.Component<ContainerProps, {}> {
  state = initialState;
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  componentDidMount() {
    const { state, withHandlers } = this.props;
    if (!Object.keys(state).length) {
      return warn("Please pass in a state object to your container.");
    }
    const setters = createSetters(this, state);
    const handlers = createHandlers(this, withHandlers);
    const dState = reduceDerivedState(this.props.deriveState);
    this.setState({ ...state, ...setters, ...handlers, ...dState });
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const dState = reduceDerivedState(
      this.props.deriveState,
      prevState,
      this.state
    );
    Object.keys(dState).length && this.setState(dState);
    !this.state._loaded && this.setState({ _loaded: true });
  }
  render() {
    if (!this.state._loaded) return null;
    const { render, omitProps } = this.props;
    if (typeof render !== "function") return null;
    const userProps = omit(Object.keys(propTypes), this.props);
    const state = { ...omit(["_loaded"], this.state), ...userProps };
    return render(omitProps.length ? omit(omitProps, state) : state);
  }
}

// HELPERS

const warn = (msg: string) => {
  console.warn(`[react-with-state-props]: ${msg}`);
  return null as null;
};

const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export default Container;
