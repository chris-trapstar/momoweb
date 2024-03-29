import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import API from "../api";
import cogoToast from "cogo-toast";
import Swiper from "react-id-swiper";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import * as _ from "lodash";
import { withTranslation } from "react-i18next";
// import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Form, Button, Modal, Spinner, Dropdown } from "react-bootstrap";
import abbreviate from "number-abbreviate";

import "./dashboard.css";
import "swiper/css/swiper.css";
import { AuthActions } from "../store";
import Meters from "../meters/Meters";
import { ArrowDown, ArrowUp } from "./../icons";
import {
  PRICE_MIN,
  PRICE_MAX,
  AVG_VOL_MIN,
  AVG_VOL_MAX,
  SECTORS_FILTER,
  DEFAULT_FILTER,
} from "../constants";
import DiscoveryTable from "./DiscoveyTable";
import MainMenu from "../shared/MainMenu/MainMenu";
import * as DataSource from "../DataSource";

const params = {
  grabCursor: true,
  slidesPerView: "auto",
  spaceBetween: 20,
  pagination: {
    el: ".swiper-pagination",
  },
  shouldSwiperUpdate: true,
};

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
    const handler = (e) => this.setState({ isSmallDevice: e.matches });
    window.matchMedia("(max-width: 767px)").addListener(handler);
    this.listenTrade();
    this.listenAlert();
    this.buffer = [];
    this.flushBufferIntervalId = setInterval(this.flushBuffer, 2000);
    // this.requestNotificationPermissions().then(r => {});
    this.getStats();
    this.statsTimer = setInterval(() => {
      this.getQuotes();
      this.getStats();
      this.getPopularData();
      this.getAlertHistory();
    }, 3 * 60 * 1000); // Update Every 3 minutes

    this.getPopularData();
    this.getAlertHistory();
    this.getQuotes();
    const discoveryTable = document.getElementById("discovery-table");
    if (discoveryTable) {
      discoveryTable.addEventListener("scroll", this.handleScroll);
    }
    DataSource.connect();
  }

  componentWillUnmount() {
    window.removeEventListener("compressedUpdate", this.onCompressedUpdate);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("alert", this.onAlert);
  }

  getScrollPercent() {
    const h = document.getElementById("discovery-table"),
      b = document.body,
      st = "scrollTop",
      sh = "scrollHeight";
    return ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
  }

  handleScroll = (e) => {
    if (this.getScrollPercent() === 100) {
      const { discoveryIndex } = this.state;
      this.setState({
        // pagination
        discoveryIndex: discoveryIndex + 25,
      });
    }
  };

  onFavPress = () => {
    const { isFavFilter, discoveryData } = this.state;
    let filterData = [];
    if (isFavFilter) {
      filterData = discoveryData.filter(this.searchFilter);
    } else {
      filterData = discoveryData
        .filter((item) => this.isSymbolFav(item.symbol))
        .filter(this.searchFilter);
    }
    this.setState({
      discoveryDataFiltered: filterData,
      isFavFilter: !isFavFilter,
    });
  };

  updateDimensions = () => {
    if (!this.container) {
      return;
    }
    let restSpace = 300;
    const width = this.container.offsetWidth;
    if (width < 415) {
      restSpace = 30;
    } else if (width < 900) {
      restSpace = 150;
    }
    const total = Math.ceil(
      (this.container.offsetWidth - restSpace - 160) / 20
    );
    this.setState({ total });
  };

  componentWillUnmount() {
    if (this.flushBufferIntervalId) {
      clearInterval(this.flushBufferIntervalId);
    }
    clearInterval(this.statsTimer);
    DataSource.disconnect();
  }

  getStats = async () => {
    const discoveryData = await API.getStats();

    const discoveryDataFiltered = discoveryData
      .filter(this.favFilter)
      .filter(this.searchFilter);

    this.setState({
      discoveryData,
      discoveryDataFiltered: discoveryDataFiltered,
    });
  };

  getPopularData = () => {
    API.getPopular()
      .then((popular) => {
        let symbols = [];
        popular.forEach((arr) => {
          symbols = [...symbols, ...arr];
        });
        this.setState({ popularData: popular, popularSymbols: symbols });
      })
      .catch((error) => {
        console.info(error);
      });
  };

  getAlertHistory = () => {
    API.getAlertHistory()
      .then((alertHistory) => {
        if (Array.isArray(alertHistory)) {
          this.setState({ alertHistory });
        }
      })
      .catch((error) => {
        console.info(error);
      });
  };

  getQuotes = async () => {
    try {
      const quotes = await API.getQuotes();
      if (Array.isArray(quotes)) {
        this.setState({
          quotes,
        });
      }
    } catch (e) {
      cogoToast.error("Failed to get favorite stocks!");
    }
  };

  getInitialState = () => {
    return {
      quotes: [],
      highs: [],
      lows: [],
      bars: [1, 0.6, -1],
      stats: [],
      popoverOpened: false,
      stockCards: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      isSmallDevice: window.matchMedia("(max-width: 768px)").matches,
      total: 0,
      discoveryData: [],
      discoveryDataFiltered: [],
      popularData: [],
      popularSymbols: [],
      alertHistory: [],
      discoveryFilter: "",
      discoveryNoDataText: "Loading...",
      discoveryIndex: 50,
      discoverySort: {
        field: "price_dist",
        type: "none",
      },
      discoverySector: "Industry",
      discoverySelectedSymbol: "",
      discoverAlerySelected: {
        symbol: "",
        vWAPDist: "",
      },
      max: false,
      new_quote: "",
      showSpinner: false,
      showAddQuote: false,
      isFavFilter: false,
      sectors: ["Industry", ...Object.keys(SECTORS_FILTER)],
    };
  };

  onCompressedUpdate = (event) => {
    this._handleData(event.detail);
  };

  onAlert = (event) => {
    this.getAlertHistory();
  };

  listenAlert = () => {
    window.addEventListener("alert", this.onAlert, false);
  };

  listenTrade = () => {
    window.addEventListener("compressedUpdate", this.onCompressedUpdate, false);
    // this.subscribeChannels(data_filter.category);
  };

  _handleData = (data) => {
    let msg = data[0];
    let highs = msg[1];
    let lows = msg[2];

    if ("DISABLED" in window) {
      return false;
    }

    lows = this.applyFilter(lows);
    highs = this.applyFilter(highs);

    if (lows.length + highs.length > 0) {
      if (this.buffer.length > 200) {
        this.buffer = [];
        console.error("Buffer too big, truncating");
      }
      this.buffer.push({ highs, lows });
      if (this.buffer.length > 1000) {
        this.buffer.shift();
      }
    }
  };

  subscribeChannels = (channels) => {
    channels.forEach((c) => {
      if (c.subscribed === true) this.socket.emit("subscribe", c.value);
      else this.socket.emit("unsubscribe", c.value);
    });
  };

  applyFilter = (data) => {
    const { filter } = this.props.config;

    let dicSectors = {};
    for (let key in filter.industries) {
      dicSectors = { ...dicSectors, ...SECTORS_FILTER[key] };
    }

    return data
      .filter((item, i) => {
        let price = item[1];
        let priceFilter = filter.price;
        const min = priceFilter.min || 0;
        const max = priceFilter.max >= PRICE_MAX ? Infinity : priceFilter.max;
        return price >= min && price <= max;
      })
      .filter((item, i) => {
        let volume = item[5];
        let volumeFilter = filter.volume;
        const min = volumeFilter.min || 0;
        const max =
          volumeFilter.max >= AVG_VOL_MAX ? Infinity : volumeFilter.max;
        return volume >= min && volume <= max;
      })
      .filter((item) => {
        if (item[6]) {
          return dicSectors[item[6]];
        }
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
    let highs = this.state.highs.slice();
    let lows = this.state.lows.slice();
    this.buffer.forEach(function (item, i, arr) {
      highs = item.highs.concat(highs).slice(0, 100);
      lows = item.lows.concat(lows).slice(0, 100);
    });
    this.buffer = [];
    this.setState({
      lows: lows,
      highs: highs,
    });
  };

  round = (value, decimals) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "__";
    } else {
      return num.toFixed(decimals);
    }
  };

  getLast = (OTC, ticker) => {
    return OTC === 1 ? this.round(ticker, 4) : this.round(ticker, 2);
  };

  onAddQuote = () => {
    this.registerQuote(this.state.new_quote);
    this.setState({
      showAddQuote: false,
      new_quote: "",
    });
  };

  favFilter = (item) => {
    const { isFavFilter } = this.state;
    if (isFavFilter) {
      return this.isSymbolFav(item.symbol);
    } else {
      return true;
    }
  };

  searchFilter = (item) => {
    const { discoveryFilter } = this.state;
    if (discoveryFilter) {
      return item.symbol.includes(discoveryFilter);
    } else {
      return true;
    }
  };

  sectorFilter = (item) => {
    const { discoverySector } = this.state;
    if (discoverySector === "Industry") {
      return true;
    }
    const filters = SECTORS_FILTER[discoverySector];
    if (!filters) {
      return false;
    }
    return filters[item.sector];
  };

  renderAddQuoteModal = () => {
    return (
      <Modal
        show={this.state.showAddQuote}
        onHide={() => {
          this.setState({ showAddQuote: false });
        }}
        aria-labelledby="example-modal-sizes-title-md"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <small className="text-light"> Add Quote</small>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <label>Symbol</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">@</span>
              </div>
              <Form.Control
                type="text"
                className="form-control text-light"
                value={this.state.new_quote}
                onChange={(e) => {
                  this.setState({ new_quote: e.target.value });
                }}
              />
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <div className="footer-container">
            <Button
              variant="success col-12"
              onClick={this.onAddQuote}
              className="btn btn-primary"
            >
              Add
            </Button>
          </div>
          {/*<Button variant='light m-2' onClick={() => { this.setState({ showCardInput: false }) }}>Cancel</Button>*/}
        </Modal.Footer>
      </Modal>
    );
  };

  renderData = (data, type) => {
    const { isSmallDevice, max } = this.state;
    let renderData = [];
    let renderMenuItems = [];

    if (type === "low") {
      data.map((low, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push(
          // high[3] === 1 means Active
          <tr key={`render-stock-data-table-low-${index}`}>
            <td className="text-low flex-fill">
              <label
                className={`stock-text ${
                  low[3] === 1 ? "stock-active-text stock-active-low" : ""
                  }`}
              >
                <ContextMenuTrigger
                  id={`low-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {low[0]}
                </ContextMenuTrigger>
              </label>
              {low[4] === 1 && (
                <img
                  className="stockwits"
                  src={require("../../assets/images/dashboard/stock-tweets.svg")}
                />
              )}
            </td>
            <td className="text-low flex-fill">
              <label className="stock-text">{low[2]}</label>
            </td>
            <td className="text-low flex-fill">
              <label className="stock-text">
                {`${this.round(this.getLast(low[6], low[1]), 2)}`}
              </label>
            </td>
          </tr>
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
          // high[3] === 1 means Active
          <tr key={`render-stock-data-table-high-${index}`}>
            <td className="text-high flex-fill">
              <label
                className={`stock-text ${
                  high[3] === 1 ? "stock-active-text stock-active-high" : ""
                  }`}
              >
                <ContextMenuTrigger
                  id={`high-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {high[0]}
                </ContextMenuTrigger>
              </label>
              {high[4] === 1 && (
                <img
                  className="stockwits"
                  src={require("../../assets/images/dashboard/stock-tweets.svg")}
                />
              )}
            </td>
            <td className="text-high flex-fill">
              <label className="stock-text">{high[2]}</label>
            </td>
            <td className="text-high flex-fill">
              <label className="stock-text">
                {`${this.round(this.getLast(high[6], high[1]), 2)}`}
              </label>
            </td>
          </tr>
        );
        /** Add Popover For this item */

        renderMenuItems.push(
          this.getMenuItems(`high-context-menu_${index}`, high, "high")
        );
      });
    }
    return (
      <div
        className={
          "col-md-6 tableFixHead nopadding" + (max ? " table-max" : "")
        }
      >
        <table className="table table-striped h-100">
          <thead>
            <tr>
              <th className="text-white">
                <div className={"th-item-wrapper"}> Symbol </div>
              </th>
              <th className="text-white">
                <div className={"th-item-wrapper"}> Count </div>
              </th>
              <th className="text-white">
                <div className={"th-item-wrapper"}> Last </div>
              </th>
            </tr>
          </thead>
          <tbody>{renderData}</tbody>
        </table>
        {renderMenuItems}
      </div>
    );
  };

  renderQuoteCards = () => {
    const { quotes } = this.state;
    let renderCards = [];
    quotes.map((item, index) => {
      renderCards.push(
        <div key={"render-cards" + index} className="quote-card">
          <div className="card p-1 overflow-hidden">
            <div className="horizontal-quote-container card-padding container-padding">
              <label className="mb-0 font-weight-bold font-20">
                {item.symbol}
              </label>
              <div
                className="d-flex flex-row-reverse remove-cursor"
                onClick={() => {
                  this.onRemoveQuote(item);
                }}
              >
                <i className="mdi mdi-star quote-star" />
              </div>
            </div>
            <div className="horizontal-quote-container">
              <label
                style={{
                  fontWeight: "600",
                  fontSize: "20px",
                  color: item.percent > 0 ? "#00d25b" : "#fc424a",
                  paddingLeft: 8,
                }}
              >
                {`${this.round(item.price, 2)}`}
                <sup style={{ fontSize: 14, marginLeft: 4 }}>
                  {item.percent > 0
                    ? `+${this.round(item.percent, 1)}%`
                    : `${this.round(item.percent, 1)}%`}
                </sup>
              </label>
              <div className="vertical-quote-container">
                <div className="no-wrap">
                  <label className="quote-status-label">H:</label>
                  <label className="font-14 dash-font-color ml-1">
                    {`${this.round(item.high, 2)}`}
                  </label>
                </div>
                <div className="no-wrap">
                  <label className="quote-status-label">L:</label>
                  <label className="font-14 dash-font-color ml-1">
                    {`${this.round(item.low, 2)}`}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="bullets-section" />
        </div>
      );
    });

    return renderCards;
  };

  getMenuItems = (key, data, type) => {
    return (
      <ContextMenu id={key} className="p-0" key={`menu-item-${key}`}>
        <div className="context-menu-style">
          <div className="mt-2" />
          <span>LINKS</span>
          <MenuItem
            data={{ data, type, domain: "cnbc" }}
            onClick={() =>
              this.onPopover(
                "cnbc",
                key !== "discovery-context-menu"
                  ? data[0]
                  : this.state.discoverySelectedSymbol
              )
            }
          >
            <div className="row align-items-center mt-1">
              <img
                className={"context-menu-item-icon-style"}
                style={{ height: 16, width: 25 }}
                src={require("../../assets/images/dashboard/cnbc.png")}
              />
              <span className="medium white-no-wrap bar-txt">CNBC</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: "marketwatch" }}
            onClick={() =>
              this.onPopover(
                "marketwatch",
                key !== "discovery-context-menu"
                  ? data[0]
                  : this.state.discoverySelectedSymbol
              )
            }
          >
            <div className="row align-items-center mt-1">
              <img
                className={"context-menu-item-icon-style"}
                style={{ height: 13, width: 25 }}
                src={require("../../assets/images/dashboard/marketwatch.png")}
              />
              <span className="medium white-no-wrap bar-txt">MarketWatch</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: "seekingalpha" }}
            onClick={() =>
              this.onPopover(
                "seekingalpha",
                key !== "discovery-context-menu"
                  ? data[0]
                  : this.state.discoverySelectedSymbol
              )
            }
          >
            <div className="row align-items-center mt-1">
              <img
                className={"context-menu-item-icon-style"}
                style={{ height: 22, width: 25 }}
                src={require("../../assets/images/dashboard/seekingalpha.png")}
              />
              <span className="medium white-no-wrap bar-txt">
                Seeking Alpha
              </span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: "nasdaq" }}
            onClick={() =>
              this.onPopover(
                "nasdaq",
                key !== "discovery-context-menu"
                  ? data[0]
                  : this.state.discoverySelectedSymbol
              )
            }
          >
            <div className="row align-items-center mt-1">
              <i
                className="mdi mdi-chart-line-variant popover-icon context-menu-item-icon-style"
                style={{ height: 21, width: 25, marginTop: -10 }}
              />
              <span className="medium white-no-wrap bar-txt">Nasdaq</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: "stocktwits" }}
            onClick={() =>
              this.onPopover(
                "stocktwits",
                key !== "discovery-context-menu"
                  ? data[0]
                  : this.state.discoverySelectedSymbol
              )
            }
          >
            <div className="row align-items-center mt-1">
              <img
                className={"context-menu-item-icon-style"}
                style={{ height: 25, width: 24 }}
                src={require("../../assets/images/dashboard/stocktwits.png")}
              />
              <span className="medium white-no-wrap bar-txt">Stocktwits</span>
            </div>
          </MenuItem>
          <div className="mt-3" />
          <span>ACTIONS</span>
          <div className="row justify-content-between align-items-center">
            <MenuItem
              data={{ data, type }}
              onClick={() => {
                this.registerAlert(
                  key === "discovery-context-menu"
                    ? this.state.discoverySelectedSymbol
                    : data[0],
                  "trade",
                  type === "high" ? data[1] : 0,
                  type === "low" ? data[1] : 0
                );
              }}
            >
              <div className="row justify-content-center align-items-center">
                <i className="mdi mdi-bell text-white popover-icon" />
                <span className="ml-1">Alert</span>
              </div>
            </MenuItem>
            <MenuItem
              data={{ data, type }}
              onClick={() => {
                console.info("MenuItem.registerQuote - ", data, type);
                this.registerQuote(
                  key === "discovery-context-menu"
                    ? this.state.discoverySelectedSymbol
                    : data[0]
                );
              }}
            >
              <div className="row justify-content-center align-items-center">
                <i className="mdi mdi-star text-white popover-icon" />
                <span className="ml-1">Favorites</span>
              </div>
            </MenuItem>
          </div>
        </div>
      </ContextMenu>
    );
  };

  onPopover = async (domain, symbol) => {
    window.open(API.getStockPageLink(`${domain}.com`, symbol), "_blank");
  };

  onRemoveQuote = async ({ symbol }) => {
    try {
      const result = await API.deleteQuote(symbol);
      if (result && result.success) {
        this.setState({
          quotes: result.data,
        });
      }
    } catch (e) {
      cogoToast.error(`Failed to remove ${symbol} from favorites!`);
    }
  };

  registerQuote = async (symbol) => {
    console.info("registerQuote - ", symbol, this.state.quotes);

    const quote = this.state.quotes.find((q) => q.symbol === symbol);
    if (quote) {
      this.setState({ showSpinner: true });
      await this.onRemoveQuote({ symbol });
      this.setState({ showSpinner: false });
    } else {
      try {
        this.setState({ showSpinner: true });
        const result = await API.registerQuote(symbol.toUpperCase());
        if (result && result.success && result.data) {
          cogoToast.success(`Quote added for ${symbol}`);
          this.setState({
            quotes: result.data,
          });
        } else if (result && result.error) {
          throw result.error;
        }
        this.setState({ showSpinner: false });
      } catch (e) {
        if (e === "SequelizeUniqueConstraintError: Validation error") {
          cogoToast.error(`${symbol} is already registered!`);
        } else {
          cogoToast.error(`Failed to mark ${symbol} as favorite!`);
        }
        this.setState({ showSpinner: false });
      }
    }
  };

  registerAlert = async (symbol, type, high = 0, low = 0) => {
    const dic = {
      trade: "Trade",
      uv: "Unusual volume",
      vwap: "vWAPDist",
      price: "Price",
      "hi/lo": "Hi/low",
    };
    try {
      const result = await API.addAlert({
        category: symbol,
        rate: 0,
        high,
        low,
        type,
      });
      if (result && result.success) {
        cogoToast.success(`${dic[type]} alert added for ${symbol}`);
      } else if (result && result.error) {
        throw result.error;
      }
    } catch (e) {
      if (e === "SequelizeUniqueConstraintError: Validation error") {
        cogoToast.error(
          `${dic[type]} alert for ${symbol} is already registered!`
        );
      } else {
        cogoToast.error(`Failed to register ${dic[type]} alert for ${symbol}`);
      }
    }
  };

  onChangeSector = (discoverySector) => {
    console.info("onChnageSector - ", discoverySector);
    this.setState(
      {
        discoverySector,
      },
      () => {
        this.onChangeDiscoveryFilter();
      }
    );
  };

  isSymbolFav = (symbol) => {
    const { quotes } = this.state;
    const qouteItem = quotes.find((item) => item.symbol === symbol);
    return qouteItem ? true : false;
  };

  onSort = (field, sortType = "up") => {
    const { discoveryDataFiltered, discoveryData } = this.state;
    const sortOption = {
      field,
      type: sortType,
    };

    const sorted = _.sortBy(discoveryDataFiltered, field);

    this.setState({
      discoverySort: sortOption,
      discoveryIndex: 50,
      discoveryDataFiltered:
        sortOption.type === "none"
          ? discoveryData
          : sortOption.type === "up"
            ? sorted.reverse()
            : sorted,
    });
  };

  renderPopularData = (index) => {
    let data = [];
    const { popularSymbols } = this.state;
    const len = popularSymbols.length;
    popularSymbols.map((item, i) => {
      data.push(
        <div key={`popular-data-h3-${index + i}`}>
          <ContextMenuTrigger
            id={`popular-data-h3-${index + i}`}
            holdToDisplay={0}
          >
            <div
              className="pr-2"
              style={{
                fontSize: `${Math.floor(32 - 20 * (i / len))}px`,
              }}
            >
              {item}{" "}
            </div>
          </ContextMenuTrigger>
          {this.getMenuItems(
            `popular-data-h3-${index + i}`,
            [item, "", "", "", "", ""],
            ""
          )}
        </div>
      );
    });

    return data;
  };

  formatDate(inputDate) {
    const date = new Date(inputDate);

    let diff = new Date() - date;

    if (diff < 1000) return "right now";

    let sec = Math.floor(diff / 1000);

    if (sec < 60) return sec + " sec. ago";

    let min = Math.floor(diff / 60000);
    if (min < 60) return min + " min. ago";

    let d = date;
    d = [
      "0" + (d.getMonth() + 1),
      "0" + d.getDate(),
      "" + d.getFullYear(),
      "0" + d.getHours(),
      "0" + d.getMinutes(),
    ].map((component) => component.slice(-2));

    return d.slice(0, 3).join("/") + " " + d.slice(3).join(":");
  }

  renderAlertHistory = () => {
    let data = [];
    const { alertHistory } = this.state;
    alertHistory.map((item, index) => {
      data.push(
        <div key={`render-alert-history-${index}`}>
          <div className="d-flex flex-row flex-fill flex-wrap">
            {/* <div className='font-13 alert-history-color'>{item.msg}</div> */}
            <div className="font-13 alert-history-color">{`${
              item.msg
              } - ${this.formatDate(item.date)}`}</div>
          </div>
          <div className="d-flex flex-row flex-fill alert-history-separator" />
        </div>
      );
    });
    return data;
  };

  isSorted = (field, type) =>
    this.state.discoverySort.field === field &&
    this.state.discoverySort.type === type;

  sortUI = (field) => (
    <div key={`discovery-sort-${field}`} className={"filter-icon-wrapper"}>
      <div
        style={{ display: "inline-flex" }}
        onClick={() => {
          this.onSort(field, this.isSorted(field, "up") ? "none" : "up");
        }}
      >
        <ArrowUp
          width={"10px"}
          height={"10px"}
          fill={this.isSorted(field, "up") ? "#ffff00" : "#ffff"}
        />
      </div>
      <div
        style={{ display: "inline-flex" }}
        onClick={() => {
          this.onSort(field, this.isSorted(field, "down") ? "none" : "down");
        }}
      >
        <ArrowDown
          width={"10px"}
          height={"10px"}
          fill={this.isSorted(field, "down") ? "#ffff00" : "#ffff"}
        />
      </div>
    </div>
  );

  renderDiscoveryTableResponsive = () => {
    const {
      discoveryDataFiltered,
      discoveryNoDataText,
      discoveryIndex,
    } = this.state;

    return (
      <div style={{ height: "100%" }}>
        <DiscoveryTable
          index={discoveryIndex}
          discoverySector={this.state.discoverySector}
          discoveryFilter={this.state.discoveryFilter}
          discoveryData={discoveryDataFiltered.map(
            (
              {
                symbol,
                last,
                volume,
                momentum,
                uVol,
                vWapDist,
                short,
                price_dist,
              },
              index
            ) => {
              return {
                index,
                symbol,
                last,
                volume,
                momentum,
                uVol,
                vWAPDist: vWapDist,
                short,
                alert: symbol,
                price_dist,
              };
            }
          )}
          checkIsFavorite={(symbol) => this.isSymbolFav(symbol)}
          onContextMenuTrigger={(symbol) =>
            this.setState({ discoverySelectedSymbol: symbol })
          }
          onSetSymbolFav={this.registerQuote}
          onAlertTrigger={(symbol, vWAPDist) =>
            this.setState({
              discoverAlerySelected: {
                symbol: symbol,
                vWAPDist: vWAPDist,
              },
            })
          }
        />
        {this.getMenuItems(
          `discovery-context-menu`,
          ["", "", "", "", "", ""],
          ""
        )}
        {this.renderAlertMenu(`discovery-alert-context-menu`)}
      </div>
    );
  };

  renderStream = () => {
    const { isSmallDevice, lows, highs, max } = this.state;
    const {
      filter: { price, volume },
    } = this.props.config;
    const minPrice = price.min;
    const maxPrice = price.max === PRICE_MAX ? "∞" : price.max;
    const minVolume = abbreviate(volume.min);
    const maxVolume = volume.max === AVG_VOL_MAX ? "∞" : abbreviate(volume.max);
    return (
      <div
        className={
          max || !this.props.isPro
            ? "w-100 h-100"
            : !this.props.menu.popular && !this.props.menu.alertHistory
              ? "w-100"
              : "grid-margin stretch-card px-0 flex-fill socket-table"
        }
      >
        <div className="card h-100">
          <div
            className="text-muted mb-0 pl-3 small d-flex align-items-center"
            style={{ height: "1.5rem" }}
          >
            <i className="mdi mdi-filter mr-1" aria-hidden="true"></i>
            {`PRICE: $${minPrice} - ${maxPrice}, VOLUME: ${minVolume} - ${maxVolume}`}
          </div>
          <div
            className="btn btn-icon btn-max"
            style={
              max ? { marginRight: 30, marginTop: -6 } : { marginRight: 16 }
            }
            onClick={() => {
              this.setState({
                max: max ? null : "stream",
              });
            }}
          >
            <i className={max ? "mdi mdi-close" : "fa fa-expand"} />
          </div>
          {isSmallDevice ? (
            <div
              className="d-flex flex-row h-100"
              style={{ minHeight: this.props.menu.discovery ? "48vh" : "80vh" }}
            >
              {this.renderData(lows, "low")}
              {this.renderData(highs, "high")}
            </div>
          ) : (
              <div
                className="card-body stream-body"
                style={
                  max
                    ? {}
                    : { height: this.props.menu.discovery ? "48vh" : "80vh" }
                }
              >
                <div className="row" style={{ height: "100%" }}>
                  {this.renderData(lows, "low")}
                  {this.renderData(highs, "high")}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  onAlertMenuClick(symbol, type, vWAPDist) {
    this.registerAlert(symbol, type, vWAPDist, vWAPDist);
  }
  renderAlertMenu = (key) => {
    const symbol = this.state.discoverAlerySelected.symbol;
    const vWAPDist = this.state.discoverAlerySelected.vWAPDist;
    return (
      <ContextMenu id={key} className="p-0" key={`alert_menu-item-${key}`}>
        <div className="context-menu-alert-style">
          <MenuItem
            onClick={() => {
              this.onAlertMenuClick(symbol, "price", vWAPDist);
            }}
          >
            <div className="row align-items-center mt-1">
              <span className="medium white-no-wrap bar-txt">Price</span>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.onAlertMenuClick(symbol, "vwap", vWAPDist);
            }}
          >
            <div className="row align-items-center mt-1">
              <span className="medium white-no-wrap bar-txt">VWAP</span>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.onAlertMenuClick(symbol, "uv", vWAPDist);
            }}
          >
            <div className="row align-items-center mt-1">
              <span className="medium white-no-wrap bar-txt">UnVol</span>
            </div>
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.onAlertMenuClick(symbol, "hi/lo", vWAPDist);
            }}
          >
            <div className="row align-items-center mt-1">
              <span className="medium white-no-wrap bar-txt">Hi/Lo</span>
            </div>
          </MenuItem>
        </div>
      </ContextMenu>
    );
  };

  renderDiscovery = () => {
    const { discoveryFilter, max } = this.state;

    return (
      <div className={max ? "w-100" : "d-flex flex-row data-section"}>
        <div className="col-12 px-0 h-100">
          <div className="card h-100">
            <div style={{ flex: "1 1 auto" }}>
              <div className="row h-100">
                <div
                  className="col-12 "
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    className="d-flex flex-row justify-content-between text-center flex-wrap mb-2"
                    style={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingBottom: "0.4rem",
                      paddingTop: "1rem",
                    }}
                  >
                    <h4
                      className="d-flex card-title mb-1 py-1"
                      style={{ flex: "1" }}
                    >
                      Discovery
                      <span
                        style={{
                          paddingLeft: 2,
                          paddingRight: 2,
                          fontSize: "10px",
                          color: "#000000",
                          background: "#ffff",
                          marginLeft: "5px",
                          height: "11px",
                        }}
                      >
                        PRO
                      </span>
                    </h4>
                    <div
                      className="d-flex justify-content-between item-wrap"
                      style={{ flex: "2" }}
                    >
                      <div className="d-flex flex-row mT15">
                        <div className="search-bar-wrapper search-bar-wrapper-hover">
                          <Dropdown varaint="btn btn-outline-secondary">
                            <Dropdown.Toggle className="industry_input">
                              {this.state.discoverySector}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {this.state.sectors.map((sector) => {
                                return (
                                  <Dropdown.Item
                                    key={sector}
                                    onClick={() => {
                                      this.onChangeSector(sector);
                                    }}
                                    tabIndex="1"
                                  >
                                    {sector}
                                  </Dropdown.Item>
                                );
                              })}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>

                        <div
                          className="search-bar-wrapper search-bar-wrapper-hover"
                          style={{
                            cursor: "pointer",
                            padding: 16,
                            marginLeft: 8,
                          }}
                          onClick={this.onFavPress}
                        >
                          <i
                            className={`${
                              this.state.isFavFilter
                                ? "mdi mdi-star quote-star popover-icon"
                                : "mdi mdi-star text-white popover-icon"
                              }`}
                            style={{ alignSelf: "center" }}
                          />
                          <span
                            style={{
                              alignSelf: "center",
                              marginLeft: 4,
                              fontSize: 15,
                            }}
                          >
                            Favorites
                          </span>
                        </div>
                      </div>
                      <div className="d-flex flex-row align-items-center">
                        <div
                          className="search-bar-wrapper search-bar-wrapper-hover"
                          style={{ marginRight: 40, marginLeft: 8 }}
                        >
                          <input
                            className="search-bar"
                            placeholder="Symbol..."
                            onChange={this.onChangeDiscoveryFilter}
                            ref={(ref) => {
                              this.refDiscoveryFilter = ref;
                            }}
                          />
                          <div className="search-icon-wrapper">
                            <i
                              className="fa fa-search text-white"
                              style={{ cursor: "default" }}
                            />
                          </div>
                        </div>
                        <div
                          className="btn btn-icon btn-max"
                          style={
                            max ? { marginRight: 42 } : { marginRight: 30 }
                          }
                          onClick={() => {
                            this.setState(
                              {
                                max: max ? null : "discovery",
                                discoveryIndex: 50,
                              },
                              () => {
                                window.scrollTo(0, 0);
                                document
                                  .getElementById("discovery-table")
                                  .addEventListener(
                                    "scroll",
                                    this.handleScroll
                                  );
                              }
                            );
                          }}
                        >
                          <i
                            className={max ? "mdi mdi-close" : "fa fa-expand"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      (max ? "discovery-max" : "discovery-normal") +
                      " discovery-table"
                    }
                    id="discovery-table"
                  >
                    {this.renderDiscoveryTableResponsive()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  onChangeDiscoveryFilter = () => {
    const discoveryFilter = this.refDiscoveryFilter.value.toUpperCase();
    const { discoveryData } = this.state;
    let discoveryDataFiltered = [];
    if (discoveryFilter === "") {
      this.setState({ discoveryNoDataText: "Loading..." });
      discoveryDataFiltered = discoveryData
        .filter(this.favFilter)
        .filter(this.sectorFilter);
    } else {
      this.setState({ discoveryNoDataText: "No Data" });
      discoveryDataFiltered = discoveryData
        .filter((data) => {
          return data.symbol?.includes(discoveryFilter);
        })
        .filter(this.favFilter)
        .filter(this.sectorFilter);
    }
    this.setState({ discoveryFilter, discoveryDataFiltered });
  };

  render() {
    const { max } = this.state;
    if (max) {
      return (
        <div className="row dashboard-content h-100">
          {max === "stream" && this.renderStream()}
          {max === "discovery" && this.renderDiscovery()}
        </div>
      );
    }
    return (
      <div>
        {this.state.showSpinner && (
          <div className="overlay">
            <Spinner
              className={"overlay-content"}
              animation="border"
              variant="success"
            />
          </div>
        )}
        <div
          className="row dashboard-content h-100"
          ref={(ref) => {
            this.container = ref;
          }}
        >
          <div className="col-12 stretch-card px-0">
            <div className="col-12 card-body py-0 px-0">
              <MainMenu />

              {this.props.menu.meters && (
                <Meters
                  onClose={() => {
                    this.setState({
                      showMeters: false,
                    });
                  }}
                />
              )}
              {/** Favorite(Quote) Stocks */}
              {this.props.menu.quotes && this.state.quotes.length > 0 && (
                <div className="quotes-area">
                  <div className="quote-tools card">
                    <a
                      onClick={() => {
                        this.setState({
                          showAddQuote: true,
                        });
                      }}
                    >
                      <i className="mdi mdi-plus cursor-pointer add-quoute-icon" />
                    </a>
                    {/* <a>
                      <i className='mdi mdi-chevron-down cursor-pointer add-quoute-icon' />
                    </a> */}
                  </div>
                  {this.state.quotes.length > 0 && (
                    <Swiper {...params}>{this.renderQuoteCards()}</Swiper>
                  )}
                </div>
              )}
              {this.renderAddQuoteModal()}
              {this.props.menu.quotes && this.state.quotes.length === 0 && (
                <div className="card add-quote-empty">
                  <a
                    onClick={() => {
                      this.setState({
                        showAddQuote: true,
                      });
                    }}
                  >
                    <i className="mdi mdi-plus cursor-pointer add-quoute-icon" />
                  </a>
                </div>
              )}

              {/** Table | (Popular vs Alert History) */}
              <div className="d-flex flex-row data-section-small flex-wrap">
                {this.props.isPro &&
                  this.props.menu.stream &&
                  this.renderStream()}

                <div
                  className={
                    this.props.isPro
                      ? "d-flex grid-margin stretch-card flex-column pr-0 popular-table"
                      : "basic-container"
                  }
                >
                  {this.props.menu.popular && (
                    <div
                      className={
                        this.props.isPro ? "card" : "card basic-popular"
                      }
                    >
                      <div
                        style={{
                          maxHeight: 400,
                        }}
                        className="d-flex flex-column p-3"
                      >
                        <div className="d-flex flex-row justify-content-between">
                          <h4 style={{ marginBottom: "0px" }}>Popular</h4>
                        </div>
                        <div
                          style={{
                            marginLeft: "1rem",
                            textTransform: "uppercase",
                            height: "95%",
                            overflow: "scroll",
                          }}
                        >
                          <div
                            className="d-flex flex-row flex-fill flex-wrap"
                            style={{ alignItems: "baseline" }}
                          >
                            {this.renderPopularData(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {this.props.menu.alertHistory &&
                    this.props.menu.popular &&
                    (this.props.isPro ? (
                      <div className="data-separator"></div>
                    ) : (
                        <div className="basic-data-separator" />
                      ))}
                  {this.props.menu.alertHistory && (
                    <div
                      className="card flex-fill"
                      style={{
                        height: 200,
                        overflow: "hidden",
                      }}
                    >
                      <div style={{}} className="alert-container">
                        <div className="justify-content-between">
                          <h4 style={{ marginBottom: "0px" }}>Alert History</h4>
                        </div>
                        <div className="data-section alert-section">
                          <div className="d-flex flex-row flex-fill alert-history-separator" />
                          <div className="alert-history-data">
                            {this.renderAlertHistory()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/** Basic Stream */}
              {!this.props.isPro &&
                this.props.menu.stream &&
                this.renderStream()}

              {/** Discovery */}
              {this.props.isPro &&
                this.props.menu.discovery &&
                this.renderDiscovery()}
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
  setUser: AuthActions.setUser,
};

const mapStateToProps = (state, props) => ({
  authenticated: state.auth.authenticated,
  loading: state.auth.loading,
  user: state.auth.user,
  menu: state.menu,
  config: state.config,
  isPro:
    state.auth.user.subscription.plan === "pro_monthly" ||
    state.auth.user.subscription.plan === "pro_semi_annual",
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
);
