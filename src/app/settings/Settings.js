import React, { Component } from 'react';
import API from '../api';
import './settings.css';
import Slider from 'nouislider-react';
import cogoToast from 'cogo-toast';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AuthActions } from '../store';
import AlertInput from './alertInput';
import { PRICE_MIN, PRICE_MAX, AVG_VOL_MIN, AVG_VOL_MAX, SECTORS_FILTER, DEFAULT_FILTER } from '../constants'

const alerts = [
  {
    type: 'trade',
    label: 'High/Low',
    valueLabel: 'Sensitivity',
  }, {
    type: 'uv',
    label: 'Unusual Volume (%)',
    valueLabel: '% Deviation',
    pro: true
  }, {
    type: 'vwap',
    label: 'VWAP dist (%)',
    valueLabel: '% Dist VWAP',
    pro: true
  }, {
    type: 'price',
    label: 'Price',
    valueLabel: '% Change',
    pro: true
  }
]

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      isSmallDevice: window.matchMedia("(max-width: 768px)").matches,
      currentAlert: { category: '', rate: '' },
      filter: null,
      editingAlertId: null
    };
  }

  componentDidMount() {
    const handler = e => this.setState({ isSmallDevice: e.matches });
    window.matchMedia("(max-width: 767px)").addListener(handler);
    this.getAlertSettings();

    let filter = { ...DEFAULT_FILTER }
    let data_filter = localStorage.getItem("filter");
    if (data_filter) {
      try {
        let cached_filter = JSON.parse(data_filter);

        filter.industries = cached_filter.industries || filter.industries
        filter.price = cached_filter.price || filter.price;
        filter.volume = cached_filter.volume || filter.volume;

        localStorage.setItem("filter", JSON.stringify(filter));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("filter", JSON.stringify(filter));
    }

    console.info('Filter Loaded:', filter)
    this.setState({ filter });
  }

  getAlertSettings = async () => {
    const alerts = await API.getAlerts();
    console.info("Alert Settings:", alerts);

    this.setState({
      alerts
    });
  };

  getAlertsByType = (type) => {
    const { alerts } = this.state
    return alerts.filter((alert) => (alert.type === type))
  }

  onChangeAlert = (value) => {
    const index = this.state.alerts.findIndex(({ id }) => {
      return id === value.id
    })
    const alerts = [...this.state.alerts]
    alerts[index] = value
    this.setState({
      alerts
    })
  }

  onClickAddAlert = alertType => {
    /** alertType 1 -> High/Low, 2 -> Unusual Vol, 3 -> VWAP */
    const initProgress = 20 // 20 or 

    const currentAlert = {
      category: '',
      rate: initProgress
    }
    this.setState({ alertType, currentAlert });
  };

  priceRangeFormatFrom = value => {
    if (value === 'MIN') {
      return 0;
    } else if (value === 'MAX') {
      return PRICE_MAX;
    } else {
      return value;
    }
  }

  priceRangeFormatTo = value => {
    if (value === 0) {
      return 'MIN'
    } else if (value === PRICE_MAX) {
      return 'MAX';
    } else {
      return parseInt(value);
    }
  }

  volRangeFormatFrom = value => {
    if (value === 'MIN') {
      return AVG_VOL_MIN;
    } else if (value === 'MAX') {
      return AVG_VOL_MAX;
    } else {
      return value.replace('K', '');
    }
  }

  volRangeFormatTo = value => {
    if (value === AVG_VOL_MIN) {
      return 'MIN'
    } else if (value === AVG_VOL_MAX) {
      return 'MAX';
    } else {
      return parseInt(value) + 'K';
    }
  }

  renderFilterIndustries = () => {
    const { filter } = this.state;
    const industries = Object.keys(SECTORS_FILTER)

    return industries.map((item, index) => {
      return (
        <div
          key={`industry-${index}`}
          className="d-flex flex-row align-items-center industry-row"
          onClick={() => { this.updateFilterIndustry(item); }}
        >
          {
            (filter && filter.industries && filter.industries[item]) ? <div className="industry-checked" /> : <div className="industry-unchecked" />
          }
          <span className="small white-no-wrap industry-txt">{item}</span>
        </div>
      )
    })
  }

  updateFilterIndustry = item => {
    const filter = { ...this.state.filter }
    if (!filter.industries) {
      filter.industries = {}
    }
    filter.industries[item] = !filter.industries[item]

    localStorage.setItem('filter', JSON.stringify(filter));
    console.info('filter updated:', filter)
    this.setState({ filter });
  }

  updateFilterPrice = value => {
    let filter = { ...this.state.filter };
    filter.price = { min: value[0], max: value[1] };
    console.info(filter);
    localStorage.setItem('filter', JSON.stringify(filter));
    this.setState({ filter });
  }

  updateFilterVol = value => {
    let filter = { ...this.state.filter };
    filter.volume = { min: parseInt(value[0]) * 1000, max: parseInt(value[1]) * 1000 };
    console.info(filter);
    localStorage.setItem('filter', JSON.stringify(filter));
    this.setState({ filter });
  }

  cancelEditAlert = ({ id }) => {
    const index = this.state.alerts.findIndex((alert) => (alert.id === id))
    const { prevAlert } = this.state
    if (index > -1 && prevAlert && prevAlert.id === id) { // restore prev alert
      const alerts = [...this.state.alerts]
      alerts[index] = prevAlert
      this.setState({
        prevAlert: null,
        alerts,
        editingAlertId: null
      })
    }
  }

  onEditAlert = (alert) => {
    if (this.state.editingAlertId === alert.id) {

    } else if (this.state.editingAlertId == null) {
      this.setState({
        prevAlert: { ...alert },
        editingAlertId: alert.id
      })
    } else { // editing alert is ignored
      // save ?
      // const prevAlert = this.state.alerts.find(({id}) => (this.state.editingAlertId === id))
      // if (prevAlert) {
      //   this.updateAlert(prevAlert)
      // }
      this.cancelEditAlert(this.state.prevAlert)
      this.setState({
        prevAlert: { ...alert },
        editingAlertId: alert.id
      })
    }
  }

  updateAlert = async (alert) => {
    console.info('updateAlert', alert);
    try {
      const result = await API.updateAlert(alert.id, {
        category: alert.category,
        rate: alert.rate
      })
      if (result && result.success) {
        cogoToast.success('Alert setting updated for ' + alert.category)
        this.setState({
          alerts: result.data.list,
          prevAlert: null,
          editingAlertId: null
        })
      } else {
        throw result
      }
    } catch (e) {
      cogoToast.error(`Failed to update the alert setting for ${alert.category}`)
    }
  }

  deleteAlert = async (alert) => {
    console.info('deleteAlert - ', alert)
    try {
      const result = await API.deleteAlert(alert.id)
      if (result && result.success) {
        this.setState({
          alerts: result.data // result.data is the remaining alert settings
        })
      } else {
        throw result
      }
    } catch (e) {
      cogoToast.error(`Failed to delete the alert setting for ${alert.category}`)
    }
  }

  registerAlert = async (type) => {
    const { currentAlert } = this.state
    const symbol = currentAlert.category.toUpperCase()
    const rate = currentAlert.rate

    console.info("registerAlert:", symbol, type, rate);
    const dic = {
      trade: 'Trade',
      uv: 'Unusual volume',
      vwap: 'vWapDist',
      price: 'Price'
    }
    try {
      const result = await API.addAlert({
        category: symbol,
        rate,
        high: 0,
        low: 10000,
        type
      })
      if (result && result.success) {
        cogoToast.success(`${dic[type]} alert added for ${symbol}`);
        this.setState({
          alerts: result.data.list,
          alertType: null
        })
      } else if (result && result.error) {
        throw result.error
      }
    } catch (e) {
      if (e === 'SequelizeUniqueConstraintError: Validation error') {
        cogoToast.error(`${dic[type]} alert for ${symbol} is already registered!`)
      } else {
        cogoToast.error(`Failed to register ${dic[type]} alert for ${symbol}`);
      }
    }
  }

  renderAlertInput = (type) => {
    return this.state.alertType === type &&
      <AlertInput value={this.state.currentAlert} editing={true}
        onChange={(value) => {
          this.setState({
            currentAlert: value
          })
        }}
        onDelete={() => {
          this.setState({
            alertType: null
          })
        }}
        onSubmit={() => {
          this.registerAlert(type)
        }}
      />
  }

  render() {
    const { filter } = this.state;

    return (
      <div className="settings-content">
        {/** General */}
        <div className="bb-title">
          <i className="mdi mdi-pulse"></i>
          <label className="ml-2 settings-label"> High/Low Stream</label>
        </div>
        <div className="value-item">
          <div className="mx-0 justify-content-between align-items-center item-content mt-1 padding-bottom-30">
            <div className="pricing-container">
              <span className="small company-name">PRICE</span>
              <div className="d-flex flex-row flex-fill price-section">
                <Slider
                  range={{ min: PRICE_MIN, max: PRICE_MAX }}
                  start={filter ? [filter.price.min, filter.price.max] : [PRICE_MIN, PRICE_MAX]}
                  connect
                  tooltips={true}
                  step={1}
                  format={{
                    from: this.priceRangeFormatFrom,
                    to: this.priceRangeFormatTo
                  }}
                  className="flex-fill slider-white slider-range"
                  onChange={(render, handle, value, un, percent) => { this.updateFilterPrice(value); }}
                />
              </div>
              <div className="pricing-separator" />
              <div className="small company-name-margin">AVG VOL</div>
              <div className="d-flex flex-row flex-fill price-section">
                <Slider
                  range={{ min: AVG_VOL_MIN, max: AVG_VOL_MAX }}
                  start={filter ? [Math.floor(filter.volume.min / 1000), Math.ceil(filter.volume.max / 1000)] : [AVG_VOL_MIN, AVG_VOL_MAX]}
                  connect
                  tooltips={true}
                  step={1}
                  format={{
                    from: this.volRangeFormatFrom,
                    to: this.volRangeFormatTo
                  }}
                  className="flex-fill slider-white slider-range"
                  onChange={(render, handle, value, un, percent) => { this.updateFilterVol(value); }}
                />
              </div>
              <div className="pricing-separator" />
            </div>
            <div className="industry-container">
              <div className="pricing-container">
                <div className="small company-name-margin">INDUSTRY</div>
              </div>
              <div className="d-flex flex-row flex-wrap margin-top-10">
                {this.renderFilterIndustries()}
              </div>
            </div>
          </div>
        </div>

        {/** Notifications */}
        <div className="mt-5 bb-title">
          <i className="mdi mdi-bell"></i>
          <label className="ml-2 settings-label">Notifications</label>
        </div>
        {
          alerts.map(({ type, valueLabel, label }, index) => {
            const disabled = !this.props.isPro && index > 0
            return <div key={type}>
              {!this.props.isPro && type === 'uv' &&
                <div className="upgrade_pro mt-4 row">
                  <div className="col-12">
                    <label>--- PRO ONLY ---</label>
                    <a className="btn btn-primary ml-1" href="/plans"> Upgrade Now</a>
                  </div>
                </div>
              }

              <div className={disabled ? "value-item-disabled" : "value-item"}>
                <label className={"small" + (disabled ? " text-muted" : "")}>{label}</label>
                <div className="d-flex flex-row justify-content-between align-items-center mx-0 symbol mt-1">
                  <label className="small text-symbol">Symbol</label>
                  <label className="small text-symbol">{valueLabel}</label>
                  <button
                    className={"btn bg-transparent border-0 px-0 small text-alert cursor-pointer" + (disabled ? " text-muted" : " text-alert")}
                    onClick={() => {
                      this.onClickAddAlert(type);
                    }}
                    disabled={disabled}
                  >
                    Add Alert
                  </button>
                </div>
                {!disabled &&
                  <>
                    {this.renderAlertInput(type)}
                    {
                      this.getAlertsByType(type).map((alert) => {
                        return <AlertInput key={alert.id} value={alert} editing={this.state.editingAlertId === alert.id} type={type}
                          onChange={(value) => {
                            this.onChangeAlert(value)
                          }}
                          onEdit={() => {
                            this.onEditAlert(alert)
                          }}
                          onDelete={() => {
                            if (this.state.editingAlertId === alert.id) {
                              this.cancelEditAlert(alert)
                            } else {
                              this.deleteAlert(alert)
                            }
                          }}
                          onSubmit={() => {
                            this.updateAlert(alert)
                          }}
                        />
                      })
                    }
                  </>
                }

              </div>
            </div>
          })
        }
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading,
  user: state.auth.user,
  isPro: state.auth.user.subscription.plan === 'pro_monthly' || state.auth.user.subscription.plan === 'pro_semi_annual'
});

const mapDispatchToProps = {
  setAuthenticated: AuthActions.setAuthenticated,
  setLoading: AuthActions.setLoading,
  setUser: AuthActions.setUser,
};

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings))
);
