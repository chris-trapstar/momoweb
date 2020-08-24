import { createReducer, createActions } from "reduxsauce";

const defaultState = {
  stream: true,
  alertHistory: true,
  meters: true,
  popular: true,
  quotes: true,
  discovery: true,
};

export const { Types, Creators } = createActions({
  activate: ["button"],
  deactivate: ["button"],
  toggleMenu: ["button"],
});

export const MenuTypes = Types;
export default Creators;

const activate = (state, { button }) => ({
  ...state,
  [button]: true,
});

const deactivate = (state, { button }) => ({
  ...state,
  [button]: false,
});

const toggle = (state, { button }) => {
  return {
    ...state,
    [button]: !state[button],
  };
};

/* ------------- Hookup Reducers To Types ------------- */
export const menuReducer = createReducer(defaultState, {
  [Types.ACTIVATE]: activate,
  [Types.DEACTIVATE]: deactivate,
  [Types.TOGGLE_MENU]: toggle,
});
