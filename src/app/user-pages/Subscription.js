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
    subscribing: false,
    changingCard: false,
    showCardInput: false,
    coupon: ''
  };

  componentDidMount() {
    // get plans
    this.getPlans()
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

  onClickSaveCard = async () => {
    this.setState({ changingCard: true })
    try {
      const payload = await this.stripe.createToken(this.elements.getElement(CardElement));
      console.info('Payment Method:', payload)
      if (payload && payload.error) {
        cogoToast.error(payload.error.message)
        throw payload.error
      }
      const res = await Api.createCustomer(payload.token.id)
      console.info('Customer Response:', res)

      if (res && res.error) {
        cogoToast.error('Payment method verification failed!')
        throw res.error
      }
      const { customer } = res
      this.props.setUser({
        ...this.props.user,
        customer
      })
      this.setState({
        showCardInput: false,
      })
      cogoToast.success('Card saved!')
    } catch (e) {
      console.error('Failed to save card:', e)
    }
    this.setState({ changingCard: false })
  }

  onClickSubscribe = async (e) => {
    this.setState({ subscribing: true })
    try {
      let subscription = this.props.user.subscription
      if (subscription) {
        const res = await Api.cancelSubscription(subscription.id)
        console.info('Cancel Sub Result:', res)
        if (res && res.error) {
          cogoToast.error('Failed to upgrade the subscription, please try again!')
          throw res.error
        }
      }

      subscription = await Api.createSubscription(this.state.plan.id, this.state.coupon)
      if (subscription && subscription.error) {
        if (subscription.error.startsWith('Error: No such coupon:')) {
          return cogoToast.error('Invalid Coupon Code!')
        } else {
          return cogoToast.error('Subscription Failed, please try again!')
        }
      }

      // Set subscription
      this.props.setUser({ ...this.props.user, subscription })

      const plan = this.state.plans.find(({ id }) => (id === subscription.plan))

      this.setState({
        plan,
        currentPlan: plan
      })
      return cogoToast.success('Successfully subscribed!')
    } catch (e) {
      console.error('onClickSubscribe - ', e)
    }
    this.setState({ subscribing: false })
  }

  onClickCancelSubscription = async () => {
    const { subscription } = this.props.user
    if (!subscription) {
      console.error('onClickCancelSubscription: no subscription')
      return
    }

    try {
      const res = await Api.cancelSubscription(subscription.id)
      console.info('Cancel Sub Result:', res)
      if (res && res.error) {
        cogoToast.error('Failed to cancel the subscription, please try again!')
        return
      }
      this.props.setUser({ ...this.props.user, subscription: null })

      this.setState({
        currentPlan: null,
        plan: null
      })
    } catch (e) {
      console.error(e)
      cogoToast.error('Sorry, failed to cancel the current subscription, please try again')
    }
  }

  renderCurrentCard = () => {
    const { customer } = this.props.user
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

  getPlanClassName = (plan) => {
    const { currentPlan } = this.state

    return plan.id === (currentPlan && currentPlan.id) ? ' active-plan' : '' +
      plan.id === (this.state.plan && this.state.plan.id) ? ' selected-plan' : ''
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
        <Button variant="success m-2" onClick={this.onClickSaveCard} disabled={this.state.changingCard}>Save</Button>
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
    const { currentPlan } = this.state
    const { customer } = this.props.user
    return (
      <div>
        {this.renderCardInput()}
        <div className="align-items-center auth px-0">
          <div className="row ">
            <div className="col-12 text-center">
              <h2>Subscription</h2>
              <small className="text-muted">Please select your subscription plan.</small>
            </div>
          </div>
          <div className="div text-center">
            <div className="card p-2 col-md-4 my_card">
              {customer && <Form.Group>
                <label>Your Card</label>
                <Button variant="primary" className="change_card" onClick={() => { this.setState({ showCardInput: true }) }} size="md">Change</Button>
                {this.renderCurrentCard()}
              </Form.Group>}
            </div>
          </div>
          <div className="row">
            {this.state.plans.map((plan) => {
              return <div className="col-md-3 text-center p-2" key={plan.id}>
                <div className={`card p-2 ${this.getPlanClassName(plan)} plan-card`}
                  onClick={() => {
                    this.setState({ plan })

                    if (plan.id !== (this.state.plan && this.state.plan.id)) {
                      this.setState({ plan, coupon: '' })
                    }
                  }}>
                  <h4>Pro: {plan.name}</h4>
                  <p>${plan.amount / 100} / {plan.interval}</p>
                  {currentPlan && currentPlan.id === plan.id &&
                    <React.Fragment>
                      <p>Active</p>
                      <Button variant="secondary" onClick={this.onClickCancelSubscription} className="cancelBt">Cancel Subscription</Button>
                    </React.Fragment>
                  }
                  {this.state.plan && this.state.plan.id === plan.id && (!currentPlan || currentPlan.id !== plan.id) &&
                    <React.Fragment>
                      <div>
                        <input type="text" placeholder="COUPON CODE" className="couponCode"
                          value={this.state.coupon} onChange={(e) => {
                            this.setState({
                              coupon: e.target.value
                            })
                          }} />
                      </div>
                      <Button variant="primary" onClick={this.onClickSubscribe}>
                        {currentPlan ? 'Change Plan' : 'Subscribe'}
                      </Button>
                    </React.Fragment>
                  }
                </div>
              </div>
            })
            }
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
