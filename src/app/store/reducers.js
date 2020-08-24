import { combineReducers } from "redux";
import { authReducer as auth } from "./auth";
import { menuReducer as menu } from "./menu";

export default () =>
  combineReducers({
    auth,
    menu,
  });
