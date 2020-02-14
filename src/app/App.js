import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Switch, Route, Redirect } from 'react-router-dom';

import './App.scss';
import AppRoutes from './AppRoutes';
import Navbar from './shared/Navbar';
import Sidebar from './shared/Sidebar';
import Footer from './shared/Footer';
import { withTranslation } from "react-i18next";
import Login from './user-pages/Login';
import Spinner from '../app/shared/Spinner';

class App extends Component {
  state = {
    authenticated: false,
    loading: true
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loading: false,
        authenticated: false
      })
    }, 3000)
  }

  render() {
    return <Switch>
      <Route exact path="/login" component={ Login } />
      <ProtectedApp{...this.props} loading={this.state.loading} authenticated={this.state.authenticated}/>
    </Switch>
  }
}

class ProtectedApp extends Component {
  state = {}

  render () {

    if (this.props.loading) {
      return <Spinner/>
    } else if (!this.props.authenticated) {
      return <Redirect to="/login"/>
    }
    let navbarComponent = !this.state.isFullPageLayout ? <Navbar/> : '';
    let sidebarComponent = !this.state.isFullPageLayout ? <Sidebar/> : '';
    let footerComponent = !this.state.isFullPageLayout ? <Footer/> : '';
    return (
      <div className="container-scroller">
        { sidebarComponent }
        <div className="container-fluid page-body-wrapper">
          { navbarComponent }
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes/>
            </div>
            { footerComponent }
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(withRouter(App));
