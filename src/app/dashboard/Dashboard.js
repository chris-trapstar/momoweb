import React, { Component } from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import io from "socket.io-client";
import "./dashboard.css";
// import * as firebase from "firebase/app";

const socketHost = "http://web-backend-docker.us-east-1.elasticbeanstalk.com";
const filter = {
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
};

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    this.listenTrade();
    this._updateStatusBar();
    this.buffer = [];
    this.flushBufferIntervalId = setInterval(this.flushBuffer, 2000);
    // this.requestNotificationPermissions().then(r => {});
  }

  componentWillUnmount() {
    if (this.flushBufferIntervalId) {
      console.log("clearInterval for flushBufferIntervalId");
      clearInterval(this.flushBufferIntervalId);
    }
  }

  getInitialState = () => {
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

    return {
      highs: [],
      lows: [],
      bars: [1, 0.6, -1],
      filter: filter,
      popoverOpened: false
    };
  };

  listenTrade = () => {
    let data_filter = localStorage.getItem("filter");
    if (!data_filter || !data_filter.category) {
      data_filter = filter;
    }

    this.socket = io(socketHost, {
      transports: ["polling"]
    });

    this.socket.on("compressedUpdate", this._handleData);
    this.subscribeChannels(data_filter.category);
  };

  _handleData = data => {
    let msg = data[0];
    let highs = msg[1];
    let lows = msg[2];

    if ("DISABLED" in window) {
      return false;
    }

    try {
      this._updateStatusBar([
        msg[0][1], // dow
        msg[0][0], // nasdaq
        msg[0][2] // spy
      ]);
    } catch (e) {
      console.error(e);
    }

    lows = this.applyPriceFilter(lows);
    highs = this.applyPriceFilter(highs);

    if (lows.length + highs.length > 0) {
      if (this.buffer.length > 200) {
        this.buffer = [];
        console.error("Buffer too big, truncating");
      }
      this.buffer.push({ highs: highs, lows: lows });
    }
  };

  subscribeChannels = channels => {
    channels.forEach(c => {
      if (c.subscribed === true) this.socket.emit("subscribe", c.value);
      else this.socket.emit("unsubscribe", c.value);
    });
  };

  _updateStatusBar = bars => {
    bars = bars
      ? bars
      : [
          this.getRandomArbitrary(-1, 1),
          this.getRandomArbitrary(-1, 1),
          this.getRandomArbitrary(-1, 1)
        ];
    this.setState({
      bars: bars
    });
  };

  getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  applyPriceFilter = data => {
    let self = this;

    return data
      .filter((item, i) => {
        let price = item[1];
        let priceFilter = self.state.filter.price;
        priceFilter.min = priceFilter.min || 0;
        priceFilter.max = priceFilter.max || 2000;
        return price >= priceFilter.min && price <= priceFilter.max;
      })
      .filter((item, i) => {
        let volume = item[5];
        console.log("AVG VOLUME", volume, item[0]);
        let volumeFilter = self.state.filter.volume;
        volumeFilter.min = volumeFilter.min || 0;
        volumeFilter.max = volumeFilter.max || 200000000;
        return volume >= volumeFilter.min && volume <= volumeFilter.max;
      });
  };

  flushBuffer = () => {
    if (this.state.freezed) {
      console.log("Flush buffer freezed");
      return false;
    }
    if (!this.buffer.length) {
      return false;
    }
    console.log("flush buffer");
    let highs = this.state.highs.slice();
    let lows = this.state.lows.slice();
    this.buffer.forEach(function(item, i, arr) {
      highs = item.highs.concat(highs).slice(0, 100);
      lows = item.lows.concat(lows).slice(0, 100);
    });
    this.buffer = [];
    this.setState({
      lows: lows,
      highs: highs
    });
  };

  round = (value, decimals) => {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  };

  getLast = (OTC, ticker) => {
    return OTC === 1 ? this.round(ticker, 4) : this.round(ticker, 2);
  };

  getData = (data, type) => {
    let renderData = [];
    let renderMenuItems = [];
    if (type === "low") {
      data.map((low, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push(
          <ContextMenuTrigger
            renderTag="tr"
            id={`low-context-menu_${index}`}
            key={`low_${index}`}
          >
            <td className="text-danger">{low[0]}</td>
            <td className="text-danger">{low[2]}</td>
            <td className="text-danger">{this.getLast(low[6], low[1])}</td>
          </ContextMenuTrigger>
        );

        /** Add Popover For this item */
        renderMenuItems.push(
          this.getMenuItems(`low-context-menu_${index}`, low, "low")
        );
      });
    } else {
      data.map((high, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push(
          <ContextMenuTrigger
            renderTag="tr"
            id={`high-context-menu_${index}`}
            key={`high_${index}`}
          >
            <td className="text-success">{high[0]}</td>
            <td className="text-success">{high[2]}</td>
            <td className="text-success">{this.getLast(high[6], high[1])}</td>
          </ContextMenuTrigger>
        );

        /** Add Popover For this item */
        renderMenuItems.push(
          this.getMenuItems(`high-context-menu_${index}`, high, "high")
        );
      });
    }
    return (
      <div className="col-md-6 tableFixHead">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="text-white"> SYMBOL </th>
              <th className="text-white"> COUNT </th>
              <th className="text-white"> LAST </th>
            </tr>
          </thead>
          <tbody>{renderData}</tbody>
        </table>
        {renderMenuItems}
      </div>
    );
  };

  getMenuItems = (key, data, type) => {
    return (
      <ContextMenu id={key} className="p-0" key={`menu-item-${key}`}>
        <div className="bg-dark px-3 py-1">
          <span>LINKS</span>
          <MenuItem data={{ data, type }} onClick={this.onPopover}>
            <div className="row align-items-center">
              <i className="mdi mdi-alpha text-white popover-icon" />
              <span className="small white-no-wrap bar-txt">cnbc.com</span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type }} onClick={this.onPopover}>
            <div className="row align-items-center">
              <i className="mdi mdi-alpha text-white popover-icon" />
              <span className="small white-no-wrap bar-txt">
                marketwatch.com
              </span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type }} onClick={this.onPopover}>
            <div className="row align-items-center">
              <i className="mdi mdi-alpha text-white popover-icon" />
              <span className="small white-no-wrap bar-txt">
                seekingalpha.com
              </span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type }} onClick={this.onPopover}>
            <div className="row align-items-center">
              <i className="mdi mdi-chart-line-variant text-white popover-icon" />
              <span className="small white-no-wrap bar-txt">nasdaq.com</span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type }} onClick={this.onPopover}>
            <div className="row align-items-center">
              <i className="mdi mdi-chart-line-variant text-white popover-icon" />
              <span className="small white-no-wrap bar-txt">
                stocktwits.com
              </span>
            </div>
          </MenuItem>
          <span>ACTIONS</span>
          <div className="row justify-content-between align-items-center">
            <MenuItem data={{ data, type }} onClick={this.onAddAlert}>
              <div className="row justify-content-center align-items-center">
                <i className="mdi mdi-bell text-white popover-icon" />
                <span className="ml-1">Alert</span>
              </div>
            </MenuItem>
            <MenuItem data={{ data, type }} onClick={this.onPopover}>
              <div className="row justify-content-center align-items-center">
                <i className="mdi mdi-star text-white popover-icon" />
                <span className="ml-1">Favorite</span>
              </div>
            </MenuItem>
          </div>
        </div>
      </ContextMenu>
    );
  };

  onPopover = (e, data) => {
    // data.data[0];
  };

  onAddAlert = (e, data) => {
    console.info("onAddAlert:", data);
  };

  // requestNotificationPermissions = async () => {
  //   const registration_id = await firebase.messaging().getToken();
  //   if (registration_id) {
  //     this.registerPushToken(registration_id);
  //   } else {
  //     alert(
  //       "Please allow push notification permissions in the browser settings!"
  //     );
  //   }
  // };
  //
  // registerPushToken = async registration_id => {
  //   try {
  //     const res = await fetch(`${baseUrl}/api/alert/device/fcm`, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         registration_id
  //       }),
  //       headers: {
  //         Authorization: `Bearer ${window.localStorage.getItem(
  //           "jwt_access_token"
  //         )}`,
  //         "Content-Type": "application/json"
  //       }
  //     });
  //     const data = await res.json();
  //     console.info("Push Token Registered:", data);
  //   } catch (e) {
  //     console.error("Failed to register the push token", e);
  //   }
  // };

  render() {
    const { lows, highs } = this.state;
    return (
      <div>
        <div className="row px-3">
          <div className="col-12 grid-margin stretch-card px-0">
            <div className="card-body py-0 px-0 px-sm-0">
              {/** Static Bar */}
              <div className="row static-bar">
                <div className="row align-items-center ml-3">
                  <span className="bar-icon">
                    <i className="mdi mdi-speedometer text-primary" />
                  </span>
                  <span className="small white-no-wrap bar-txt">STREAM</span>
                </div>
                <div className="row align-items-center ml-5">
                  <span className="bar-icon">
                    <i className="mdi mdi-file-restore text-success" />
                  </span>
                  <span className="small white-no-wrap bar-txt">
                    ALERT HISTORY
                  </span>
                </div>
                <div className="row align-items-center ml-5">
                  <span className="bar-icon">
                    <i className="mdi mdi-crosshairs-gps text-warning" />
                  </span>
                  <span className="small white-no-wrap bar-txt">BREADTH</span>
                </div>
                <div className="row align-items-center ml-5">
                  <span className="bar-icon">
                    <i className="mdi mdi-clipboard-text text-danger" />
                  </span>
                  <span className="small white-no-wrap bar-txt">POPULAR</span>
                </div>
                <div className="row align-items-center ml-5">
                  <span className="bar-icon">
                    <i className="mdi mdi-chart-bar text-primary" />
                  </span>
                  <span className="small white-no-wrap bar-txt">QUOTE</span>
                </div>
                <div className="row align-items-center ml-5">
                  <span className="bar-icon">
                    <i className="mdi mdi-content-copy text-success" />
                  </span>
                  <span className="small white-no-wrap bar-txt">DISCOVERY</span>
                </div>
              </div>

              {/** Popular Stocks */}
              <div className="container-fluid px-0 data-section-large">
                <div className="row flex-row flex-nowrap overflow-scroll">
                  <div className="col-xl-3 col-md-4 col-sm-6 pl-0">
                    <div className="card p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/** Table | (Popular vs Alert History) */}
              <div className="row data-section-large">
                <div className="col-md-8 grid-margin stretch-card px-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        {this.getData(lows, "low")}
                        {this.getData(highs, "high")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 grid-margin stretch-card column-flex pr-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Popular</h4>
                        <p className="text-muted mb-1" />
                      </div>
                      <div className="row data-section popular">
                        <div className="col-12">
                          <h3>AMZN GOOG NS GE</h3>
                          <h4>TXN NVCN TVIX JNJ</h4>
                          <h5>STX SOX UVXY SLT TLT</h5>
                          <h6>MA V TTX ABA</h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card data-section">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Alert History</h4>
                        <p className="text-muted mb-1" />
                      </div>
                      <div className="row data-section popular" />
                    </div>
                  </div>
                </div>
              </div>

              {/** Discovery */}
              <div className="row data-section">
                <div className="col-12 px-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between text-center">
                        <h4 className="card-title mb-1 py-1">Discovery</h4>
                        <div className="row">
                          <span className="border border-radius-10">
                            <div className="button btn-dark px-4 py-1 border-radius-10">
                              Industry
                            </div>
                          </span>
                          <span className="border border-radius-10 ml-4">
                            <div className="button btn-dark px-4 py-1 border-radius-10">
                              Favorites
                            </div>
                          </span>
                        </div>
                        <div />
                        <div />
                        <input
                          className="input p-0 text-center bg-dark white-color input-border"
                          placeholder="symbol search"
                        />
                      </div>

                      <table className="table table-striped data-section">
                        <thead>
                          <tr>
                            <th className="text-center"> SYMBOL </th>
                            <th className="text-center"> LAST </th>
                            <th className="text-center"> VOLUME </th>
                            <th className="text-center"> Momentum </th>
                            <th className="text-center"> Unusual Vol </th>
                            <th className="text-center"> VWAP DIST %</th>
                            <th className="text-center"> Short %</th>
                            <th className="text-center"> Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              AAPL
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              TXN
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              GOOG
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
