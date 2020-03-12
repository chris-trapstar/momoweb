import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Form } from "react-bootstrap";
import { connect } from "react-redux";
import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";

class Subscription extends Component {
  state = {
    errTxt: '',
    succTxt: ''
  };

  componentWillUpdate() {
    
  }

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
                <h4>Subscription</h4>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Subscription));
