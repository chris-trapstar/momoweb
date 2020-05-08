import React, { Component } from 'react';
import { ProgressBar, Alert } from 'react-bootstrap';
import API from '../api';
import './settings.css';
import Slider from 'nouislider-react';
import cogoToast from 'cogo-toast';

import AlertInput from './alertInput';

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      isSmallDevice: window.matchMedia("(max-width: 768px)").matches,
      currentAlert: { category: '', rate: '' },
      filter: null
    };
  }

  componentDidMount() {
    const handler = e => this.setState({ isSmallDevice: e.matches });
    window.matchMedia("(max-width: 767px)").addListener(handler);
    this.getAlertSettings();

    let filter = {
      category: [
        {
          name: "Basic industries",
          value: "basic-industries",
          subscribed: true
        },
        { name: "Capital goods", value: "capital-goods", subscribed: true },
        { name: "Consumer goods", value: "consumer-goods", subscribed: true },
        {
          name: "Consumer services",
          value: "consumer-services",
          subscribed: true
        },
        { name: "Energy", value: "energy", subscribed: true },
        { name: "Finance", value: "finance", subscribed: true },
        { name: "Health Care", value: "health-care", subscribed: true },
        {
          name: "Public utilities",
          value: "public-utilities",
          subscribed: true
        },
        { name: "Technology", value: "technology", subscribed: true },
        { name: "Transportation", value: "transportation", subscribed: true },
        { name: "Miscellaneous", value: "miscellaneous", subscribed: true },
        { name: "OTC", value: "otc", subscribed: false }
      ],
      price: { min: 0, max: 2000 },
      volume: { min: 0, max: 200000000 }
    }

    let data_filter = localStorage.getItem("filter");
    if (data_filter) {
      try {
        let cached_filter = JSON.parse(data_filter);

        filter.category.forEach((item, i, arr) => {
          let cached_item = cached_filter.category.find(
            a => a.value === item.value
          );
          console.log("CACHED", cached_item);
          if (cached_item && item.subscribed !== cached_item.subscribed) {
            arr[i].subscribed = cached_item.subscribed;
          }
        });

        filter["price"] = cached_filter.price;
        filter["volume"] = cached_filter.volume || filter.volume;
        localStorage.setItem("filter", JSON.stringify(filter));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("filter", JSON.stringify(filter));
    }

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

  }

  onEndSliding = async (value, data, type) => {
    console.info('onEndSliding', value, data, type)
    try {
      await API.updateAlert(data.id, {
        rate: value
      })
      cogoToast.success('Alert sensitivity updated for ' + data.category)
      this.getAlertSettings() // Load Alert Settings Again
      this.setState({
        editingAlert: {
          id: this.state.editingAlert.id,
          type: this.state.editingAlert.type,
          index: this.state.editingAlert.index,
          category: this.state.editingAlert.category,
          rate: value,
        }
      })
    } catch (e) {
      cogoToast.error('Failed to update sensitivy')
    }
  }

  resetEditAlert = () => {
    this.setState({ editingAlert: { id: 0, type: -1, index: -1, category: '', rate: '' } });
  }

  startEditAlert = (id, type, index, category, rate) => {
    this.setState({ editingAlert: { id, type, index, category, rate } });
  }

  endEditAlert = async () => {
    const { editingAlert } = this.state;
    console.info('edit value', editingAlert);
    try {
      await API.updateAlert(editingAlert.id, {
        category: editingAlert.category,
        rate: editingAlert.rate
      })
      cogoToast.success('Alert sensitivity updated for ' + editingAlert.category)
      this.getAlertSettings() // Load Alert Settings Again
    } catch (e) {
      cogoToast.error('Failed to update sensitivy')
    }
    this.resetEditAlert();
  }

  onEditAlertCategory = (e) => {
    this.setState({
      editingAlert: {
        ...this.state.editingAlert,
        category: e.target.value
      }
    });
  }

  onEditAlertRate = (e) => {
    this.setState({
      editingAlert: {
        ...this.state.editingAlert,
        rate: e.target.value
      }
    });
  }

  renderAlertSettings = (data, type) => {
    /** type 0 -> High/Low, 1 -> Unusual Vol, 2 -> VWAP */

    const { editingAlert } = this.state;
    let renderData = [];
    data.map(({ category, rate }, index) => {
      renderData.push(
        <div
          className="row mx-0 justify-content-between align-items-center item-content mt-1 pl-2"
          key={`render-notification-high-low-${index}`}
          onClick={() => {
            if (editingAlert.type !== type || editingAlert.index !== index) {
              this.startEditAlert(data[index].id, type, index, category, rate);
            }
          }}
        >
          {
            editingAlert.type === type && editingAlert.index === index ?
              <input
                className="small company-name edit-alert-input"
                value={editingAlert.category}
                onChange={this.onEditAlertCategory}
                autoFocus
              /> :
              <span className="small company-name">{category}</span>

          }
          <div className="d-flex flex-row flex-fill justify-content-center align-items-center progress-section">
            <Slider
              range={{ min: 0, max: 1000 }}
              start={editingAlert.type === type && editingAlert.index === index ? editingAlert.rate : rate}
              connect={[false, true]}
              className="flex-fill slider-white"
              onChange={(value) => { this.onEndSliding(value, data[index], type); }}
            />
            {
              editingAlert.type === type && editingAlert.index === index ?
                <input
                  className="ml-3 progress-input justify-content-center align-items-center text-center white-color small edit-rate-input"
                  onChange={this.onEditAlertRate}
                  value={editingAlert.rate}
                />
                :
                <div className="ml-3 bg-dark progress-value justify-content-center align-items-center text-center">
                  {`${rate}${type !== 0 ? "%" : ""}`}
                </div>
            }
          </div>
          <div className="row">
            {
              editingAlert.type === type && editingAlert.index === index ?
                <button
                  className="bg-transparent border-0"
                  type="button"
                  onClick={() => {
                    if (editingAlert.category === '' || editingAlert.rate === '' || isNaN(editingAlert.rate)) {
                      return;
                    }
                    this.endEditAlert();
                  }}
                >
                  <i className="mdi mdi-check text-white popover-icon" />
                </button>
                :
                <button className="bg-transparent border-0 invisible">
                  <i className="mdi mdi-close text-white popover-icon" />
                </button>
            }
            <button
              className="bg-transparent border-0"
              onClick={() => {
                this.deleteAlertSetting(type, index, category, rate);
              }}
            >
              <i className="mdi mdi-close text-white popover-icon" />
            </button>
          </div>
        </div>
      );
    });
    return renderData;
  };

  deleteAlertSetting = async (type, index, category, rate) => {
    try {
      switch (type) {
        case 0: // Normal High Low Alert
          const hLow = this.state.hLow;
          const alert = hLow[index]
          await API.deleteAlert(alert.id)
          hLow.splice(index, 1);
          this.setState({ hLow });
          cogoToast.success(`Alert removed for ${alert.category}`)
          this.getAlertSettings()
          break;
        case 1:
          let uVol = this.state.uVol;
          uVol.splice(index, 1);
          this.setState({ uVol });
          break;
        case 2:
          let vWap = this.state.vWap;
          vWap.splice(index, 1);
          this.setState({ vWap });
          break;
        default:
          break;
      }
    } catch (e) {
      cogoToast.error('Something went wrong!')
    }
  };

  onClickAddAlert = alertType => {
    /** alertType 1 -> High/Low, 2 -> Unusual Vol, 3 -> VWAP */
    let initProgress = 20
    if (alertType === 1) {
      initProgress = 200
    }
    this.setState({ alertType, alertRate: initProgress });
  };

  onAddAlert = async () => {
    if (this.refLowName.value !== "" && this.state.alertRate !== "") {
      await API.addAlert({
        category: this.refLowName.value.toString(),
        rate: parseFloat(this.state.alertRate),
        high: 0,
        low: 0
      });

      const hLow = [
        {
          category: this.refLowName.value.toString(),
          rate: parseFloat(this.state.alertRate)
        },
        ...this.state.hLow
      ];

      this.setState({ alertType: 0, hLow, alertRate: 0 });

      // Load Alert Settings Again
      this.getAlertSettings();
    }
  };

  priceRangeFormatFrom = value => {
    if (value === 'MIN') {
      return 0;
    } else if (value === 'MAX') {
      return 500;
    } else {
      return value;
    }
  }

  priceRangeFormatTo = value => {
    if (value === 0) {
      return 'MIN'
    } else if (value === 500) {
      return 'MAX';
    } else {
      return parseInt(value);
    }
  }

  volRangeFormatFrom = value => {
    if (value === 'MIN') {
      return 0;
    } else if (value === 'MAX') {
      return 200;
    } else {
      return value.replace('M', '');
    }
  }

  volRangeFormatTo = value => {
    if (value === 0) {
      return 'MIN'
    } else if (value === 200) {
      return 'MAX';
    } else {
      return value + 'M';
    }
  }

  renderFilterIndustries = () => {
    const { filter } = this.state;
    let renderBtns = [];
    if (filter) {
      filter.category.map((item, index) => {
        renderBtns.push(
          <div
            key={`industry-${index}`}
            className="d-flex flex-row align-items-center industry-row"
            onClick={() => { this.updateFilterIndustry(item); }}
          >
            {
              item.subscribed ? <div className="industry-checked" /> : <div className="industry-unchecked" />
            }
            <span className="small white-no-wrap industry-txt">{item.name.toUpperCase()}</span>
          </div>
        )
      });
    }
    return renderBtns;
  }

  updateFilterIndustry = item => {
    let { filter } = this.state;
    if (item.value === 'otc') {
      filter.category.map((f, index) => {
        if (f.value === 'otc') {
          f.subscribed = !item.subscribed;
        } else {
          f.subscribed = item.subscribed;
        }
      });
    } else {
      filter.category.map((f, index) => {
        if (f.value === item.value) {
          f.subscribed = !item.subscribed;
        }
      })
    }
    console.info(filter);
    localStorage.setItem('filter', JSON.stringify(filter));
    this.setState({ filter });
  }

  updateFilterPrice = value => {
    let { filter } = this.state;
    filter.price = { min: value[0], max: value[1] };
    console.info(filter);
    localStorage.setItem('filter', JSON.stringify(filter));
    this.setState({ filter });
  }

  updateFilterVol = value => {
    let { filter } = this.state;
    filter.volume = { min: parseInt(value[0]) * 1000000, max: parseInt(value[1]) * 1000000 };
    console.info(filter);
    localStorage.setItem('filter', JSON.stringify(filter));
    this.setState({ filter });
  }

  render() {
    const { hLow, uVol, vWap, alertType, alertRate, filter } = this.state;

    return (
      <div className="settings-content">
        {/** General */}
        <div>
          <label>General</label>
        </div>
        <div className="value-item">
          <div className="mx-0 justify-content-between align-items-center item-content mt-1 padding-bottom-30">
            <div className="pricing-container">
              <span className="small company-name">PRICE</span>
              <div className="d-flex flex-row flex-fill price-section">
                <Slider
                  range={{ min: 0, max: 500 }}
                  start={filter ? [filter.price.min, filter.price.max] : [0, 500]}
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
                  range={{ min: 0, max: 200 }}
                  start={filter ? [parseInt(filter.volume.min / 1000000), parseInt(filter.volume.max / 1000000)] : [0, 200]}
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
        <div className="mt-5">
          <label>Notifications</label>
        </div>

        {/** Notifications -> High/Low */}
        <div>
          <div className="value-item">
            <label className="small">High/Low</label>
            <div className="d-flex flex-row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">Sensitivity</label>
              <button
                className="btn bg-transparent border-0 px-0 small text-alert cursor-pointer"
                onClick={() => {
                  this.onClickAddAlert('trade');
                }}
              >
                Add Alert
              </button>
            </div>
            {<AlertInput value={this.state.currentAlert} editing={true} onChange={(value) => {
              this.setState({
                currentAlert: value
              })
            }} />}
            {this.getAlertsByType('trade').map((alert) => {
              return <AlertInput key={alert.id} value={alert} editing={false} onChange={(value) => {
                this.onChangeAlert(value)
              }} />
            })}
          </div>
        </div>

        {/** Notifications -> VWAP */}
        <div>
          <div className="value-item">
            <label className="small">VWAP</label>
            <div className="d-flex flex-row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">Sensitivity</label>
              <button
                className="btn bg-transparent border-0 px-0 small text-alert cursor-pointer"
                onClick={() => {
                  this.onClickAddAlert('vwap');
                }}
              >
                Add Alert
              </button>
            </div>
            {<AlertInput value={this.state.currentAlert} editing={true} onChange={(value) => {
              this.setState({
                currentAlert: value
              })
            }} />}
            {this.getAlertsByType('vwap').map((alert) => {
              return <AlertInput key={alert.id} value={alert} editing={false} onChange={(value) => {
                this.onChangeAlert(value)
              }} />
            })}
          </div>
        </div>

        {/** Notifications -> VWAP */}
        <div>
          <div className="value-item">
            <label className="small">Unusual Volume</label>
            <div className="d-flex flex-row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">Sensitivity</label>
              <button
                className="btn bg-transparent border-0 px-0 small text-alert cursor-pointer"
                onClick={() => {
                  this.onClickAddAlert('uv');
                }}
              >
                Add Alert
              </button>
            </div>
            {<AlertInput value={this.state.currentAlert} editing={true} onChange={(value) => {
              this.setState({
                currentAlert: value
              })
            }} />}
            {this.getAlertsByType('uv').map((alert) => {
              return <AlertInput key={alert.id} value={alert} editing={false} onChange={(value) => {
                this.onChangeAlert(value)
              }} />
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
