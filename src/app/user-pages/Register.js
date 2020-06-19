import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { Form } from "react-bootstrap";

import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";

export class Register extends Component {
  state = {
    loginErrTxt: "",
    agreedTerms: false
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.authenticated && nextProps.email_verified) {
      this.props.history.push("/dashboard");
    }
  }

  onChangeTerms = () => {
    this.setState({ agreedTerms: this.refTerms.checked });
    if (!this.refTerms.checked) {
      this.setState({ loginErrTxt: '' });
    }
  }

  onRegister = (e) => {
    e.preventDefault()
    this.setState({ loginErrTxt: '' })
    if (this.refPassword.value !== this.refConfirm.value) {
      this.setState({ loginErrTxt: i18n.getResource("en", ["translations"], 'password_mismatch') });
      return;
    }
    const email = this.refEmail.value;
    const username = this.refUser.value;
    const password = this.refPassword.value;
    this.props.setLoading(true);
    Api.signup(email, username, password)
      .then(({ user, access_token }) => {

        // Save Session
        Api.setSession(access_token);

        this.props.setUser(user);
        this.props.setLoading(false);
        this.props.setAuthenticated(true);

        this.props.history.push("/verify");
      })
      .catch(error => {
        const errTxt = error.toString()
        console.info(errTxt);
        let loginErrTxt
        if (error.toString() === 'TypeError: Failed to fetch') {
          loginErrTxt = 'Service not available';
        } else if (error.toString().startsWith('Error: ER_DUP_ENTRY')) {
          loginErrTxt = 'This user already exists';
        } else {
          loginErrTxt = i18n.getResource("en", ["translations"], errTxt);
          if (!loginErrTxt) {
            loginErrTxt = "Unknown problem";
          }
        }

        this.setState({ loginErrTxt });
        this.props.setLoading(false);
        this.props.setAuthenticated(false);
      });
  };

  render() {
    const { loginErrTxt, agreedTerms } = this.state;
    return (
      <div>
        <div className="d-flex align-items-center auth px-0 h-100">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <span className="h2 pr-2">MOMO</span>
                </div>
                <h4>New here?</h4>
                <h6 className="font-weight-light"> Join us today. It takes only a few steps</h6>
                <form className="pt-3" onSubmit={this.onRegister}>
                  <Form.Group>
                    <label>Username</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <i className="input-group-text mdi mdi-account text-success" />
                      </div>
                      <Form.Control type="text" className="form-control text-light" placeholder="Username"
                        ref={ref => {
                          this.refUser = ref;
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <label>Email</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <i className="input-group-text mdi mdi-email text-success" />
                      </div>
                      <Form.Control type="text" className="form-control text-light" placeholder="Email"
                        ref={ref => {
                          this.refEmail = ref;
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <label>Password</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <i className="input-group-text mdi mdi-lock text-success" />
                      </div>
                      <Form.Control type="password" className="form-control text-light" placeholder="Password"
                        ref={ref => {
                          this.refPassword = ref;
                        }}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group>
                    <label>Confirm Password</label>
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <i className="input-group-text mdi mdi-lock text-success" />
                      </div>
                      <Form.Control type="password" className="form-control text-light" placeholder="Password"
                        ref={ref => {
                          this.refConfirm = ref;
                        }}
                      />
                    </div>
                  </Form.Group>
                  <div className="mb-4">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input type="checkbox" className="form-check-input" onChange={this.onChangeTerms} ref={ref => { this.refTerms = ref; }} />
                        <i className="input-helper"></i>
                        I agree to all <a href='https://www.mometic.com/terms/'  target='_blank'>Terms & Conditions</a>
                      </label>
                    </div>
                  </div>
                  {loginErrTxt !== "" && (
                    <label className="text-danger">{`${loginErrTxt}`}</label>
                  )}
                  <div className="mt-3">
                    <button className="btn btn-block btn-success btn-lg font-weight-medium auth-form-btn" type="submit" disabled={!agreedTerms}>
                      SIGN UP >>
                    </button>
                  </div>
                  <div className="text-center mt-4 font-weight-light">
                    Already have an account? <Link to="/login" className="text-primary">Login</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);
