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
import Verification from "./user-pages/Verification";
import Spinner from "../app/shared/Spinner";
import { AuthActions } from "./store";

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
        <Route exact path="/verify" component={Verification} />
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
  state = {};

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
  setLoading: AuthActions.setLoading
};

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
);
