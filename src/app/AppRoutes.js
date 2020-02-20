import React, { Component, Fragment, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Spinner from "../app/shared/Spinner";

import Dashboard from "./dashboard/Dashboard";
import Settings from "./settings/Settings";

class AppRoutes extends Component {
  render() {
    return (
      <Fragment>
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/settings" component={Settings} />
        <Redirect to="/dashboard" />
      </Fragment>
    );
  }
}

export default AppRoutes;
