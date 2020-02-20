import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import * as firebase from 'firebase/app';

import Dashboard from "./dashboard/Dashboard";
import Settings from "./settings/Settings";
import API from './api'

class AppRoutes extends Component {
  componentDidMount() {
    this.requestNotificationPermissions()
  }
  registerPushToken = async (registration_id) => {
    const result = await API.registerPushToken(registration_id)
    if (result) {

    } else { // Show Alert for push registration failed

    }
  }

  requestNotificationPermissions = async () => {
    const registration_id = await firebase.messaging().getToken()
    if (registration_id) {
      this.registerPushToken(registration_id)
    } else {
      alert('Please allow push notification permissions in the browser settings!')
    }
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
