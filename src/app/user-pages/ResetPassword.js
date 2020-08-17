import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import qs from 'qs'
import { AuthActions } from '../store';
import Api from '../api';
import i18n from '../../i18n';
import cogoToast from 'cogo-toast';

export class ResetPassword extends Component {
    state = {
        errTxt: '',
    };

    componentDidMount() {
        window.localStorage.removeItem('jwt_access_token')
    }

    onSubmit = async (e) => {
        e.preventDefault()
        const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })
        console.info('Props:', query)
        const { token } = query
        const password = this.refPassword.value
        const rePassword = this.refConfirm.value
        if (password.length < 6) {
            return cogoToast.error('At least 6 characters required!')
        }
        if (password != rePassword) {
            return cogoToast.error('Password not matched!')
        }
        await Api.resetPassword(password, token)
        cogoToast.success('The password is successfully reset! You will be redirected to the login page.')
        setTimeout(() => {
            this.props.history.replace('/login')
        }, 2000)
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
                                    <span className='h2 pr-2'>MOMO</span>
                                </div>
                                <h4>Reset your password</h4>
                                <h6 className='font-weight-light'>Please enter a new password.</h6>
                                <form className='pt-3' onSubmit={this.onSubmit}>
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
                                            <Form.Control type='password' className='form-control text-light' placeholder='Password'
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
                                            RESET
                                        </button>
                                    </div>
                                    {errTxt !== '' && (
                                        <label className='text-danger'>{`${errTxt}`}</label>
                                    )}

                                    <div className='text-center mt-4 font-weight-light'>
                                        <Link to='/login' className='text-primary'>Login</Link>
                                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ResetPassword));
