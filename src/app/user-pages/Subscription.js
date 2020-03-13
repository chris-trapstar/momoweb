import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { connect } from "react-redux";
import { Elements, CardElement, ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import cogoToast from 'cogo-toast';

const stripePromise = loadStripe('pk_test_GfgTg1WYil3u1wBUbz8SgVoG');

import { AuthActions } from "../store";
import Api from "../api";
import i18n from "../../i18n";
import './subscription.scss'


class Subscription extends Component {
  state = {
    errTxt: '',
    succTxt: '',
    plans: [],
    plan_id: null,
    changeCard: false
  };

  componentDidMount() {
    // get plans
    this.getPlans()
  }

  componentWillUpdate() {

  }

  getPlans = async () => {
    const plans = await Api.getStripePlans()
    this.setState({ plans })
  }

  onClickSubscribe = async () => {
    const payload = await this.stripe.createToken(this.elements.getElement(CardElement));
    console.info('Payment Method:', payload)
    if (payload && payload.error) {
      cogoToast.error(payload.error.message)
      return
    }
    const res = await Api.createCustomer(payload.token.id)
    console.info('Customer Response:', res)

    if (res && res.error) {
      cogoToast.error('Payment method verification failed!')
      return
    }
    const { customer, stripe_customer } = res
    this.setState({
      customer,
      stripe_customer
    })
  }

  getCard = () => {
    const { customer } = this.state
    if (customer) {
      return `${customer.card_kind} ${customer.last4}`
    } else {
      return ''
    }
  }

  render() {
    return (
      <div>
        <div className="align-items-center auth px-0">
          <div className="row">
            <h2 className="col-12 text-center">Subscription</h2>
          </div>
          <div className="row">
            {this.state.plans.map((plan) => {
              return <div className="col-md-3 text-center p-2" key={plan.id}>
                <div className={`card p-2 ${plan.id === this.state.plan_id ? 'active-plan' : ''} plan-card`} onClick={() => { this.setState({ plan_id: plan.id }) }}>
                  <h4>Pro: {plan.name}</h4>
                  <p>${plan.amount / 100} / {plan.interval}</p>
                </div>
              </div>
            })
            }
          </div>
          {
            <div className="row w-100 mx-0">
              <div className="col-lg-6 mx-auto">
                <div className="card p-4">

                  <div className="card p-2">

                    <div className="row">
                      <div className="col-md-12">
                        {(!this.state.changeCard && this.state.customer) && <Form.Group>
                          <label htmlFor="exampleInputUsername1">Your Card</label>
                          <Button variant="secondary" className="change_card" onClick={() => { this.setState({ changeCard: true }) }}>Change</Button>
                          <Form.Control type="text" id="exampleInputUsername1" size="lg" value={this.getCard()} disabled />
                        </Form.Group>}

                        {this.state.plan_id &&
                          <Form.Group>
                            <label htmlFor="exampleInputUsername1">PROMO CODE</label>
                            <Form.Control type="text" id="exampleInputUsername1" placeholder="COUPON CODE" size="lg" />
                          </Form.Group>
                        }

                      </div>
                    </div>


                  </div>

                  {this.state.changeCard &&
                    <div id="paymentForm" className="m-4 p-2">
                      <Elements stripe={stripePromise}>
                        <ElementsConsumer>
                          {({ elements, stripe }) => {
                            this.elements = elements
                            this.stripe = stripe
                            return <CardElement
                              options={{
                                style: {
                                  base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                      color: '#aab7c4',
                                    },
                                  },
                                  invalid: {
                                    color: '#9e2146',
                                  },
                                },
                              }}
                            />
                          }}
                        </ElementsConsumer>


                      </Elements>
                    </div>
                  }
                  {this.state.plan_id &&
                    <Button variant="primary" onClick={this.onClickSubscribe}>Subscribe</Button>
                  }
                </div>
              </div>
            </div>}
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
