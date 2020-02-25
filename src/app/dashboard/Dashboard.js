import React, { Component } from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import ReactDOM from 'react-dom';
import io from "socket.io-client";
import "./dashboard.css";
import API from '../api';
import cogoToast from 'cogo-toast';

// import * as firebase from "firebase/app";

const socketHost = "https://momoweb.mometic.com";
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
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
    const handler = e => this.setState({ isSmallDevice: e.matches });
    window.matchMedia("(max-width: 767px)").addListener(handler);
    this.listenTrade();
    this._updateStatusBar();
    this.buffer = [];
    this.flushBufferIntervalId = setInterval(this.flushBuffer, 2000);
    // this.requestNotificationPermissions().then(r => {});
    this.getStats();
  }

  updateDimensions = () => {
    let restSpace = 300;
    const width = this.container.offsetWidth;
    if (width < 415) {
      restSpace = 30;
    } else if (width < 900) {
      restSpace = 150;
    }
    const total = Math.ceil((this.container.offsetWidth - restSpace - 160) / 20);
    this.setState({ total });
  }

  componentWillUnmount() {
    if (this.flushBufferIntervalId) {
      console.log("clearInterval for flushBufferIntervalId");
      clearInterval(this.flushBufferIntervalId);
    }
  }

  getStats = async () => {
    const stats = await API.getStats()
    console.info('Stats Data:', stats)
    this.setState({
      stats
    })
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
      stats: [],
      popoverOpened: false,
      stockCards: [
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        {}
      ],
      isSmallDevice: window.matchMedia("(max-width: 768px)").matches,
      total: 0
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
    console.info('compressedUpdate:', data)
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
    this.buffer.forEach(function (item, i, arr) {
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
    const { isSmallDevice } = this.state;
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
            className="d-flex flex-row"
          >
            <td className="text-danger flex-fill">
              <div className="stock-text">
                {low[0]}
              </div>
            </td>
            <td className="text-danger flex-fill">
              <div className="stock-text">
                {low[2]}
              </div>
            </td>
            <td className="text-danger flex-fill">
              <div className="stock-text">
                {this.getLast(low[6], low[1])}
              </div>
            </td>
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
            className="d-flex flex-row"
          >
            <td className="text-success flex-fill">
              <div className="stock-text">
                {high[0]}
              </div>
            </td>
            <td className="text-success flex-fill">
              <div className="stock-text">
                {high[2]}
              </div>
            </td>
            <td className="text-success flex-fill">
              <div className="stock-text">
                {this.getLast(high[6], high[1])}
              </div>
            </td>
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
          {
            !isSmallDevice &&
            <thead>
              <tr>
                <th className="text-white"> SYMBOL </th>
                <th className="text-white"> COUNT </th>
                <th className="text-white"> LAST </th>
              </tr>
            </thead>
          }
          <tbody>{renderData}</tbody>
        </table>
        {renderMenuItems}
      </div>
    );
  };

  getStockCards = () => {
    const { stockCards } = this.state;
    let renderCards = [];
    stockCards.map((item, index) => {
      const margin = index === 0 ? "" : "ml-3"
      renderCards.push(
        <div className={margin} key={'render-cards-' + index}>
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
              <div className="icon icon-box-success img-30 ml-5">
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
      )
    })
    return renderCards;
  }

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

  onAddAlert = (e, { data, type }) => {
    console.info("onAddAlert:", data);
    API.addAlert({
      category: data[0],
      rate: 0,
      high: type === 'high' ? data[1] : 0,
      low: type === 'low' ? data[1] : 0
    }).then(response => {
      cogoToast.success(
        <div>
          Added {data[0]}
        </div>
      );
    }).catch(error => { })
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

  onIndustry = () => {
    console.info(this.state.bars);
  }

  renderMeters = (type) => {
    const { bars, total } = this.state;
    const statClass = "statsbar " + type;
    let divs = [];
    for (let i = bars.length - 1; i >= 0; i--) {
      var carres = [];
      var value = bars[i] == -1 ? 0 : bars[i];

      if (type == 'lows') {
        if (value <= 0) {
          value = Math.abs(value);
        } else {
          value = 1 - value;
        }
      } else {
        if (value < 0) {
          value = value + 1;
        }
      }

      for (var o = total; o >= 0; o--) {
        var mult = type == 'lows' ? Math.ceil(total * value) : Math.floor(total * value)
        var active = mult >= o && value != 0;
        let carreClass = "petitCarre-";
        if (active) {
          carreClass = carreClass + "active"
          if (type == 'highs') {
            carreClass = carreClass + "-high"
          }
        } else {
          carreClass = carreClass + "inactive"
        }
        carres.push(
          <div className={carreClass} key={o}></div>
        )
      }

      if (type == 'highs') {
        carres = carres.reverse();
      }

      divs.push(
        <div className="d-flex carreContainer" key={i}>{carres}</div>
      );
    }

    return (
      <div className={statClass}>
        {divs.reverse()}
      </div>
    )
  }

  render() {
    const { lows, highs, isSmallDevice } = this.state;
    return (
      <div>
        <div className="row" ref={ref => { this.container = ref; }}>
          <div className="col-12 grid-margin stretch-card px-0">
            <div className="col-12 card-body py-0 px-0">
              {/** Meters Bar */}
              <div className="d-flex flex-row justify-content-center">
                {this.renderMeters('lows')}
                <div className='logo'>
                  <h1>MOMO</h1>
                  <h2>PROFIT FROM MOMENTUM</h2>
                </div>
                {this.renderMeters('highs')}
              </div>

              {/** Static Bar */}
              <div className="d-flex align-content-start flex-wrap static-bar mt-3">
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-speedometer text-primary" />
                  </span>
                  <span className="small white-no-wrap bar-txt">STREAM</span>
                </div>
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-file-restore text-success" />
                  </span>
                  <span className="small white-no-wrap bar-txt">
                    ALERT HISTORY
                  </span>
                </div>
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-crosshairs-gps text-warning" />
                  </span>
                  <span className="small white-no-wrap bar-txt">BREADTH</span>
                </div>
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-clipboard-text text-danger" />
                  </span>
                  <span className="small white-no-wrap bar-txt">POPULAR</span>
                </div>
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-chart-bar text-primary" />
                  </span>
                  <span className="small white-no-wrap bar-txt">QUOTE</span>
                </div>
                <div className="d-flex flex-row align-items-center static-row">
                  <span className="bar-icon">
                    <i className="mdi mdi-content-copy text-success" />
                  </span>
                  <span className="small white-no-wrap bar-txt">DISCOVERY</span>
                </div>
              </div>

              {/** Popular Stocks */}
              <div className="container-fluid px-0 data-section-large">
                <div className="d-flex flex-row flex-nowrap overflow-scroll">
                  {this.getStockCards()}
                </div>
              </div>

              {/** Table | (Popular vs Alert History) */}
              <div className="d-flex flex-row data-section-large flex-wrap">
                <div className="grid-margin stretch-card px-0 flex-fill socket-table">
                  <div className="card">
                    {
                      isSmallDevice ?
                        <div className="d-flex flex-row">
                          {this.getData(lows, "low")}
                          {this.getData(highs, "high")}
                        </div>
                        :
                        <div className="card-body">
                          <div className="row">
                            {this.getData(lows, "low")}
                            {this.getData(highs, "high")}
                          </div>
                        </div>
                    }

                  </div>
                </div>
                <div className="grid-margin stretch-card column-flex pr-0 popular-table">
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
              <div className="d-flex flex-row data-section">
                <div className="col-12 px-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between text-center flex-wrap">
                        <h4 className="card-title mb-1 py-1">Discovery</h4>
                        <div className="d-flex flex-row mT15">
                          <span className="border border-radius-10">
                            <div className="button btn-dark px-4 py-1 border-radius-10" onClick={this.onIndustry}>
                              Industry
                            </div>
                          </span>
                          <span className="border border-radius-10 ml-4">
                            <div className="button btn-dark px-4 py-1 border-radius-10">
                              Favorites
                            </div>
                          </span>
                        </div>
                        <input
                          className="input p-0 text-center bg-dark white-color input-border"
                          placeholder="symbol search"
                        />
                      </div>

                      {/** Discovery Table */}
                      <div className="discovery-table">
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
                            {
                              this.state.stats.map((stock, index) => {
                                return <tr key={"discovery-table-" + index}>
                                  <td className="text-white font-weight-bold text-center">
                                    {stock.symbol}
                                  </td>
                                  <td className="text-center">{stock.priorDayLast}</td>
                                  <td className="text-center"> {stock.avgVolume /* No Volume*/}</td>
                                  <td className="text-success text-center">+121</td>
                                  <td className="text-success text-center">+18%</td>
                                  <td className="text-success text-center">+18%</td>
                                  <td className="text-center">25%</td>
                                  <td className="text-center">* ^</td>
                                </tr>
                              })
                            }
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
      </div>
    );
  }
}

export default Dashboard;
