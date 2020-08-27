import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as firebase from 'firebase/app';
import cogoToast from 'cogo-toast';
import { withTranslation } from 'react-i18next';

import './App.scss';
import './firebase'; // Init Firebase SDK
import AppRoutes from './AppRoutes';
import Navbar from './shared/Navbar';
import Sidebar from './shared/Sidebar';
import Footer from './shared/Footer';
import Login from './user-pages/Login';
import Register from './user-pages/Register';
import ForgotPassword from './user-pages/ForgotPassword';
import ResetPassword from './user-pages/ResetPassword';

import Spinner from '../app/shared/Spinner';
import { AuthActions } from './store';
import API from './api';

if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();
  messaging.onMessage((payload) => {
    console.info('Firebase Notification Received:', payload)
    const message = payload.notification.body
    cogoToast.info(message)
    const event = new CustomEvent('alert', { detail: message });
    window.dispatchEvent(event)
  })
}

class App extends Component {
  onLogout = () => {
    this.props.setAuthenticated(false);
    this.props.setLoading(false);
  };

  render() {
    const { loading, authenticated } = this.props;
    return (
      <Switch>
        <Route exact path='/login' component={Login} />
        <Route exact path='/register' component={Register} />
        <Route exact path='/forgot-password' component={ForgotPassword} />
        <Route exact path='/reset-password' component={ResetPassword} />

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

  checkEmailVerified = () => {
    API.signInWithToken().then((data) => {
      console.info('sign in with token data', data);
      this.props.setUser(data.user);
      this.props.setLoading(false);
      this.props.setAuthenticated(true);
    }).catch(error => {
      console.info('sign in with token error', error);
    })
  }

  onLogout = () => {
    this.props.onLogout();
  };

  isVerified() { // email verified, subscribed
    const { user } = this.props
    return user.email_verified && user.subscription
  }

  render() {
    // Check Auth
    if (this.props.loading) {
      return <Spinner />;
    } else if (!this.props.authenticated) {
      return <Redirect to='/login' />;
    }

    let navbarComponent = !this.state.isFullPageLayout && this.isVerified() ? <Navbar onLogout={this.onLogout} /> : null;
    let sidebarComponent = !this.state.isFullPageLayout && this.isVerified() ? <Sidebar /> : null;
    let footerComponent = !this.state.isFullPageLayout && this.isVerified() ? <Footer /> : null;

    const { user, history } = this.props

    console.info('Path:', this.props.history)
    console.info('User:', user)

    if (!user.email_verified) {
      if (history.location.pathname !== '/verify') {
        return <Redirect to='/verify' />;
      }
    } else if (!user.subscription) {
      if (history.location.pathname !== '/plans') {
        return <Redirect to='/plans' />;
      }
    }

    return (
      <div className='container-scroller'>
        <div className='container-fluid page-body-wrapper'>
          {navbarComponent}
          <div className='main-panel'>
            <div className='content-wrapper'>
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
};

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading,
  user: state.auth.user
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
);
