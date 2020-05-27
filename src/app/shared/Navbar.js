import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import { Link, withRouter } from "react-router-dom";
import { Trans } from "react-i18next";
import { connect } from 'react-redux';

import { AuthActions } from "../store";

class Navbar extends Component {
  toggleOffcanvas() {
    document.querySelector(".sidebar-offcanvas").classList.toggle("active");
  }
  toggleRightSidebar() {
    document.querySelector(".right-sidebar").classList.toggle("open");
  }
  onLogout = () => {
    this.props.onLogout();
  };
  render() {
    return (
      <nav className="navbar p-0 fixed-top d-flex flex-row">
        <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
          <div className='d-flex flex-row justify-content-center' style={{ position: 'absolute', flex: 1, width: 'calc(100% - 30px)' }}>
            <div className='logo'>
              <h1>MOMO</h1>
              <h2>PROFIT FROM MOMENTUM</h2>
            </div>
          </div>
          <ul className="navbar-nav navbar-nav-right">
            <Dropdown alignRight as="li" className="nav-item d-none d-lg-block">
              <Dropdown.Menu className="navbar-dropdown preview-list create-new-dropdown-menu">
                <h6 className="p-3 mb-0">
                  <Trans>Projects</Trans>
                </h6>
                <Dropdown.Divider />
                <Dropdown.Item
                  href="!#"
                  onClick={evt => evt.preventDefault()}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-file-outline text-primary"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject ellipsis mb-1">
                      <Trans>Software Development</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  href="!#"
                  onClick={evt => evt.preventDefault()}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-web text-info"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject ellipsis mb-1">
                      <Trans>UI Development</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  href="!#"
                  onClick={evt => evt.preventDefault()}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-layers text-danger"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject ellipsis mb-1">
                      <Trans>Software Testing</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <p className="p-3 mb-0 text-center">
                  <Trans>See all projects</Trans>
                </p>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown alignRight as="li" className="nav-item" style={{ zIndex: 100 }}>
              <Dropdown.Toggle
                as="a"
                className="nav-link cursor-pointer no-caret"
              >
                <i className="mdi mdi-menu" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="navbar-dropdown preview-list navbar-profile-dropdown-menu">
                <h6 className="p-3 mb-0">
                  <Trans>Profile</Trans>
                </h6>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={evt => { this.props.history.push('/dashboard') }}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-gauge text-success"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">
                      Dashboard
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={evt => { this.props.history.push('/plans') }}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-code-string text-success"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">
                      Plan: {this.props.user.subscription ? this.props.user.subscription.plan : ''}
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={evt => { this.props.history.push('/settings') }}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-settings text-success"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">
                      <Trans>Settings</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  href="!#"
                  onClick={evt => {
                    evt.preventDefault();
                    this.onLogout();
                  }}
                  className="preview-item"
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-dark rounded-circle">
                      <i className="mdi mdi-logout text-danger"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1">
                      <Trans>Log Out</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
              </Dropdown.Menu>
            </Dropdown>
          </ul>
        </div>
      </nav>
    );
  }
}

export default withRouter(connect(state => {
  console.info('NavBar user - ', state.auth.user)
  return { user: state.auth.user }
})(Navbar));
