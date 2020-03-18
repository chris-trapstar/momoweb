import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Form, Button, Modal } from "react-bootstrap";
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
    plan: null, // selected plan
    currentPlan: null,
    changeCard: false,
    subscribing: false,
    showCardInput: false
  };

  componentDidMount() {
    // get plans
    this.getPlans()
    this.getCustomer()
  }

  getPlans = async () => {
    try {
      const plans = await Api.getStripePlans()
      const { subscription } = this.props.user
      let plan = null
      if (subscription) {
        plan = plans.find(({ id }) => (id === subscription.plan))
      }

      this.setState({ plans, plan, currentPlan: plan })
    } catch (e) {
      cogoToast.error('Failed to get plans!')
    }
  }

  getCustomer = async () => {
    const customer = await Api.getCustomer()
    this.setState({
      customer
    })
  }

  onClickSaveCard = async () => {
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
      showCardInput: false,
      customer,
      stripe_customer
    })
  }

  onClickSubscribe = async () => {
    this.setState({ subscribing: true })
    const subscription = await Api.createSubscription(this.state.plan.id)
    this.setState({
      subscription
    })
  }

  renderCurrentCard = () => {
    const { customer } = this.state
    if (customer) {
      return <div>
        <span>{`${customer.card_kind} ***${customer.card_last_4}`} </span>
        <small>ending in </small>
        <span>{`${customer.card_exp_month}/${customer.card_exp_year}`}</span>
      </div>
    } else {
      return ''
    }
  }

  canSubscribe = () => {
    const { plan, currentPlan } = this.state

    return plan && (!currentPlan || currentPlan.id !== plan.id)
  }

  renderCardInput() {
    return <Modal
      show={this.state.showCardInput}
      onHide={() => { this.setState({ showCardInput: false }) }}
      aria-labelledby="example-modal-sizes-title-md"
    >
      <Modal.Header closeButton>
        <Modal.Title>Change Card</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group>
          <label htmlFor="cardInput">Current Card</label>
          <div id="cardInput">{this.renderCurrentCard()}</div>
        </Form.Group>
        {this.renderStripeCard()}
      </Modal.Body>

      <Modal.Footer className="fleex-wrap">
        <Button variant="success m-2" onClick={() => { this.onClickSaveCard }}>Save</Button>
        <Button variant="light m-2" onClick={() => { this.setState({ showCardInput: false }) }}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  }

  renderStripeCard() {
    return <div className="p-1 card-container"><Elements stripe={stripePromise} className="p-4 b-1">
      <ElementsConsumer>
        {({ elements, stripe }) => {
          this.elements = elements
          this.stripe = stripe
          return <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
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

  render() {
    return (
      <div>
        {this.renderCardInput()}
        <div className="align-items-center auth px-0">
          <div className="row">
            <h2 className="col-12 text-center">Subscription</h2>
          </div>
          <div className="row">
            {this.state.plans.map((plan) => {
              return <div className="col-md-3 text-center p-2" key={plan.id}>
                <div className={`card p-2 ${this.state.plan && plan.id === this.state.plan.id ? 'active-plan' : ''} plan-card`} onClick={() => { this.setState({ plan }) }}>
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
                        {this.state.customer && <Form.Group>
                          <label>Your Card</label>
                          <Button variant="secondary" className="change_card" onClick={() => { this.setState({ showCardInput: true }) }}>Change</Button>
                          {this.renderCurrentCard()}
                        </Form.Group>}

                        {this.canSubscribe() &&
                          <Form.Group>
                            <label htmlFor="exampleInputUsername1">PROMO CODE</label>
                            <Form.Control type="text" id="exampleInputUsername1" placeholder="COUPON CODE" size="lg" />
                          </Form.Group>
                        }

                      </div>
                    </div>
                  </div>
                  {this.canSubscribe() &&
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
