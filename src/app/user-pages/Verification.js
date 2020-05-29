import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Form } from "react-bootstrap";
import { connect } from "react-redux";
import cogoToast from 'cogo-toast';

import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

class Verification extends Component {
  state = {
    errTxt: '',
    succTxt: ''
  };

  componentDidMount() {
    if (!this.props.user.email) {
      console.error('Email missing!')
    }
  }

  componentWillUpdate() {
    console.info('verification page update');
    if (this.props.user && this.props.user.email_verified) {
      this.props.history.push('/dashboard')
    }
  }

  onResend = () => {
    this.setState({ errTxt: "" });

    if (this.refEmail.value) {
      if (!validateEmail(this.refEmail.value)) {
        return cogoToast.error('Please entner a valid eamil address!')
      }
    }

    Api.verify(this.refEmail.value || this.props.user.email)
      .then(() => {
        this.setState({ errTxt: '', succTxt: 'Sent successfully' })
      })
      .catch(error => {
        let errTxt = error.toString()
        if (error.toString() === 'TypeError: Failed to fetch') {
          errTxt = 'Service not available';
        } else {
          errTxt = i18n.getResource("en", ["translations"], errTxt);
          if (!errTxt) {
            errTxt = "Unknown problem";
          }
        }
        this.setState({ errTxt, succTxt: '' });
      });
  };

  render() {
    const { errTxt, succTxt } = this.state;
    return (
      <div>
        <div className="d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-6 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <span className="h2 pr-2">MOMO</span><span className="bg-light text-dark ">PRO</span>
                </div>
                <h4>Verify Email</h4>
                <div>An email was sent to your registered email account.</div>
                <div>Please click the confirmation link in email to continue.</div>
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
                <small className="text-center text-muted">You may change your email if you didn't receive the verification email at <u>{this.props.user.email}</u>.</small>

                {errTxt !== "" && (
                  <label className="text-danger">{`${errTxt}`}</label>
                )}
                {succTxt !== "" && (
                  <label className="text-success mt-3">{`${succTxt}`}</label>
                )}
                <Form className="pt-3">
                  <div className="mt-3">
                    <a
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      onClick={this.onResend}
                    >
                      Resend
                    </a>
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
  setUser: AuthActions.setUser
};

const mapStateToProps = state => ({
  authenticated: state.auth.authenticated,
  user: state.auth.user
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Verification));
