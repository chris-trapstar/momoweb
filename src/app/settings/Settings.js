import React, { Component } from "react";
import { ProgressBar } from "react-bootstrap";
import "./settings.css";

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState = () => {
    return {
      hLow: [
        ["AAPL", 100],
        ["SPCE", 80]
      ],
      uVol: [
        ["SPY", 25],
        ["UBER", 20]
      ],
      vWap: [
        ["AAPL", 25],
        ["AMZN", 20]
      ],
      addingAlert: 0
    };
  };

  getFixedData = (data, type) => {
    let renderData = [];
    data.map((item, index) => {
      renderData.push(
        <div
          className="row mx-0 justify-content-between align-items-center item-content mt-1"
          key={`render-notification-high-low-${index}`}
        >
          <span className="small company-name">{item[0]}</span>
          <div className="row justify-content-center align-items-center">
            <ProgressBar className="progress" variant="white" now={item[1]} />
            <div className="ml-3 bg-dark progress-value justify-content-center align-items-center text-center">
              {`${item[1]}${type !== 0 ? "%" : ""}`}
            </div>
          </div>
          <div className="row">
            <button
              className="bg-transparent border-0 invisible"
              disabled={true}
            >
              <i className="mdi mdi-close text-white popover-icon" />
            </button>
            <button
              className="bg-transparent border-0"
              onClick={() => {
                this.deleteFixedData(type, index);
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

  deleteFixedData = (type, index) => {
    switch (type) {
      case 0:
        let lows = this.state.hLow;
        lows.splice(index, 1);
        console.info(lows);
        this.setState({ hLow: lows });
        break;
      case 1:
        let vols = this.state.uVol;
        vols.splice(index, 1);
        this.setState({ uVol: vols });
        break;
      case 2:
        let waps = this.state.vWap;
        waps.splice(index, 1);
        this.setState({ vWap: waps });
        break;
      default:
        break;
    }
  };

  onHLowAddAlert = () => {
    this.setState({ addingAlert: 1 });
  };
  onVolAddAlert = () => {
    this.setState({ addingAlert: 2 });
  };
  onWapAddAlert = () => {
    this.setState({ addingAlert: 3 });
  };

  render() {
    const { hLow, uVol, vWap, addingAlert } = this.state;
    return (
      <div>
        {/** General */}
        <div>
          <label>General</label>
        </div>
        <div className="ml-3 mt-3">
          <label>High/Low</label>
        </div>
        <div className="ml-5 mt-3">
          <h6 className="small">Price Range</h6>
          <label className="mt-5 small">Volume</label>
          <div>
            <label className="mt-5 small">Industry</label>
          </div>
        </div>

        {/** Notifications */}
        <div className="mt-5">
          <label>Notifications</label>
        </div>
        <div>
          {/** Notifications -> High/Low */}
          <div className="value-item">
            <label className="small">High/Low</label>
            <div className="row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">Sensitivity</label>
              <button
                className="bg-transparent border-0 px-0"
                onClick={this.onHLowAddAlert}
              >
                <label className="small text-alert">Add Alert</label>
              </button>
            </div>
            {this.getFixedData(hLow, 0)}
            {addingAlert === 1 && (
              <div className="row mx-0 justify-content-between align-items-center item-content mt-1">
                <input
                  className="bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                  ref={ref => {
                    this.refLowName = ref;
                  }}
                />
                <div className="row justify-content-center align-items-center">
                  <ProgressBar className="progress" variant="white" now={50} />
                  <input
                    className="ml-3 bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                    ref={ref => {
                      this.refLowVal = ref;
                    }}
                  />
                </div>
                <div className="row">
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      if (
                        this.refLowName.value !== "" &&
                        this.refLowVal.value !== ""
                      ) {
                        let lows = hLow;
                        lows.push([
                          this.refLowName.value.toString(),
                          parseInt(this.refLowVal.value)
                        ]);
                        this.setState({ addingAlert: 0, hLow: lows });
                      }
                    }}
                  >
                    <i className="mdi mdi-check text-white popover-icon" />
                  </button>
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      this.setState({ addingAlert: 0 });
                    }}
                  >
                    <i className="mdi mdi-close text-white popover-icon" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2">
            <label className="small text-pink">
              Grayed out for standard --- PRO ONLY BELOW --- Add opacity & have
              upgrade link to PLANS
            </label>
          </div>

          {/** Notifications -> Unusual Vol */}
          <div className="value-item">
            <label className="small">Unusual Vol</label>
            <div className="row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">% Deviation</label>
              <button
                className="bg-transparent border-0 px-0"
                onClick={this.onVolAddAlert}
              >
                <label className="small text-alert">Add Alert</label>
              </button>
            </div>
            {this.getFixedData(uVol, 1)}
            {addingAlert === 2 && (
              <div className="row mx-0 justify-content-between align-items-center item-content mt-1">
                <input
                  className="bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                  ref={ref => {
                    this.refVolName = ref;
                  }}
                />
                <div className="row justify-content-center align-items-center">
                  <ProgressBar className="progress" variant="white" now={50} />
                  <input
                    className="ml-3 bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                    ref={ref => {
                      this.refVolVal = ref;
                    }}
                  />
                </div>
                <div className="row">
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      if (
                        this.refVolName.value !== "" &&
                        this.refVolVal.value !== ""
                      ) {
                        let vols = uVol;
                        vols.push([
                          this.refVolName.value.toString(),
                          parseInt(this.refVolVal.value)
                        ]);
                        this.setState({ addingAlert: 0, uVol: vols });
                      }
                    }}
                  >
                    <i className="mdi mdi-check text-white popover-icon" />
                  </button>
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      this.setState({ addingAlert: 0 });
                    }}
                  >
                    <i className="mdi mdi-close text-white popover-icon" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/** Notifications -> VWAP */}
          <div className="value-item">
            <label className="small">VWAP</label>
            <div className="row justify-content-between align-items-center mx-0 symbol mt-1">
              <label className="small text-symbol">Symbol</label>
              <label className="small text-symbol">% Dist VWAP</label>
              <button
                className="bg-transparent border-0 px-0"
                onClick={this.onWapAddAlert}
              >
                <label className="small text-alert">Add Alert</label>
              </button>
            </div>
            {this.getFixedData(vWap, 2)}
            {addingAlert === 3 && (
              <div className="row mx-0 justify-content-between align-items-center item-content mt-1">
                <input
                  className="bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                  ref={ref => {
                    this.refWapName = ref;
                  }}
                />
                <div className="row justify-content-center align-items-center">
                  <ProgressBar className="progress" variant="white" now={2} />
                  <input
                    className="ml-3 bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
                    ref={ref => {
                      this.refWapVal = ref;
                    }}
                  />
                </div>
                <div className="row">
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      if (
                        this.refWapName.value !== "" &&
                        this.refWapVal.value !== ""
                      ) {
                        let waps = vWap;
                        waps.push([
                          this.refWapName.value.toString(),
                          parseInt(this.refWapVal.value)
                        ]);
                        this.setState({ addingAlert: 0, vWap: waps });
                      }
                    }}
                  >
                    <i className="mdi mdi-check text-white popover-icon" />
                  </button>
                  <button
                    className="bg-transparent border-0"
                    onClick={() => {
                      this.setState({ addingAlert: 0 });
                    }}
                  >
                    <i className="mdi mdi-close text-white popover-icon" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
