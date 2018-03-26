import * as React from "react";
import * as PropTypes from "prop-types";
import * as map from "ramda/src/map";
import * as omit from "ramda/src/omit";

// TYPES

type Render = React.StatelessComponent<State>;
type Comp = React.Component;
type HandlerItem = (Props: {}) => (...args: any[]) => {};

interface State {
  // react state
  [name: string]: any;
}

interface Functions {
  [name: string]: Function;
}

interface DeriveStateItem {
  onStateChange: string[] | string;
  derive: (state: State) => State;
}

interface Props {
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
  prevState: State,
  state: State,
  deriveState: DeriveStateItem[] = []
) =>
  deriveState.reduce((acc, { onStateChange, derive }) => {
    if (typeof onStateChange === "string") onStateChange = [onStateChange];
    if (!stateHasChanged(onStateChange, prevState, state)) return acc;
    return derive({ ...state, ...acc });
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

export class Container extends React.Component<Props, {}> {
  state = {};
  static propTypes = propTypes;
  componentDidMount() {
    const { state, withHandlers } = this.props;
    const setters = createSetters(this, state);
    const handlers = createHandlers(this, withHandlers);
    this.setState({ ...state, ...setters, ...handlers });
  }
  componentDidUpdate(prevProps: object, prevState: State) {
    const dState = reduceDerivedState(
      prevState,
      this.state,
      this.props.deriveState
    );
    Object.keys(dState).length && this.setState(dState);
  }
  render() {
    const userProps = omit(Object.keys(propTypes), this.props);
    const { render, omitProps } = this.props;
    const state = { ...this.state, ...userProps };
    return render(Array.isArray(omitProps) ? omit(omitProps, state) : state);
  }
}

// HELPERS

const cap = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export default Container;
