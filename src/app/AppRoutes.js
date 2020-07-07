import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import * as firebase from 'firebase/app';

import Dashboard from "./dashboard/Dashboard";
import Settings from "./settings/Settings";
import Verification from './user-pages/Verification';
import Subscription from './user-pages/Subscription';

import API from './api'
import cogoToast from 'cogo-toast';

class AppRoutes extends Component {
  componentDidMount() {
    this.requestNotificationPermissions()
  }
  registerPushToken = async (registration_id) => {
    const result = await API.registerPushToken(registration_id)
    console.info('Push Token Register Result:', result)
  }

  requestNotificationPermissions = async () => {
    try {
      const registration_id = await firebase.messaging().getToken()
      if (registration_id) {
        this.registerPushToken(registration_id)
      } else {
        alert('Please allow push notification permissions in the browser settings!')
      }
    } catch (e) {
      cogoToast.error('Please allow the push notification permissions in the browser settings!')
    }
  }
  render() {
    return (
      <Switch>
        <Route exact path="/verify" component={Verification} />
        <Route exact path="/plans" component={Subscription} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/settings" component={Settings} />
        <Redirect to="/dashboard" />
      </Switch>
    );
  }
}

export default AppRoutes;
