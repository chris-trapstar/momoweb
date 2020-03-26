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
    selectedPlan: null,
    currentPlan: null,
    subscribing: false,
    changingCard: false,
    showCardInput: false,
    coupon: '',
    name: '',
    phone: ''
  };

  componentDidMount() {
    // get plans
    this.getPlans()
  }

  getPlans = async () => {
    try {
      const plans = await Api.getStripePlans()
      const { subscription } = this.props.user
      let currentPlan = null
      if (subscription) {
        currentPlan = plans.find(({ id }) => (id === subscription.plan))
      }

      this.setState({ plans, currentPlan })
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

  onClickSubscribe = async (plan) => {
    this.setState({ subscribing: true })
    cogoToast.loading('Please wait for a moment!')
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

      subscription = await Api.createSubscription(plan.id, this.state.coupon)
      if (subscription && subscription.error) {
        if (subscription.error.startsWith('Error: No such coupon:')) {
          return cogoToast.error('Invalid Coupon Code!')
        } else {
          return cogoToast.error('Subscription Failed, please try again!')
        }
      }

      // Set subscription
      this.props.setUser({ ...this.props.user, subscription })

      const currentPlan = this.state.plans.find(({ id }) => (id === subscription.plan))

      this.setState({
        currentPlan
      })
      cogoToast.success('Successfully subscribed!')
      this.props.history.push('/dashboard')
    } catch (e) {
      cogoToast.error('Subscription failed, please try again!')
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
      cogoToast.loading('Please wait for a moment!');
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
      cogoToast.warn('Subscription cancelled, please subscribe to use the app!');
    } catch (e) {
      console.error(e)
      cogoToast.error('Sorry, failed to cancel the current subscription, please try again')
    }
  }

  onSelectPlan = (plan) => {
    this.setState({
      selectedPlan: plan,
      showCardInput: true
    })
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

  renderCardInput() {
    return <Modal
      show={this.state.showCardInput}
      onHide={() => { this.setState({ showCardInput: false, selectedPlan: null }) }}
      aria-labelledby="example-modal-sizes-title-md"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="h1">MOMO</span> <small className="bg-light text-dark"> PRO</small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {this.state.selectedPlan &&
          <React.Fragment>
            <h4>Payment</h4>
            <h4> >> Selected Plan: <span className="text-success">{this.state.selectedPlan.nickname}</span></h4>
          </React.Fragment>
        }


        {this.props.user.customer ?
          <Form.Group>
            <label htmlFor="cardInput">Current Card</label>
            <div id="cardInput">{this.renderCurrentCard()}</div>
          </Form.Group> : null
        }

        <Form.Group>
          <label>Name</label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">@</span>
            </div>
            <Form.Control type="text" className="form-control text-light" value={this.state.name} onChange={(e) => { this.setState({ name: e.target.value }) }} />
          </div>
        </Form.Group>

        <Form.Group>
          <label>Card Number</label>
          {this.renderStripeCard()}
        </Form.Group>

        <Form.Group>
          <label>Phone</label>

          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <i className="mdi mdi-cellphone" />
              </span>
            </div>
            <Form.Control type="text" className="form-control text-light" value={this.state.phone} onChange={(e) => { this.setState({ phone: e.target.value }) }} />
          </div>
        </Form.Group>
        <Form.Group>
          <div className="row">
            <div className="col-4 pt-2">
              <span className="text-muted">Discount Code</span>
            </div>
            <div className="col-4">
              <Form.Control type="text" className="form-control" />
            </div>
            <div className="col-4 pt-2">
              <button className="text-success coupon-apply">apply</button>
            </div>
          </div>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <div className="footer-container">
          <Button variant="success col-12" onClick={this.onClickSaveCard} disabled={this.state.changingCard} className="payBt">
            {this.state.selectedPlan ? `Pay $${this.state.selectedPlan.amount / 100}` : 'Save'}
          </Button>
        </div>
        {/*<Button variant="light m-2" onClick={() => { this.setState({ showCardInput: false }) }}>Cancel</Button>*/}
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
            <div className="col-2" />
            <div className="col-8 text-center">
              <h2>Select your Plan</h2>
              <p>Choose the plan that suits you the best. All plans come with a free no-risk 3 day trial. Cancel anytime via accounts</p>
            </div>
            <div className="col-2" />
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
              return <div className="col-md-4 p-4" key={plan.id}>
                <div className={`card p-4 plan-card h-100`}>
                  <h3 className="text-center">{plan.nickname}</h3>
                  <p className="text-center">{plan.metadata.description}</p>
                  <h2 className="text-center">${plan.amount / 100}</h2>
                  {
                    plan.metadata.features.split(', ').map((feature, index) => {
                      return <h5 className="my-2" key={`feature:${index}`}> - {feature}</h5>
                    })
                  }
                  <div className="pb-5" />
                  <div className="pb-5" />

                  <div className="bottomDiv text-center">
                    {currentPlan && currentPlan.id === plan.id &&
                      <React.Fragment>
                        <Button variant="secondary" onClick={this.onClickCancelSubscription} className="cardBt cancelBt mb-2">Cancel Subscription</Button>
                      </React.Fragment>
                    }
                    {(!currentPlan || currentPlan.id !== plan.id) &&
                      <React.Fragment>
                        <Button variant="success" onClick={() => { this.onSelectPlan(plan) }} className="cardBt selectBt mb-2">
                          Select
                      </Button>
                      </React.Fragment>
                    }
                    <div className="text-muted">Renews every {plan.interval}.</div>
                    <div className="text-muted">Cancel anytime</div>
                  </div>
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
