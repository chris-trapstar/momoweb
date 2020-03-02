import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { connect } from "react-redux";
import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";

class Verification extends Component {
  state = {
    errTxt: '',
    succTxt: ''
  };

  onResend = () => {
    this.setState({ errTxt: "" });
    this.props.setLoading(true);
    Api.verify(this.props.email)
      .then(() => {
        this.setState({ errTxt: '', succTxt: 'Sent successfully' })
      })
      .catch(error => {
        let errTxt = error.toString()
        if (error.toString() === 'TypeError: Failed to fetch') {
          errTxt = 'Service not available';
        } else {
          errTxt = i18n.getResource("en", ["translations"], errTxt);
          if (!lerrTxt) {
            errTxt = "Unknown problem";
          }
        }
        this.setState({ errTxt, succTxt: '' });
        this.props.setLoading(false);
        this.props.setAuthenticated(false);
      });
  };

  render() {
    const { errTxt, succTxt } = this.state;
    return (
      <div>
        <div className="d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                <div className="brand-logo">
                  <h2>MomoWeb</h2>
                </div>
                <h4>Please Verify Your Email</h4>
                <h6 className="font-weight-light">Your email: {this.props.email}</h6>
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
  email: state.auth.email
});

export default connect(mapStateToProps, mapDispatchToProps)(Verification);
