import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import API from '../api';
import cogoToast from 'cogo-toast';
import Swiper from 'react-id-swiper';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import * as _ from 'lodash';
import { withTranslation } from 'react-i18next';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Form, Button, Modal, Spinner, Dropdown } from 'react-bootstrap';

import './dashboard.css';
import 'swiper/css/swiper.css';
import { AuthActions } from '../store';
import Meters from '../meters/Meters';
import { ArrowDown, ArrowUp } from './../icons';
import { PRICE_MIN, PRICE_MAX, AVG_VOL_MIN, AVG_VOL_MAX, SECTORS_FILTER, DEFAULT_FILTER } from '../constants'

const params = {
  grabCursor: true,
  slidesPerView: 'auto',
  spaceBetween: 20,
  pagination: {
    el: '.swiper-pagination',
  },
};

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
    const handler = (e) => this.setState({ isSmallDevice: e.matches });
    window.matchMedia('(max-width: 767px)').addListener(handler);
    this.listenTrade();
    this.buffer = [];
    this.flushBufferIntervalId = setInterval(this.flushBuffer, 2000);
    // this.requestNotificationPermissions().then(r => {});

    this.getStats();
    this.statsTimer = setInterval(() => {
      this.getQuotes();
      this.getStats();
    }, 3 * 60 * 1000); // Update Every 3 minutes

    this.getPopularData();
    this.getAlertHistory();
    this.getQuotes();
    const discoveryTable = document.getElementById('discovery-table');
    if (discoveryTable) {
      discoveryTable.addEventListener('scroll', this.handleScroll);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('compressedUpdate', this.onCompressedUpdate);
    window.removeEventListener('scroll', this.handleScroll);
  }

  getScrollPercent() {
    const h = document.getElementById('discovery-table'),
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';
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
        let { popularData } = this.state;
        popularData.push(popular[0], popular[1], popular[2], popular[3]);
        this.setState({ popularData });
      })
      .catch((error) => {
        console.info(error);
      });
  };

  getAlertHistory = () => {
    API.getAlertHistory()
      .then((alertHistory) => {
        this.setState({ alertHistory });
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
      cogoToast.error('Failed to get favorite stocks!');
    }
  };

  getInitialState = () => {
    let filter = { ...DEFAULT_FILTER }

    let data_filter = localStorage.getItem('filter');
    if (data_filter) {
      try {
        let cached_filter = JSON.parse(data_filter);

        filter.industries = cached_filter.industries || filter.industries
        filter.price = cached_filter.price || filter.price;
        filter.volume = cached_filter.volume || filter.volume;
        localStorage.setItem('filter', JSON.stringify(filter));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('filter', JSON.stringify(DEFAULT_FILTER));
    }
    console.info('Filter Loaded:', filter)

    return {
      /* Widget Status */
      showStream: true,
      showAlertHistory: true,
      showMeters: true,
      showPopular: true,
      showQuotes: true,
      showDiscovery: true,

      quotes: [],
      highs: [],
      lows: [],
      bars: [1, 0.6, -1],
      filter,
      stats: [],
      popoverOpened: false,
      stockCards: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      isSmallDevice: window.matchMedia('(max-width: 768px)').matches,
      total: 0,
      discoveryData: [],
      discoveryDataFiltered: [],
      popularData: [],
      alertHistory: [],
      discoveryFilter: '',
      discoveryNoDataText: 'Loading...',
      discoveryIndex: 50,
      discoverySort: {
        field: 'symbol',
        type: 'none',
      },
      discoverySector: 'ALL',
      max: false,
      new_quote: '',
      showSpinner: false,
      showAddQuote: false,
      isFavFilter: false,
      sectors: ['ALL', ...Object.keys(SECTORS_FILTER)],
    };
  };

  onCompressedUpdate = (event) => {
    this._handleData(event.detail);
  };

  listenTrade = () => {
    let data_filter
    try {
      data_filter = JSON.parse(localStorage.getItem('filter'))
    } catch (e) { }
    if (!data_filter) {
      data_filter = { ...DEFAULT_FILTER };
    }
    if (!data_filter.industries) {
      data_filter.industries = DEFAULT_FILTER.industries
    }
    localStorage.setItem('filter', JSON.stringify(data_filter));
    console.info('Category Loaded:', data_filter)
    window.addEventListener('compressedUpdate', this.onCompressedUpdate, false);
    // this.subscribeChannels(data_filter.category);
  };

  _handleData = (data) => {
    let msg = data[0];
    let highs = msg[1];
    let lows = msg[2];

    if ('DISABLED' in window) {
      return false;
    }

    lows = this.applyFilter(lows);
    highs = this.applyFilter(highs);

    if (lows.length + highs.length > 0) {
      if (this.buffer.length > 200) {
        this.buffer = [];
        console.error('Buffer too big, truncating');
      }
      this.buffer.push({ highs, lows });
      if (this.buffer.length > 1000) {
        this.buffer.shift();
      }
    }
  };

  subscribeChannels = (channels) => {
    channels.forEach((c) => {
      if (c.subscribed === true) this.socket.emit('subscribe', c.value);
      else this.socket.emit('unsubscribe', c.value);
    });
  };

  applyFilter = (data) => {
    let self = this;

    let dicSectors = {}
    const industries = this.state.filter.industries || DEFAULT_FILTER.industries
    for (let key in industries) {
      dicSectors = { ...dicSectors, ...SECTORS_FILTER[key] }
    }

    return data
      .filter((item, i) => {
        let price = item[1];
        let priceFilter = self.state.filter.price;
        const min = priceFilter.min || 0;
        const max = priceFilter.max >= PRICE_MAX ? Infinity : priceFilter.max
        return price >= min && price <= max
      })
      .filter((item, i) => {
        let volume = item[5];
        let volumeFilter = self.state.filter.volume;
        const min = volumeFilter.min || 0;
        const max = volumeFilter.max >= (AVG_VOL_MAX * 1000) ? Infinity : volumeFilter.max
        return volume >= min && volume <= max;
      }).filter(item => {
        if (item[6]) {
          return dicSectors[item[6]]
        }
      });
  };

  flushBuffer = () => {
    if (this.state.freezed) {
      console.log('Flush buffer freezed');
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
    return parseFloat(value).toFixed(decimals);
  };

  getLast = (OTC, ticker) => {
    return OTC === 1 ? this.round(ticker, 4) : this.round(ticker, 2);
  };

  onAddQuote = () => {
    this.registerQuote(this.state.new_quote);
    this.setState({
      showAddQuote: false,
      new_quote: '',
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
    if (discoverySector === 'ALL') {
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
        aria-labelledby='example-modal-sizes-title-md'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <small className='text-light'> Add Quote</small>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <label>Symbol</label>
            <div className='input-group'>
              <div className='input-group-prepend'>
                <span className='input-group-text'>@</span>
              </div>
              <Form.Control
                type='text'
                className='form-control text-light'
                value={this.state.new_quote}
                onChange={(e) => {
                  this.setState({ new_quote: e.target.value });
                }}
              />
            </div>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <div className='footer-container'>
            <Button
              variant='success col-12'
              onClick={this.onAddQuote}
              className='btn btn-primary'
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
    if (type === 'low') {
      data.map((low, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push(
          // high[3] === 1 means Active
          <tr key={`render-stock-data-table-low-${index}`}>
            <td className='text-low flex-fill'>
              <label
                className={`stock-text ${
                  low[3] === 1 ? 'stock-active-text stock-active-low' : ''
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
                  className='stockwits'
                  src={require('../../assets/images/dashboard/stock-tweets.svg')}
                />
              )}
            </td>
            <td className='text-low flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger
                  id={`low-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {low[2]}
                </ContextMenuTrigger>
              </label>
            </td>
            <td className='text-low flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger
                  id={`low-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {`${this.round(this.getLast(low[6], low[1]), 2)}`}
                </ContextMenuTrigger>
              </label>
            </td>
          </tr>
        );

        /** Add Popover For this item */
        renderMenuItems.push(
          this.getMenuItems(`low-context-menu_${index}`, low, 'low')
        );
      });
    } else {
      data.map((high, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push(
          // high[3] === 1 means Active
          <tr key={`render-stock-data-table-high-${index}`}>
            <td className='text-high flex-fill'>
              <label
                className={`stock-text ${
                  high[3] === 1 ? 'stock-active-text stock-active-high' : ''
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
                  className='stockwits'
                  src={require('../../assets/images/dashboard/stock-tweets.svg')}
                />
              )}
            </td>
            <td className='text-high flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger
                  id={`high-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {high[2]}
                </ContextMenuTrigger>
              </label>
            </td>
            <td className='text-high flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger
                  id={`high-context-menu_${index}`}
                  holdToDisplay={0}
                >
                  {`${this.round(this.getLast(high[6], high[1]), 2)}`}
                </ContextMenuTrigger>
              </label>
            </td>
          </tr>
        );

        /** Add Popover For this item */

        renderMenuItems.push(
          this.getMenuItems(`high-context-menu_${index}`, high, 'high')
        );
      });
    }
    return (
      <div
        className={'col-md-6 tableFixHead nopadding' + (max ? 'table-max' : '')}
      >
        <table className='table table-striped'>
          <thead>
            <tr>
              <th className='text-white'>
                <div className={'th-item-wrapper'}> Symbol </div>
              </th>
              <th className='text-white'>
                <div className={'th-item-wrapper'}> Count </div>
              </th>
              <th className='text-white'>
                <div className={'th-item-wrapper'}> Last </div>
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
        <div key={'render-cards' + index} className='quote-card'>
          <div className='card p-1 overflow-hidden'>
            <div className='horizontal-quote-container card-padding container-padding'>
              <label className='mb-0 font-weight-bold font-20'>
                {item.symbol}
              </label>
              <div
                className='d-flex flex-row-reverse'
                onClick={() => {
                  this.onRemoveQuote(item);
                }}
              >
                <i className='mdi mdi-star quote-star' />
              </div>
            </div>
            <div className='horizontal-quote-container'>
              <label
                style={{
                  fontWeight: '600',
                  fontSize: '20px',
                  color: item.percent > 0 ? '#00d25b' : '#fc424a',
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
              <div className='vertical-quote-container'>
                <div className='no-wrap'>
                  <label className='quote-status-label'>H:</label>
                  <label className='font-14 dash-font-color ml-1'>
                    {`${this.round(item.high, 2)}`}
                  </label>
                </div>
                <div className='no-wrap'>
                  <label className='quote-status-label'>L:</label>
                  <label className='font-14 dash-font-color ml-1'>
                    {`${this.round(item.low, 2)}`}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className='bullets-section' />
        </div>
      );
    });

    return renderCards;
  };

  getMenuItems = (key, data, type) => {
    return (
      <ContextMenu id={key} className='p-0' key={`menu-item-${key}`}>
        <div className='context-menu-style'>
          <div className='mt-2' />
          <span>LINKS</span>
          <MenuItem
            data={{ data, type, domain: 'cnbc' }}
            onClick={this.onPopover}
          >
            <div className='row align-items-center mt-1'>
              <img
                className={'context-menu-item-icon-style'}
                src={require('../../assets/images/dashboard/cnbc.png')}
              />
              <span className='medium white-no-wrap bar-txt'>CNBC</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: 'marketwatch' }}
            onClick={this.onPopover}
          >
            <div className='row align-items-center mt-1'>
              <img
                className={'context-menu-item-icon-style'}
                src={require('../../assets/images/dashboard/marketwatch.png')}
              />
              <span className='medium white-no-wrap bar-txt'>MarketWatch</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: 'seekingalpha' }}
            onClick={this.onPopover}
          >
            <div className='row align-items-center mt-1'>
              <img
                className={'context-menu-item-icon-style'}
                src={require('../../assets/images/dashboard/seekingalpha.png')}
              />
              <span className='medium white-no-wrap bar-txt'>
                Seeking Alpha
              </span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: 'nasdaq' }}
            onClick={this.onPopover}
          >
            <div className='row align-items-center mt-1'>
              <i className='mdi mdi-chart-line-variant popover-icon context-menu-item-icon-style' />
              <span className='medium white-no-wrap bar-txt'>Nasdaq</span>
            </div>
          </MenuItem>
          <MenuItem
            data={{ data, type, domain: 'stocktwits' }}
            onClick={this.onPopover}
          >
            <div className='row align-items-center mt-1'>
              <img
                className={'context-menu-item-icon-style'}
                src={require('../../assets/images/dashboard/stocktwits.png')}
              />
              <span className='medium white-no-wrap bar-txt'>Stocktwits</span>
            </div>
          </MenuItem>
          <div className='mt-3' />
          <span>ACTIONS</span>
          <div className='row justify-content-between align-items-center'>
            <MenuItem
              data={{ data, type }}
              onClick={() => {
                this.registerAlert(
                  data[0],
                  'trade',
                  type === 'high' ? data[1] : 0,
                  type === 'low' ? data[1] : 0
                );
              }}
            >
              <div className='row justify-content-center align-items-center'>
                <i className='mdi mdi-bell text-white popover-icon' />
                <span className='ml-1'>Alert</span>
              </div>
            </MenuItem>
            <MenuItem
              data={{ data, type }}
              onClick={() => {
                this.registerQuote(data[0]);
              }}
            >
              <div className='row justify-content-center align-items-center'>
                <i className='mdi mdi-star text-white popover-icon' />
                <span className='ml-1'>Favorite</span>
              </div>
            </MenuItem>
          </div>
        </div>
      </ContextMenu>
    );
  };

  onPopover = async (e, data) => {
    window.open(
      API.getStockPageLink(`${data.domain}.com`, data.data[0]),
      '_blank'
    );
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
      if (e === 'SequelizeUniqueConstraintError: Validation error') {
        cogoToast.error(`${symbol} is already registered!`);
      } else {
        cogoToast.error(`Failed to mark ${symbol} as favorite!`);
      }
      this.setState({ showSpinner: false });
    }
  };

  registerAlert = async (symbol, type, high = 0, low = 0) => {
    const dic = {
      trade: 'Trade',
      uv: 'Unusual volume',
      vwap: 'vWapDist',
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
      if (e === 'SequelizeUniqueConstraintError: Validation error') {
        cogoToast.error(
          `${dic[type]} alert for ${symbol} is already registered!`
        );
      } else {
        cogoToast.error(`Failed to register ${dic[type]} alert for ${symbol}`);
      }
    }
  };

  onChangeSector = (discoverySector) => {
    console.info('onChnageSector - ', discoverySector);
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

  onSort = (field, sortType = 'up') => {
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
        sortOption.type === 'none'
          ? discoveryData
          : sortOption.type === 'up'
            ? sorted.reverse()
            : sorted,
    });
  };

  renderPopularData = (index) => {
    let data = [];
    const { popularData } = this.state;
    if (popularData[index]) {
      popularData[index].map((item, i) => {
        data.push(
          index === 0 ? (
            <div key={`popular-data-h3-${index + i}`}>
              <ContextMenuTrigger
                id={`popular-data-h3-${index + i}`}
                holdToDisplay={0}
              >
                <h4 className='pr-2'>{item}</h4>
              </ContextMenuTrigger>
              {this.getMenuItems(
                `popular-data-h3-${index + i}`,
                [item, '', '', '', '', ''],
                ''
              )}
            </div>
          ) : index === 1 ? (
            <div key={`popular-data-h4-${index + i}`}>
              <ContextMenuTrigger
                id={`popular-data-h4-${index + i}`}
                holdToDisplay={0}
              >
                <h5 className='pr-2'>{item}</h5>
              </ContextMenuTrigger>
              {this.getMenuItems(
                `popular-data-h4-${index + i}`,
                [item, '', '', '', '', ''],
                ''
              )}
            </div>
          ) : index === 2 ? (
            <div key={`popular-data-h5-${index + i}`}>
              <ContextMenuTrigger
                id={`popular-data-h5${index + i}`}
                holdToDisplay={0}
              >
                <h6 className='pr-2 '>{item}</h6>
              </ContextMenuTrigger>
              {this.getMenuItems(
                `popular-data-h5-${index + i}`,
                [item, '', '', '', '', ''],
                ''
              )}
            </div>
          ) : (
                  <div key={`popular-data-h6-${index + i}`}>
                    <ContextMenuTrigger
                      id={`popular-data-h6-${index + i}`}
                      holdToDisplay={0}
                    >
                      <h6 className='pr-2'>{item}</h6>
                    </ContextMenuTrigger>
                    {this.getMenuItems(
                      `popular-data-h6-${index + i}`,
                      [item, '', '', '', '', ''],
                      ''
                    )}
                  </div>
                )
        );
      });
    }
    return data;
  };

  renderAlertHistory = () => {
    let data = [];
    const { alertHistory } = this.state;
    alertHistory.map((item, index) => {
      data.push(
        <div key={`render-alert-history-${index}`}>
          <div className='d-flex flex-row flex-fill flex-wrap'>
            <div className='font-13 alert-history-color'>{item.msg}</div>
          </div>
          <div className='d-flex flex-row flex-fill alert-history-separator' />
        </div>
      );
    });
    return data;
  };

  isSorted = (field, type) =>
    this.state.discoverySort.field === field &&
    this.state.discoverySort.type === type;

  sortUI = (field) => (
    <div key={`discovery-sort-${field}`} className={'filter-icon-wrapper'}>
      <div
        style={{ display: 'inline-flex' }}
        onClick={() => {
          this.onSort(field, this.isSorted(field, 'up') ? 'none' : 'up');
        }}
      >
        <ArrowUp
          width={'10px'}
          height={'10px'}
          fill={this.isSorted(field, 'up') ? '#00d25b' : '#ffff'}
        />
      </div>
      <div
        style={{ display: 'inline-flex' }}
        onClick={() => {
          this.onSort(field, this.isSorted(field, 'down') ? 'none' : 'down');
        }}
      >
        <ArrowDown
          width={'10px'}
          height={'10px'}
          fill={this.isSorted(field, 'down') ? '#00d25b' : '#ffff'}
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
      <div>
        <Table className='table table-striped'>
          <Thead className='my-2 table-header'>
            <Tr>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    Symbol
                  </span>
                  {this.sortUI('symbol')}
                </div>
              </Th>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    Last
                  </span>
                  {this.sortUI('last')}
                </div>
              </Th>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    Volume
                  </span>
                  {this.sortUI('volume')}
                </div>
              </Th>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    Momentum
                  </span>
                  {this.sortUI('momentum')}
                </div>
              </Th>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    Unusual Vol
                  </span>
                  {this.sortUI('uVol')}
                </div>
              </Th>
              <Th className='th-item-style'>
                <div className={'th-item-wrapper'}>
                  <span style={{ marginRight: 8, alignSelf: 'center' }}>
                    vWapDist
                  </span>
                  {this.sortUI('vWapDist')}
                </div>
              </Th>
              <Th
                className='th-item-style'
              // onClick={() => {
              //   this.onFavPress();
              // }}
              >
                <span className={'th-item-wrapper'}>Actions</span>
                {/* <i className='fa fa-unsorted ml-2' /> */}
              </Th>
            </Tr>
          </Thead>

          {discoveryDataFiltered
            .slice(0, discoveryIndex)
            .map(
              (
                { symbol, last, volume, momentum, uVol, vWapDist, short },
                index
              ) => {
                return (
                  <Tbody key={index}>
                    <Tr
                      style={{
                        background: index % 2 === 0 ? '#00000' : '#191C24',
                      }}
                    >
                      <Td className='text-white flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div
                            style={{ cursor: 'pointer', fontSize: 18 }}
                            className='py-1'
                          >
                            <b>{symbol}</b>
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='text-white flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div style={{ cursor: 'pointer', fontSize: 18 }}>
                            {`$${this.round(last, 2)}`}
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='text-white flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div style={{ cursor: 'pointer', fontSize: 18 }}>
                            {volume.toString()}
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div
                            style={{ cursor: 'pointer', fontSize: 18 }}
                            className={
                              momentum < 0 ? 'text-danger' : 'text-success'
                            }
                          >
                            {momentum}
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div
                            style={{ cursor: 'pointer', fontSize: 18 }}
                            className={`${
                              uVol > 0
                                ? 'text-success'
                                : uVol < 0
                                  ? 'text-danger'
                                  : 'text-white'
                              }`}
                          >
                            {isNaN(uVol)
                              ? '_'
                              : (uVol > 0 ? '+' : '') + `${uVol}%`}
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='text-white flex-fill text-center'>
                        <ContextMenuTrigger
                          id={`discovery-context-menu_${index}`}
                          holdToDisplay={0}
                        >
                          <div
                            style={{ cursor: 'pointer', fontSize: 18 }}
                            className={`${
                              vWapDist > 0
                                ? 'text-success'
                                : vWapDist < 0
                                  ? 'text-danger'
                                  : 'text-white'
                              }`}
                          >
                            {(isNaN(vWapDist) || vWapDist == null)
                              ? '_'
                              : (vWapDist > 0 ? '+' : '') + `${vWapDist.toFixed(2)}%`}
                          </div>
                        </ContextMenuTrigger>
                        {this.getMenuItems(
                          `discovery-context-menu_${index}`,
                          [symbol, '', '', '', '', ''],
                          ''
                        )}
                      </Td>
                      <Td className='text-white'>
                        <div className='th-action-item-style'>
                          <MenuItem
                            onClick={() => {
                              this.registerAlert(
                                symbol,
                                'vwap',
                                vWapDist,
                                vWapDist
                              );
                              this.registerAlert(
                                symbol,
                                'uv',
                                vWapDist,
                                vWapDist
                              );
                            }}
                          >
                            <div className='row justify-content-center align-items-center'>
                              <i className='mdi mdi-bell text-white popover-icon' />
                            </div>
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              this.registerQuote(symbol);
                            }}
                          >
                            <div className='row'>
                              <i
                                className={`${
                                  this.isSymbolFav(symbol)
                                    ? 'mdi mdi-star quote-star popover-icon'
                                    : 'mdi mdi-star text-white popover-icon'
                                  }`}
                              />
                            </div>
                          </MenuItem>
                        </div>
                      </Td>
                    </Tr>
                  </Tbody>
                );
              }
            )}
        </Table>
        {(this.state.discoveryIndex < this.state.discoveryDataFiltered.length ||
          this.state.discoveryDataFiltered.length === 0) && (
            <Spinner
              className={'overlay-content'}
              style={{ margin: 8 }}
              animation='border'
              variant='success'
            />
          )}
      </div>
    );
  };

  renderStream = () => {
    const { isSmallDevice, lows, highs, max } = this.state;
    return (
      <div
        className={
          max
            ? 'w-100'
            : !this.state.showPopular && !this.state.showAlertHistory
              ? 'w-100'
              : 'grid-margin stretch-card px-0 flex-fill socket-table'
        }
      >
        <div className='card'>
          <div
            className='btn btn-icon btn-max'
            style={{ marginRight: 28, cursor: 'pointer' }}
            onClick={() => {
              this.setState({
                max: max ? null : 'stream',
              });
            }}
          >
            <i
              className={
                max ? 'mdi mdi-window-close' : 'mdi mdi-window-maximize'
              }
            />
          </div>
          {isSmallDevice ? (
            <div className='d-flex flex-row'>
              {this.renderData(lows, 'low')}
              {this.renderData(highs, 'high')}
            </div>
          ) : (
              <div className='card-body stream-body'>
                <div className='row'>
                  {this.renderData(lows, 'low')}
                  {this.renderData(highs, 'high')}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  renderDiscovery = () => {
    const { discoveryFilter, max } = this.state;

    return (
      <div className={max ? 'w-100' : 'd-flex flex-row data-section'}>
        <div className='col-12 px-0'>
          <div className='card'>
            <div style={{ flex: '1 1 auto', padding: '1rem' }}>
              <div className='row'>
                <div className='col-12 '>
                  <div className='d-flex flex-row justify-content-between text-center flex-wrap mb-2'>
                    <h4 className='card-title mb-1 py-1'>Discovery</h4>
                    <div className='d-flex flex-row mT15'>
                      <div className='search-bar-wrapper search-bar-wrapper-hover'>
                        <Dropdown varaint='btn btn-outline-secondary'>
                          <Dropdown.Toggle className='industry_input'>
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
                                  tabIndex='1'
                                >
                                  {sector}
                                </Dropdown.Item>
                              );
                            })}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      <div
                        className='search-bar-wrapper search-bar-wrapper-hover'
                        style={{
                          cursor: 'pointer',
                          padding: 16,
                          marginLeft: 8,
                        }}
                        onClick={this.onFavPress}
                      >
                        <i
                          className={`${
                            this.state.isFavFilter
                              ? 'mdi mdi-star quote-star popover-icon'
                              : 'mdi mdi-star text-white popover-icon'
                            }`}
                          style={{ alignSelf: 'center' }}
                        />
                        <span style={{ alignSelf: 'center', marginLeft: 4 }}>
                          Favorite
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <div
                        className='search-bar-wrapper search-bar-wrapper-hover'
                        style={{ marginRight: 40 }}
                      >
                        <input
                          className='search-bar'
                          placeholder='Symbol Search'
                          onChange={this.onChangeDiscoveryFilter}
                          ref={(ref) => {
                            this.refDiscoveryFilter = ref;
                          }}
                        />
                        <div className='search-icon-wrapper'>
                          <i
                            className='fa fa-search text-white'
                            style={{ cursor: 'default' }}
                          />
                        </div>
                      </div>
                      <div
                        className='btn btn-icon btn-max'
                        style={{ marginRight: 32, cursor: 'pointer' }}
                        onClick={() => {
                          this.setState(
                            {
                              max: max ? null : 'discovery',
                              discoveryIndex: 50,
                            },
                            () => {
                              window.scrollTo(0, 0);
                              document
                                .getElementById('discovery-table')
                                .addEventListener('scroll', this.handleScroll);
                            }
                          );
                        }}
                      >
                        <i
                          className={
                            max
                              ? 'mdi mdi-window-close'
                              : 'mdi mdi-window-maximize'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      (max ? 'discovery-max' : 'discovery-normal') +
                      ' discovery-table'
                    }
                    id='discovery-table'
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
    if (discoveryFilter === '') {
      this.setState({ discoveryNoDataText: 'Loading...' });
      discoveryDataFiltered = discoveryData
        .filter(this.favFilter)
        .filter(this.sectorFilter);
    } else {
      this.setState({ discoveryNoDataText: 'No Data' });
      discoveryDataFiltered = discoveryData
        .filter((data) => {
          return data.symbol?.includes(discoveryFilter);
        })
        .filter(this.favFilter)
        .filter(this.sectorFilter);
    }
    this.setState({ discoveryFilter, discoveryDataFiltered });
  };

  onToggleWidget = (name) => {
    this.setState({
      [name]: !this.state[name],
    });
  };

  render() {
    const {
      lows,
      highs,
      isSmallDevice,
      discoveryDataFiltered,
      discoveryFilter,
      discoveryNoDataText,
      max,
    } = this.state;
    if (max) {
      return (
        <div className='row dashboard-content'>
          {max === 'stream' && this.renderStream()}
          {max === 'discovery' && this.renderDiscovery()}
        </div>
      );
    }
    return (
      <div>
        {this.state.showSpinner && (
          <div className='overlay'>
            <Spinner
              className={'overlay-content'}
              animation='border'
              variant='success'
            />
          </div>
        )}
        <div
          className='row dashboard-content'
          ref={(ref) => {
            this.container = ref;
          }}
        >
          <div className='col-12 grid-margin stretch-card px-0'>
            <div className='col-12 card-body py-0 px-0'>
              {/** Static Bar */}

              <div className='d-flex justify-content-start flex-wrap static-bar pl-3'>
                <div
                  className={`d-flex flex-row align-items-center static-row ${
                    this.state.showStream ? 'showWidget' : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.onToggleWidget('showStream');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-speedometer text-primary' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>STREAM</span>
                </div>
                <div
                  className={`d-flex flex-row align-items-center static-row ${
                    this.state.showAlertHistory ? 'showWidget' : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.onToggleWidget('showAlertHistory');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-file-restore text-success' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>
                    ALERT HISTORY
                  </span>
                </div>
                <div
                  className={`d-flex flex-row align-items-center static-row ${
                    this.state.showMeters ? 'showWidget' : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.onToggleWidget('showMeters');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-crosshairs-gps text-warning' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>METERS</span>
                </div>
                <div
                  className={`d-flex flex-row align-items-center static-row  ${
                    this.state.showPopular ? 'showWidget' : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.onToggleWidget('showPopular');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-clipboard-text text-danger' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>POPULAR</span>
                </div>
                <div
                  className={`d-flex flex-row align-items-center static-row ${
                    this.state.showQuotes ? 'showWidget' : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.onToggleWidget('showQuotes');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-chart-bar text-primary' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>QUOTE</span>
                </div>

                <div
                  style={{ cursor: 'pointer' }}
                  className={`d-flex flex-row align-items-center static-row ${
                    this.props.isPro
                      ? this.state.showDiscovery
                        ? 'showWidget'
                        : 'hideWidget'
                      : 'hideWidget'
                    }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (this.props.isPro) this.onToggleWidget('showDiscovery');
                    else this.props.history.push('/plans');
                  }}
                >
                  <span className='bar-icon'>
                    <i className='mdi mdi-content-copy text-success' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>DISCOVERY</span>
                </div>
              </div>
              {this.state.showMeters && (
                <Meters
                  onClose={() => {
                    this.setState({
                      showMeters: false,
                    });
                  }}
                />
              )}
              {/** Favorite(Quote) Stocks */}
              {this.state.showQuotes && (
                <div className='quotes-area'>
                  <div className='quote-tools card'>
                    <a
                      onClick={() => {
                        this.setState({
                          showAddQuote: true,
                        });
                      }}
                    >
                      <i className='mdi mdi-plus cursor-pointer add-quoute-icon' />
                    </a>
                    {/* <a>
                      <i className='mdi mdi-chevron-down cursor-pointer add-quoute-icon' />
                    </a> */}
                  </div>
                  {this.renderAddQuoteModal()}

                  <Swiper {...params}>{this.renderQuoteCards()}</Swiper>
                </div>
              )}

              {/** Table | (Popular vs Alert History) */}
              <div className='d-flex flex-row data-section-small flex-wrap'>
                {this.state.showStream && this.renderStream()}

                <div className='d-flex grid-margin stretch-card flex-column pr-0 popular-table'>
                  {this.state.showPopular && (
                    <div className='card'>
                      <div style={{ flex: '1 1 auto', padding: '1rem' }}>
                        <div className='d-flex flex-row justify-content-between'>
                          <h4 style={{ marginBottom: '0px' }}>Popular</h4>
                        </div>
                        <div
                          style={{ marginLeft: '2rem', marginTop: '0.4rem', textTransform: 'uppercase' }}
                        >
                          <div className='d-flex flex-row flex-fill flex-wrap'>
                            {this.renderPopularData(0)}
                          </div>
                          <div className='d-flex flex-row flex-fill flex-wrap'>
                            {this.renderPopularData(1)}
                          </div>
                          <div className='d-flex flex-row flex-fill flex-wrap'>
                            {this.renderPopularData(2)}
                          </div>
                          <div className='d-flex flex-row flex-fill flex-wrap'>
                            {this.renderPopularData(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {this.state.showAlertHistory && this.state.showPopular && (
                    <div className='data-separator'></div>
                  )}
                  {this.state.showAlertHistory && (
                    <div className='card flex-fill'>
                      <div style={{ flex: '1 1 auto', padding: '1rem' }}>
                        <div className='d-flex flex-row justify-content-between'>
                          <h4 style={{ marginBottom: '0px' }}>Alert History</h4>
                        </div>
                        <div className='data-section'>
                          <div className='d-flex flex-row flex-fill alert-history-separator' />
                          <div className='alert-history-data'>
                            {this.renderAlertHistory()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/** Discovery */}

              {this.props.isPro &&
                this.state.showDiscovery &&
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
  isPro:
    state.auth.user.subscription.plan === 'pro_monthly' ||
    state.auth.user.subscription.plan === 'pro_semi_annual',
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
);
