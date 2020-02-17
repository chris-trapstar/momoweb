import { createReducer, createActions } from "reduxsauce";

/* ------------- Types and Action Creators ------------- */
const { Types, Creators } = createActions({
  setAuthenticated: ["authenticated"],
  setLoading: ["loading"],
  setUser: ["user"]
});

export const AuthTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

const defaultState = {
  authenticated: false,
  loading: false,
  user: {}
};

/* ------------- Reducers ------------- */
const setAuthenticated = (state, { authenticated }) => ({
  ...state,
  authenticated
});
const setLoading = (state, { loading }) => ({
  ...state,
  loading
});
const setUser = (state, { user }) => ({
  ...state,
  user
});

/* ------------- Hookup Reducers To Types ------------- */
export const authReducer = createReducer(defaultState, {
  [Types.SET_AUTHENTICATED]: setAuthenticated,
  [Types.SET_LOADING]: setLoading,
  [Types.SET_USER]: setUser
});
