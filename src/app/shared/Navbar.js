import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { AuthActions } from '../store';

class Navbar extends Component {
  toggleOffcanvas() {
    document.querySelector('.sidebar-offcanvas').classList.toggle('active');
  }
  toggleRightSidebar() {
    document.querySelector('.right-sidebar').classList.toggle('open');
  }
  onLogout = () => {
    this.props.onLogout();
  };
  getPlanType = (type) => {
    switch (type) {
      case 'standard_monthly':
        return 'Standers';
      case 'pro_monthly':
        return 'Monthly';
      case 'pro_semi_annual':
        return 'Annual';
    }
    return 'None';
  };
  render() {
    return (
      <nav className='navbar p-0 fixed-top d-flex flex-row'>
        <div className='navbar-menu-wrapper flex-grow d-flex align-items-stretch'>
          <div
            className='d-flex flex-row'
            style={{
              flex: 1,
              position: 'absolute',
              width: 'calc(100% - 30px)',
            }}
          >
            <div
              className='logo'
              style={{ cursor: 'pointer' }}
              onClick={() => this.props.history.push('/dashboard')}
            >
              <span
                style={{
                  color: '#ffff',
                  fontSize: '36px',
                  fontWeight: '600',
                  marginRight: 4,
                }}
              >
                MOMO
              </span>
              {this.props.isPro && (
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      paddingLeft: 2,
                      paddingRight: 2,
                      fontSize: '13px',
                      color: '#000000',
                      fontWeight: '600',
                      background: '#ffff',
                    }}
                  >
                    PRO
                  </span>
                </div>
              )}
            </div>
          </div>
          <ul className='navbar-nav navbar-nav-right'>
            <Dropdown
              alignRight
              as='li'
              className='nav-item'
              style={{ zIndex: 100 }}
            >
              <Dropdown.Toggle
                as='a'
                className='nav-link cursor-pointer no-caret'
              >
                <i className='mdi mdi-menu' />
              </Dropdown.Toggle>

              <Dropdown.Menu className='navbar-dropdown preview-list navbar-profile-dropdown-menu'>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={(evt) => {
                    this.props.history.push('/dashboard');
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-gauge text-success'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>Dashboard</p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={(evt) => {
                    this.props.history.push('/plans');
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-code-string text-success'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>
                      Plan:{' '}
                      <b>
                        {this.props.user.subscription
                          ? this.getPlanType(this.props.user.subscription.plan)
                          : ''}
                      </b>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={(evt) => {
                    this.props.history.push('/settings');
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-settings text-success'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>
                      <Trans>Settings</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  href='!#'
                  onClick={(evt) => {
                    evt.preventDefault();
                    this.props.history.push('/profile');
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-account-outline text-success'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>
                      <Trans>My Profile</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => {
                    window.open(
                      'https://www.mometic.com/momowebpro-help/',
                      '_blank'
                    );
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-help text-success'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>
                      <Trans>Help</Trans>
                    </p>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />

                <Dropdown.Item
                  href='!#'
                  onClick={(evt) => {
                    evt.preventDefault();
                    this.onLogout();
                  }}
                  className='preview-item'
                >
                  <div className='preview-thumbnail'>
                    <div className='preview-icon bg-dark rounded-circle'>
                      <i className='mdi mdi-logout text-danger'></i>
                    </div>
                  </div>
                  <div className='preview-item-content'>
                    <p className='preview-subject mb-1'>
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

export default withRouter(
  connect((state) => {
    // console.info('NavBar user - ', state.auth.user);
    return {
      user: state.auth.user,
      isPro:
        state.auth.user.subscription.plan === 'pro_monthly' ||
        state.auth.user.subscription.plan === 'pro_semi_annual',
    };
  })(Navbar)
);
