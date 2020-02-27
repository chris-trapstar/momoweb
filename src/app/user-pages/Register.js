import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";

export class Register extends Component {
  state = {
    loginErrTxt: ""
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.authenticated) {
      this.props.history.push("/dashboard");
    }
  }

  onRegister = () => {
    this.setState({ loginErrTxt: '' })
    if (this.refPassword.value !== this.refConfirm.value) {
      this.setState({ loginErrTxt: 'The passwords do not match' })
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
    const { loginErrTxt } = this.state;
    return (
      <div>
        <div className="d-flex align-items-center auth px-0 h-100">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <img src={require("../../assets/images/logo.svg")} alt="logo" />
                </div>
                <h4>New here?</h4>
                <h6 className="font-weight-light">Signing up is easy. It only takes a few steps</h6>
                <form className="pt-3">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="exampleInputUsername1"
                      placeholder="Username"
                      ref={ref => {
                        this.refUser = ref;
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="exampleInputEmail1"
                      placeholder="Email"
                      ref={ref => {
                        this.refEmail = ref;
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="exampleInputPassword1"
                      placeholder="Password"
                      ref={ref => {
                        this.refPassword = ref;
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="exampleInputPassword1"
                      placeholder="Password (again)"
                      ref={ref => {
                        this.refConfirm = ref;
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input type="checkbox" className="form-check-input" />
                        <i className="input-helper"></i>
                        I agree to all Terms & Conditions
                      </label>
                    </div>
                  </div>
                  {loginErrTxt !== "" && (
                    <label className="text-danger">{`${loginErrTxt}`}</label>
                  )}
                  <div className="mt-3">
                    <a
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      onClick={this.onRegister}
                    >
                      SIGN UP
                    </a>
                    {/* <Link className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn" to="/dashboard">SIGN UP</Link> */}
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
  setUser: AuthActions.setUser
};

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
