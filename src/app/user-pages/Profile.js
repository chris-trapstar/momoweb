import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import qs from 'qs'
import { AuthActions } from '../store';
import Api from '../api';
import i18n from '../../i18n';
import cogoToast from 'cogo-toast';

export class Profile extends Component {
  state = {
    errTxt: '',
    name: '',
    email: '',
    password: '',
    confirm: ''
  };

  componentDidMount() {
    window.localStorage.removeItem('jwt_access_token')
  }

  onSubmit = async (e) => {
    e.preventDefault()
  };

  render() {
    const { errTxt } = this.state;
    return (
      <div>
        <div className='d-flex align-items-center auth px-0 h-100'>
          <div className='row w-100 mx-0'>
            <div className='col-lg-4 mx-auto'>
              <div className='card text-left py-5 px-4 px-sm-5'>
                <div className='brand-logo'>
                  <span className='h2 pr-2'>PROFILE</span>
                </div>
                <form className='pt-3' onSubmit={this.onSubmit}>

                  <Form.Group>
                    <label>Name</label>
                    <div className='input-group'>
                      <div className='input-group-prepend'>
                        <i className='input-group-text mdi mdi-account text-success' />
                      </div>
                      <Form.Control className='form-control text-light' placeholder='John Doe'
                        ref={ref => {
                          this.refConfirm = ref;
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <label>Email</label>
                    <div className='input-group'>
                      <div className='input-group-prepend'>
                        <i className='input-group-text mdi mdi-email text-success' />
                      </div>
                      <Form.Control className='form-control text-light' placeholder='Email'
                        ref={ref => {
                          this.refConfirm = ref;
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
                  <Form.Group>
                    <label>Confirm Password</label>
                    <div className='input-group'>
                      <div className='input-group-prepend'>
                        <i className='input-group-text mdi mdi-lock text-success' />
                      </div>
                      <Form.Control type='password' className='form-control text-light' placeholder='Confirm Password'
                        ref={ref => {
                          this.refConfirm = ref;
                        }}
                      />
                    </div>
                  </Form.Group>
                  <div className='mt-3'>
                    <button
                      type='submit'
                      className='btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn'
                    >
                      SAVE
                                        </button>
                  </div>
                  {errTxt !== '' && (
                    <label className='text-danger'>{`${errTxt}`}</label>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Profile));
