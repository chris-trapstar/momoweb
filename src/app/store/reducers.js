import { combineReducers } from "redux";
import { authReducer as auth } from "./auth";
import { menuReducer as menu } from "./menu";
import { configReducer as config } from "./config";

export default () =>
  combineReducers({
    auth,
    menu,
    config,
  });
