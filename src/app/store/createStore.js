/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */

import {
  applyMiddleware,
  compose,
  createStore as createReduxStore,
} from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import makeRootReducer from "./reducers";

const initialState = window.__INITIAL_STATE__;

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["ui"],
};

const persistedReducer = persistReducer(persistConfig, makeRootReducer());
const middleware = [thunk];

// ======================================================
// Store Enhancers
// ======================================================
const enhancers = [];
// ======================================================
// Store Instantiation and HMR Setup
// ======================================================

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createReduxStore(
  persistedReducer,
  initialState,
  composeEnhancers(applyMiddleware(...middleware), ...enhancers)
);
if (module.hot) {
  module.hot.accept("./reducers", () =>
    store.replaceReducer(require("./reducers"))
  );
}
const persistor = persistStore(store, null, null);

export { store, persistor };
