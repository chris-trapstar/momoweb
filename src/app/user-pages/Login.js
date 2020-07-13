import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import GoogleLogin from 'react-google-login';
import cogoToast from 'cogo-toast'

import { AuthActions } from '../store';
import Api from '../api';
import i18n from '../../i18n';

class Login extends Component {
  state = {
    loginErrTxt: ''
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.authenticated && nextProps.email_verified) {
      this.props.history.push('/dashboard');
    }
  }

  onLogin = () => {
    this.setState({ loginErrTxt: '' });
    const email = this.refEmail.value;
    const password = this.refPassword.value;
    this.props.setLoading(true);
    Api.login(email, password)
      .then(({ user, access_token }) => {

        // Save Session
        Api.setSession(access_token);
        this.props.setUser(user);
        this.props.setLoading(false);
        this.props.setAuthenticated(true);

        if (!user.email_verified) {
          this.props.history.push('/verify');
        } else if (!user.subscription) {
          this.props.history.push('/plans');
        } else {
          this.props.history.push('/dashboard');
        }
      })
      .catch(error => {
        const errTxt = error.toString()
        let loginErrTxt
        if (error.toString() === 'TypeError: Failed to fetch') {
          loginErrTxt = 'Service not available';
        } else {
          loginErrTxt = i18n.getResource('en', ['translations'], errTxt);
          if (!loginErrTxt) {
            loginErrTxt = 'Unknown problem';
          }
        }

        this.setState({ loginErrTxt });
        this.props.setLoading(false);
        this.props.setAuthenticated(true);
      });
  };

  onFacebook = () => { };

  onGoogleLogin = async (response) => {
    console.info('Google Login:', response)
    var id_token = response.getAuthResponse().id_token;
    console.info('Google id_token:', id_token)
    try {
      const { user, access_token } = await Api.signInWithGoogle({
        id_token
      })
      Api.setSession(access_token);
      this.props.setUser(user);
      this.props.setLoading(false);
      this.props.setAuthenticated(true);
      if (!user.subscription) {
        this.props.history.push('/plans');
      } else {
        this.props.history.push('/dashboard');
      }
    } catch (e) {
      console.error(e)
      cogoToast.error('Failed to sign in with Google, please try again.')
    }
  }

  render() {
    const { loginErrTxt } = this.state;
    return (
      <div>
        <div className='d-flex align-items-center auth px-0'>
          <div className='row w-100 mx-0'>
            <div className='col-lg-4 mx-auto'>
              <div className='card text-left py-5 px-4 px-sm-5'>
                <div className='brand-logo'>
                  <span className='h2 pr-2'>MOMO</span>
                </div>
                <h4>Sign Into your Account</h4>
                <h6 className='font-weight-light'>You may use your registered details or social account</h6>
                <Form className='pt-3'>
                  <Form.Group>
                    <label>Email</label>
                    <div className='input-group'>
                      <div className='input-group-prepend'>
                        <i className='input-group-text mdi mdi-email text-success' />
                      </div>
                      <Form.Control type='text' className='form-control text-light' placeholder='Email'
                        ref={ref => {
                          this.refEmail = ref;
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <label>Password</label>
                    <div className='input-group'>
                      <div className='input-group-prepend'>
                        <i className='input-group-text mdi mdi-lock text-success' />
                      </div>
                      <Form.Control type='password' className='form-control text-light' placeholder='Password'
                        ref={ref => {
                          this.refPassword = ref;
                        }}
                      />
                    </div>
                  </Form.Group>

                  {loginErrTxt !== '' && (
                    <label className='text-danger'>{`${loginErrTxt}`}</label>
                  )}
                  <div className='mt-3'>
                    <a
                      className='btn btn-block btn-success btn-lg font-weight-medium auth-form-btn'
                      onClick={this.onLogin}
                    >
                      SIGN IN
                    </a>
                  </div>
                  <div className='my-2 d-flex justify-content-between align-items-center'>
                    <div className='form-check'>
                      <label className='form-check-label text-muted'>
                        <input type='checkbox' className='form-check-input text-success' />
                        <i className='input-helper'></i>
                        Keep me signed in
                      </label>
                    </div>
                    <a
                      href='!#'
                      onClick={event => event.preventDefault()}
                      className='auth-link text-success'
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className='row'>

                    {/*<div className='mb-2 col'>
                      <button
                        type='button'
                        className='btn btn-block btn-facebook auth-form-btn'
                        onClick={this.onFacebook}
                      >
                        <i className='mdi mdi-facebook mr-2'></i>Facebook
                      </button>
                    </div>*/}

                    <div className='mb-2 col'>
                      <GoogleLogin
                        className='btn btn-block btn-google auth-form-btn'
                        clientId='4608974693-t302rfequk782c3b4bjhr15jfb90u80i.apps.googleusercontent.com'
                        buttonText='Sign In With Google'
                        onSuccess={this.onGoogleLogin}
                        onFailure={(e) => {
                          console.error('Failed to sign in with Google', e)
                        }}
                        cookiePolicy={'single_host_origin'}
                        render={({ onClick }) => {
                          return <button
                            onClick={onClick}
                            type='button'
                            className='btn btn-block btn-google auth-form-btn'
                          >
                            <i className='mdi mdi-google mr-2'></i>Google
                        </button>
                        }}
                      />

                    </div>
                  </div>

                  <div className='text-center mt-4 font-weight-light'>
                    Don't have an account?{' '}
                    <Link to='/register' className='text-success'>
                      Create now
                    </Link>
                  </div>

                </Form>
              </div>
            </div>
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
  authenticated: state.auth.authenticated
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
