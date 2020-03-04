import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import cogoToast from 'cogo-toast';

import "./App.scss";
import './firebase'; // Init Firebase SDK
import AppRoutes from "./AppRoutes";
import Navbar from "./shared/Navbar";
import Sidebar from "./shared/Sidebar";
import Footer from "./shared/Footer";
import { withTranslation } from "react-i18next";
import Login from "./user-pages/Login";
import Register from "./user-pages/Register";
import Spinner from "../app/shared/Spinner";
import { AuthActions } from "./store";
import API from './api';

const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.info('Firebase Notification Received:', payload)
  const message = payload.notification.body
  cogoToast.info(message)
})

class App extends Component {
  onLogout = () => {
    this.props.setAuthenticated(false);
    this.props.setLoading(false);
  };

  render() {
    const { loading, authenticated } = this.props;
    return (
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <ProtectedApp
          {...this.props}
          loading={loading}
          authenticated={authenticated}
          onLogout={this.onLogout}
        />
      </Switch>
    );
  }
}

class ProtectedApp extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.checkEmailVerified()
  }
  
  checkEmailVerified = async () => {
    const data = await API.signInWithToken()
    console.info('Refreshed User Profile:', data)
    this.props.setUser(data.user);
    this.props.setLoading(false);
    this.props.setAuthenticated(true);
  }

  onLogout = () => {
    this.props.onLogout();
  };

  render() {
    // Check Auth
    if (this.props.loading) {
      return <Spinner />;
    } else if (!this.props.authenticated) {
      return <Redirect to="/login" />;
    }

    if (!this.props.user.email_verified) {
      return <Redirect to="/verify" />;
    }

    let navbarComponent = !this.state.isFullPageLayout ? (
      <Navbar onLogout={this.onLogout} />
    ) : (
      ""
    );
    let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar /> : "";
    let footerComponent = !this.state.isFullPageLayout ? <Footer /> : "";
    return (
      <div className="container-scroller">
        {sidebarComponent}
        <div className="container-fluid page-body-wrapper">
          {navbarComponent}
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes />
            </div>
            {footerComponent}
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = {
  setAuthenticated: AuthActions.setAuthenticated,
  setLoading: AuthActions.setLoading,
  setUser: AuthActions.setUser,
  setLoginEmail: AuthActions.setLoginEmail
};

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading,
  user: state.auth.user
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
);
