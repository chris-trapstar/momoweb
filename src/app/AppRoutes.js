import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Dashboard from "./dashboard/Dashboard";
import Settings from "./settings/Settings";

class AppRoutes extends Component {

  componentDidMount() {

  }

  render() {
    return (
      <Switch>
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/settings" component={Settings} />
        <Redirect to="/dashboard" />
      </Switch>
    );
  }
}

export default AppRoutes;
