import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import API from '../api';
import cogoToast from 'cogo-toast';
import Swiper from 'react-id-swiper';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import * as _ from 'lodash'
import { withTranslation } from 'react-i18next';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { Form, Button, Modal } from "react-bootstrap";

import './dashboard.css';
import 'swiper/css/swiper.css';
import { AuthActions } from '../store';

let filter = {
  category: [
    {
      name: 'Basic industries',
      value: 'basic-industries',
      subscribed: true
    },
    { name: 'Capital goods', value: 'capital-goods', subscribed: true },
    { name: 'Consumer goods', value: 'consumer-goods', subscribed: true },
    {
      name: 'Consumer services',
      value: 'consumer-services',
      subscribed: true
    },
    { name: 'Energy', value: 'energy', subscribed: true },
    { name: 'Finance', value: 'finance', subscribed: true },
    { name: 'Health Care', value: 'health-care', subscribed: true },
    {
      name: 'Public utilities',
      value: 'public-utilities',
      subscribed: true
    },
    { name: 'Technology', value: 'technology', subscribed: true },
    { name: 'Transportation', value: 'transportation', subscribed: true },
    { name: 'Miscellaneous', value: 'miscellaneous', subscribed: true },
    { name: 'OTC', value: 'otc', subscribed: false }
  ],
  price: { min: 0, max: 2000 },
  volume: { min: 0, max: 200000000 }
};

const params = {
  slidesPerView: 'auto',
  spaceBetween: 20,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  }
}

export class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
    this.updateDimensions();
    const handler = e => this.setState({ isSmallDevice: e.matches });
    window.matchMedia('(max-width: 767px)').addListener(handler);
    this.listenTrade();
    this.buffer = [];
    this.flushBufferIntervalId = setInterval(this.flushBuffer, 2000);
    // this.requestNotificationPermissions().then(r => {});

    this.getStats();
    this.statsTimer = setInterval(() => {
      this.getStats()
    }, 3 * 60 * 1000) // Update Every 3 minutes

    this.getPopularData();
    this.getAlertHistory();
    this.getQuotes();

    document.getElementById('discovery-table').addEventListener('scroll', this.handleScroll);
  }


  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  getScrollPercent() {
    const h = document.getElementById('discovery-table'),
      b = document.body,
      st = 'scrollTop',
      sh = 'scrollHeight';
    return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
  }

  handleScroll = (e) => {
    // console.info('Scroll Precent:', this.getScrollPercent())
    if (this.getScrollPercent() === 100) {
      const { discoveryIndex } = this.state
      this.setState({
        discoveryIndex: discoveryIndex + 5
      })
    }
  }

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
    const total = Math.ceil((this.container.offsetWidth - restSpace - 160) / 20);
    this.setState({ total });
  }

  componentWillUnmount() {
    if (this.flushBufferIntervalId) {
      console.log('clearInterval for flushBufferIntervalId');
      clearInterval(this.flushBufferIntervalId);
    }
    clearInterval(this.statsTimer)
  }

  getStats = async () => {
    const stats = await API.getStats()

    const discoveryData = stats.map((stock, index) => ({
      symbol: stock.symbol,
      last: stock.lastTradePrice || 0,
      volume: stock.avgVolume || 0, // No Volume
      momentum: stock.highCount - stock.lowCount,
      uVol: parseFloat(stock.UV.toFixed(2)) || 0,
      vWapDist: stock.VWAP_DIST || 0,
      // short: '25%',
    }))

    this.setState({
      stats,
      discoveryData,
      discoveryDataFiltered: discoveryData
    })
  }

  getPopularData = () => {
    API.getPopular().then(popular => {
      let { popularData } = this.state;
      popularData.push(popular[0], popular[1], popular[2], popular[3]);
      this.setState({ popularData });
    }).catch(error => {
      console.info(error);
    })
  }

  getAlertHistory = () => {
    API.getAlertHistory().then(alertHistory => {
      this.setState({ alertHistory });
    }).catch(error => {
      console.info(error);
    })
  }

  getQuotes = async () => {
    try {
      const quotes = await API.getQuotes()
      if (Array.isArray(quotes)) {
        this.setState({
          quotes
        })
      }
    } catch (e) {
      cogoToast.error('Failed to get favorite stocks!')
    }
  }

  getInitialState = () => {
    let data_filter = localStorage.getItem('filter');
    if (data_filter) {
      try {
        let cached_filter = JSON.parse(data_filter);

        filter.category.forEach((item, i, arr) => {
          let cached_item = cached_filter.category.find(
            a => a.value === item.value
          );
          console.log('CACHED', cached_item);
          if (cached_item && item.subscribed !== cached_item.subscribed) {
            arr[i].subscribed = cached_item.subscribed;
          }
        });

        filter['price'] = cached_filter.price;
        filter['volume'] = cached_filter.volume || filter.volume;
        localStorage.setItem('filter', JSON.stringify(filter));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('filter', JSON.stringify(filter));
    }

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
        reverse: true
      },
      max: false,
      new_quote: '',
      showAddQuote: false
    };
  };

  listenTrade = () => {
    let data_filter = localStorage.getItem('filter');
    if (!data_filter || !data_filter.category) {
      data_filter = filter;
    }

    window.addEventListener('compressedUpdate', (event) => {
      console.info('compressedUpdate - ', event.detail)
      this._handleData(event.detail)
    }, false)
    // this.subscribeChannels(data_filter.category);
  };

  _handleData = data => {
    // console.info('compressedUpdate:', data)
    let msg = data[0];
    let highs = msg[1];
    let lows = msg[2];

    if ('DISABLED' in window) {
      return false;
    }

    lows = this.applyPriceFilter(lows);
    highs = this.applyPriceFilter(highs);

    if (lows.length + highs.length > 0) {
      if (this.buffer.length > 200) {
        this.buffer = [];
        console.error('Buffer too big, truncating');
      }
      this.buffer.push({ highs, lows });
      if (this.buffer.length > 1000) {
        this.buffer.shift()
      }
    }
  };

  subscribeChannels = channels => {
    channels.forEach(c => {
      if (c.subscribed === true) this.socket.emit('subscribe', c.value);
      else this.socket.emit('unsubscribe', c.value);
    });
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
        // console.log('AVG VOLUME', volume, item[0]);
        let volumeFilter = self.state.filter.volume;
        volumeFilter.min = volumeFilter.min || 0;
        volumeFilter.max = volumeFilter.max || 200000000;
        return volume >= volumeFilter.min && volume <= volumeFilter.max;
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
    console.log('flush buffer');
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
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  };

  getLast = (OTC, ticker) => {
    return OTC === 1 ? this.round(ticker, 4) : this.round(ticker, 2);
  };

  onAddQuote = () => {
    console.info('Add Quote:', this.state.new_quote)
    this.registerQuote(this.state.new_quote)
    this.setState({
      showAddQuote: false,
      new_quote: ''
    })
  }

  renderAddQuoteModal = () => {
    return <Modal
      show={this.state.showAddQuote}
      onHide={() => { this.setState({ showAddQuote: false }) }}
      aria-labelledby="example-modal-sizes-title-md"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <small className="text-light"> Add Quote</small>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body><Form.Group>
        <label>Symbol</label>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">@</span>
          </div>
          <Form.Control type="text" className="form-control text-light" value={this.state.new_quote} onChange={(e) => { this.setState({ new_quote: e.target.value }) }} />
        </div>
      </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <div className="footer-container">
          <Button variant="success col-12" onClick={this.onAddQuote} className="btn btn-primary">
            Add
            </Button>
        </div>
        {/*<Button variant="light m-2" onClick={() => { this.setState({ showCardInput: false }) }}>Cancel</Button>*/}
      </Modal.Footer>
    </Modal>

  }

  renderData = (data, type) => {
    const { isSmallDevice, max } = this.state;
    let renderData = [];
    let renderMenuItems = [];
    if (type === 'low') {
      data.map((low, index) => {
        /** Cover Table Cell With Popover Trigger */
        renderData.push( // high[3] === 1 means Active
          <tr key={`render-stock-data-table-low-${index}`}>
            <td className='text-low flex-fill'>
              <label className={`stock-text ${low[3] === 1 ? 'stock-active-text stock-active-low' : ''}`}>
                <ContextMenuTrigger id={`low-context-menu_${index}`} holdToDisplay={0}>
                  {low[0]}
                </ContextMenuTrigger>
              </label>
              {
                low[4] === 1 &&
                <img
                  className='stockwits'
                  src={require('../../assets/images/dashboard/stock-tweets.svg')}
                />
              }
            </td>
            <td className='text-low flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger id={`low-context-menu_${index}`} holdToDisplay={0}>
                  {low[2]}
                </ContextMenuTrigger>
              </label>
            </td>
            <td className='text-low flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger id={`low-context-menu_${index}`} holdToDisplay={0}>
                  {this.getLast(low[6], low[1])}
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
        renderData.push( // high[3] === 1 means Active
          <tr key={`render-stock-data-table-high-${index}`}>
            <td className='text-high flex-fill'>
              <label className={`stock-text ${high[3] === 1 ? 'stock-active-text stock-active-high' : ''}`}>
                <ContextMenuTrigger id={`high-context-menu_${index}`} holdToDisplay={0}>
                  {high[0]}
                </ContextMenuTrigger>
              </label>
              {
                high[4] === 1 &&
                <img
                  className='stockwits'
                  src={require('../../assets/images/dashboard/stock-tweets.svg')}
                />
              }
            </td>
            <td className='text-high flex-fill'>
              <label className='stock-text'>
                <ContextMenuTrigger id={`high-context-menu_${index}`} holdToDisplay={0}>
                  {high[2]}
                </ContextMenuTrigger>
              </label>
            </td>
            <td className='text-high flex-fill'>

              <label className='stock-text'>
                <ContextMenuTrigger id={`high-context-menu_${index}`} holdToDisplay={0}>
                  {this.getLast(high[6], high[1])}
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
      <div className={'col-md-6 tableFixHead ' + (max ? 'table-max' : '')}>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th className='text-white'>
                <div className='stock-header-text'> SYMBOL </div>
              </th>
              <th className='text-white'>
                <div className='stock-header-text'> COUNT </div>
              </th>
              <th className='text-white'>
                <div className='stock-header-text'> LAST </div>
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
          <div className='card p-1'>
            <div className='d-flex flex-row-reverse' onClick={() => { this.onRemoveQuote(item) }}>
              <i className='mdi mdi-star quote-star'></i>
            </div>
            <div className='d-flex flex-row justify-content-between mt-2 pl-3 pr-3'>
              <div className='d-flex align-items-center align-self-start'>
                <label className='mb-0 font-weight-bold font-20'>
                  ${item.price}
                </label>
                <label className={`${item.percent > 0 ? 'text-success' : (item.percent == 0 ? 'text' : 'text-danger')} ml-2 mb-0 font-10`}>
                  {item.percent}%
                        </label>
              </div>
              <div className={`icon ${item.percent > 0 ? 'icon-box-success' : 'icon-box-danger'} img-30 ml-5`}>
                {item.percent != 0 &&
                  <span className={`mdi ${item.percent > 0 ? 'mdi-arrow-top-right' : 'mdi-arrow-bottom-right'} icon-item font-15`} />
                }
              </div>
            </div>
            <div className='d-flex flex-row justify-content-between pl-3 pr-3 mt-1'>
              <label className='font-15 dash-font-color'>{item.symbol}</label>
              <div className='d-flex flex-row mt-1'>
                <label className='font-13 white-color'>H:</label>
                <label className='font-13 dash-font-color ml-1'>
                  {item.high}
                </label>
              </div>
              <div className='d-flex flex-row mt-1'>
                <label className='font-13 white-color'>L:</label>
                <label className='font-13 dash-font-color ml-1'>
                  {item.low}
                </label>
              </div>
            </div>
          </div>
          <div className='bullets-section' />
        </div>
      )
    })
    return renderCards;
  }

  getMenuItems = (key, data, type) => {
    return (
      <ContextMenu id={key} className='p-0' key={`menu-item-${key}`}>
        <div className='bg-dark px-3 py-1'>
          <div className='mt-2' />
          <span>LINKS</span>
          <MenuItem data={{ data, type, domain: 'cnbc.com' }} onClick={this.onPopover}>
            <div className='row align-items-center mt-1'>
              <img src={require('../../assets/images/dashboard/cnbc.png')} />
              <span className='medium white-no-wrap bar-txt'>cnbc.com</span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type, domain: 'marketwatch.com' }} onClick={this.onPopover}>
            <div className='row align-items-center mt-1'>
              <img src={require('../../assets/images/dashboard/marketwatch.png')} />
              <span className='medium white-no-wrap bar-txt'>
                marketwatch.com
              </span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type, domain: 'seekingalpha.com' }} onClick={this.onPopover}>
            <div className='row align-items-center mt-1'>
              <img src={require('../../assets/images/dashboard/seekingalpha.png')} />
              <span className='medium white-no-wrap bar-txt'>
                seekingalpha.com
              </span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type, domain: 'nasdaq.com' }} onClick={this.onPopover}>
            <div className='row align-items-center mt-1'>
              <i className='mdi mdi-chart-line-variant text-white popover-icon' />
              <span className='medium white-no-wrap bar-txt'>nasdaq.com</span>
            </div>
          </MenuItem>
          <MenuItem data={{ data, type, domain: 'stocktwits.com' }} onClick={this.onPopover}>
            <div className='row align-items-center mt-1'>
              <img src={require('../../assets/images/dashboard/stocktwits.png')} />
              <span className='medium white-no-wrap bar-txt'>
                stocktwits.com
              </span>
            </div>
          </MenuItem>
          <div className='mt-3' />
          <span>ACTIONS</span>
          <div className='row justify-content-between align-items-center'>
            <MenuItem data={{ data, type }} onClick={() => {
              this.registerAlert(data[0], 'trade', type === 'high' ? data[1] : 0, type === 'low' ? data[1] : 0)
            }}>
              <div className='row justify-content-center align-items-center'>
                <i className='mdi mdi-bell text-white popover-icon' />
                <span className='ml-1'>Alert</span>
              </div>
            </MenuItem>
            <MenuItem data={{ data, type }} onClick={() => {
              this.registerQuote(data[0])
            }}>
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
    window.open(API.getStockPageLink(data.domain, data.data[0]), '_blank');
  };

  onRemoveQuote = async ({ symbol }) => {
    console.info('onRemoveQuote')
    try {
      const result = await API.deleteQuote(symbol)
      if (result && result.success) {
        this.setState({
          quotes: result.data
        })
      }
    } catch (e) {
      cogoToast.error(`Failed to remove ${symbol} from favorites!`)
    }
  };

  registerQuote = async (symbol) => {
    console.info('registerQuote', symbol)
    try {
      const result = await API.registerQuote(symbol)
      if (result && result.success && result.data) {
        cogoToast.success(`Quote added for ${symbol}`)
        this.setState({
          quotes: result.data
        })
      } else if (result && result.error) {
        throw result.error
      }
    } catch (e) {
      if (e === 'SequelizeUniqueConstraintError: Validation error') {
        cogoToast.error(`${symbol} is already registered!`)
      } else {
        cogoToast.error(`Failed to mark ${symbol} as favorite!`)
      }
    }
  }

  registerAlert = async (symbol, type, high = 0, low = 0) => {
    console.info('registerAlert:', symbol, type, high, low);
    const dic = {
      trade: 'Trade',
      uv: 'Unusual volume',
      vwap: 'vWapDist'
    }
    try {
      const result = await API.addAlert({
        category: symbol,
        rate: 0,
        high,
        low,
        type
      })
      if (result && result.success) {
        cogoToast.success(`${dic[type]} alert added for ${symbol}`);
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

  // requestNotificationPermissions = async () => {
  //   const registration_id = await firebase.messaging().getToken();
  //   if (registration_id) {
  //     this.registerPushToken(registration_id);
  //   } else {
  //     alert(
  //       'Please allow push notification permissions in the browser settings!'
  //     );
  //   }
  // };
  //
  // registerPushToken = async registration_id => {
  //   try {
  //     const res = await fetch(`${baseUrl}/api/alert/device/fcm`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         registration_id
  //       }),
  //       headers: {
  //         Authorization: `Bearer ${window.localStorage.getItem(
  //           'jwt_access_token'
  //         )}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     const data = await res.json();
  //     console.info('Push Token Registered:', data);
  //   } catch (e) {
  //     console.error('Failed to register the push token', e);
  //   }
  // };

  onIndustry = () => {
  }

  onSort = (field) => {
    const { discoverySort, discoveryDataFiltered } = this.state
    const sortOption = {
      field,
      reverse: false
    }
    if (discoverySort.field === field) {
      sortOption.reverse = !discoverySort.reverse
    } else {
      sortOption.reverse = false
    }

    const sorted = _.sortBy(discoveryDataFiltered, field)

    this.setState({
      discoverySort: sortOption,
      discoveryIndex: 50,
      discoveryDataFiltered: sortOption.reverse ? sorted.reverse() : sorted
    })
  }

  renderMeters = (type) => {
    const { bars, total } = this.state;
    const statClass = 'statsbar ' + type;
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
        let carreClass = 'petitCarre-';
        if (active) {
          carreClass = carreClass + 'active'
          if (type == 'highs') {
            carreClass = carreClass + '-high'
          }
        } else {
          carreClass = carreClass + 'inactive'
        }
        carres.push(
          <div className={carreClass} key={o}></div>
        )
      }

      if (type == 'highs') {
        carres = carres.reverse();
      }

      divs.push(
        <div className='d-flex carreContainer' key={i}>{carres}</div>
      );
    }

    return (
      <div className={statClass}>
        {divs.reverse()}
      </div>
    )
  }

  renderPopularData = (index) => {
    let data = [];
    const { popularData } = this.state;
    if (popularData[index]) {
      popularData[index].map((item, i) => {
        data.push(
          index === 0 ?
            <h3 key={`popular-data-${index}-${i}`} className='pr-2'>{item}</h3>
            :
            index === 1 ?
              <h4 key={`popular-data-${index}-${i}`} className='pr-2'>{item}</h4>
              :
              index === 2 ?
                <h5 key={`popular-data-${index}-${i}`} className='pr-2'>{item}</h5>
                :
                <h6 key={`popular-data-${index}-${i}`} className='pr-2'>{item}</h6>
        )
      })
    }
    return data;
  }

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
      )
    })
    return data;
  }

  renderDiscoveryTableResponsive = () => {
    const { discoveryDataFiltered, discoveryNoDataText, discoveryIndex } = this.state;

    return (
      <Table>
        <Thead className='my-2 table-header'>
          <Tr>
            <Th className='py-2' onClick={() => { this.onSort('symbol') }}>
              <span>Symbols</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            <Th className='py-2' onClick={() => { this.onSort('last') }}>
              <span>Last</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            <Th className='py-2' onClick={() => { this.onSort('volume') }}>
              <span>Volume</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            <Th className='py-2' onClick={() => { this.onSort('momentum') }}>
              <span>Momentum</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            <Th className='py-2' onClick={() => { this.onSort('uVol') }}>
              <span>Unusual Vol</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            <Th className='py-2' onClick={() => { this.onSort('vWapDist') }}>
              <span>vWapDist</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
            { /*<Th className='py-2' onClick={() => { this.onSort('short') }}>
              <span>Short %</span>
              <i className='fa fa-unsorted ml-2' />
    </Th>*/}
            <Th>
              <span>Actions</span>
              <i className='fa fa-unsorted ml-2' />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {
            discoveryDataFiltered.slice(0, discoveryIndex).map(({
              symbol, last, volume, momentum, uVol, vWapDist, short
            }, index) => {
              return <Tr key={index}>
                <Td><div className='py-1'><b>{symbol}</b></div></Td>
                <Td>{last}</Td>
                <Td>{volume.toString()}</Td>
                <Td><div className={momentum < 0 ? 'text-danger' : 'text-success'}>{momentum}</div></Td>
                <Td>
                  <div
                    className={`${uVol > 0 ? 'text-success' : (uVol < 0 ? 'text-danger' : 'text-secondary')}`}>
                    {isNaN(uVol) ? '_' : ((uVol > 0 ? '+' : '') + `${uVol}%`)}
                  </div>
                </Td>
                <Td>
                  <div
                    className={`${vWapDist > 0 ? 'text-success' : (vWapDist < 0 ? 'text-danger' : 'text-secondary')}`}>
                    {isNaN(vWapDist) ? '_' : ((vWapDist > 0 ? '+' : '') + `${vWapDist}%`)}
                  </div>
                </Td>
                { /*<Td>{short}</Td>*/}
                <Td>
                  <div className='row text-center'>
                    <MenuItem onClick={() => {
                      this.registerAlert(symbol, 'vwap', vWapDist, vWapDist)
                      this.registerAlert(symbol, 'uv', vWapDist, vWapDist)
                    }}>
                      <div className='row justify-content-center align-items-center'>
                        <i className='mdi mdi-bell text-white popover-icon' />
                      </div>
                    </MenuItem>
                    <MenuItem onClick={() => {
                      this.registerQuote(symbol)
                    }}>
                      <div className='row justify-content-center align-items-center'>
                        <i className='mdi mdi-star text-white popover-icon' />
                      </div>
                    </MenuItem>
                  </div>
                </Td>
              </Tr>
            })
          }
        </Tbody>
      </Table>
    )
  }

  renderStream = () => {
    const { isSmallDevice, lows, highs, max } = this.state
    return <div className={max ? 'w-100' : 'grid-margin stretch-card px-0 flex-fill socket-table'}>
      <div className='card'>
        <div>
          <button type='button' className='btn btn-icon btn-max' onClick={() => {
            this.setState({
              max: max ? null : 'stream'
            })
          }}>
            <i className={max ? 'mdi mdi-window-close' : 'mdi mdi-window-maximize'} />
          </button>
        </div>
        {
          isSmallDevice ?
            <div className='d-flex flex-row'>
              {this.renderData(lows, 'low')}
              {this.renderData(highs, 'high')}
            </div>
            :
            <div className='card-body'>
              <div className='row'>
                {this.renderData(lows, 'low')}
                {this.renderData(highs, 'high')}
              </div>
            </div>
        }
      </div>
    </div>
  }

  renderDiscovery = () => {
    const { discoveryFilter, max } = this.state;

    return <div className={max ? 'w-100' : 'd-flex flex-row data-section'} >
      <div className='col-12 px-0'>
        <div>
          <button type='button' className='btn btn-icon btn-max' onClick={() => {
            this.setState({
              max: max ? null : 'discovery',
              discoveryIndex: 50
            }, () => {
              window.scrollTo(0, 0)
              document.getElementById('discovery-table').addEventListener('scroll', this.handleScroll);
            })
          }}>
            <i className={max ? 'mdi mdi-window-close' : 'mdi mdi-window-maximize'} />
          </button>
        </div>
        <div className='card'>
          <div className='card-body'>
            <div className='row'>
              <div className='col-12 '>
                <div className='d-flex flex-row justify-content-between text-center flex-wrap py-2'>
                  <h4 className='card-title mb-1 py-1'>Discovery</h4>
                  <div className='d-flex flex-row mT15'>
                    <span className='border border-radius-10'>
                      <div className='button btn-dark px-4 py-1 border-radius-10' onClick={this.onIndustry}>
                        Industry
                      </div>
                    </span>
                    <span className='border border-radius-10 ml-4'>
                      <div className='button btn-dark px-4 py-1 border-radius-10'>
                        Favorites
                        </div>
                    </span>
                  </div>
                  <input
                    className='input p-0 text-center bg-dark white-color input-border'
                    placeholder='Symbol Search'
                    onChange={this.onChangeDiscoveryFilter}
                    ref={ref => { this.refDiscoveryFilter = ref; }}
                    value={discoveryFilter}
                  />
                </div>
                <div className={(max ? 'discovery-max' : 'discovery-normal') + ' discovery-table'} id='discovery-table'>
                  {this.renderDiscoveryTableResponsive()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  }

  onChangeDiscoveryFilter = () => {
    const discoveryFilter = this.refDiscoveryFilter.value.toUpperCase();
    const { discoveryData } = this.state;
    let discoveryDataFiltered = [];
    if (discoveryFilter === '') {
      this.setState({ discoveryNoDataText: 'Loading...' });
      discoveryDataFiltered = discoveryData;
    } else {
      this.setState({ discoveryNoDataText: 'No Data' });
      discoveryData.map(data => {
        if (data.symbol) {
          if (data.symbol.includes(discoveryFilter)) {
            discoveryDataFiltered.push(data);
          }
        }
      })
    }
    this.setState({ discoveryFilter, discoveryDataFiltered });
  }

  onToggleWidget = (name) => {
    return () => {
      this.setState({
        [name]: !this.state[name]
      })
    }
  }

  render() {
    const { lows, highs, isSmallDevice, discoveryDataFiltered, discoveryFilter, discoveryNoDataText, max } = this.state;
    if (max) {
      return <div className='row dashboard-content'>
        {max === 'stream' && this.renderStream()}
        {max === 'discovery' && this.renderDiscovery()}
      </div>
    }
    return (
      <div>
        <div className='row dashboard-content' ref={ref => { this.container = ref; }}>
          <div className='col-12 grid-margin stretch-card px-0'>
            <div className='col-12 card-body py-0 px-0'>

              {/** Static Bar */}
              <div className='d-flex align-content-start flex-wrap static-bar mt-3'>
                <div className={`d-flex flex-row align-items-center static-row ${this.state.showStream ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showStream')}>
                  <span className='bar-icon'>
                    <i className='mdi mdi-speedometer text-primary' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>STREAM</span>
                </div>
                <div className={`d-flex flex-row align-items-center static-row ${this.state.showAlertHistory ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showAlertHistory')}>
                  <span className='bar-icon'>
                    <i className='mdi mdi-file-restore text-success' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>
                    ALERT HISTORY
                  </span>
                </div>
                <div className={`d-flex flex-row align-items-center static-row ${this.state.showMeters ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showMeters')}>
                  <span className='bar-icon'>
                    <i className='mdi mdi-crosshairs-gps text-warning' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>METERS</span>
                </div>
                <div className={`d-flex flex-row align-items-center static-row  ${this.state.showPopular ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showPopular')}>
                  <span className='bar-icon'>
                    <i className='mdi mdi-clipboard-text text-danger' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>POPULAR</span>
                </div>
                <div className={`d-flex flex-row align-items-center static-row ${this.state.showQuotes ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showQuotes')}>
                  <span className='bar-icon'>
                    <i className='mdi mdi-chart-bar text-primary' />
                  </span>
                  <span className='small white-no-wrap bar-txt'>QUOTE</span>
                </div>
                {this.props.isPro &&
                  <div className={`d-flex flex-row align-items-center static-row ${this.state.showDiscovery ? 'showWidget' : 'hideWidget'}`} onClick={this.onToggleWidget('showDiscovery')}>
                    <span className='bar-icon'>
                      <i className='mdi mdi-content-copy text-success' />
                    </span>
                    <span className='small white-no-wrap bar-txt'>DISCOVERY</span>
                  </div>
                }
              </div>

              {/** Favorite(Quote) Stocks */}
              {this.state.showQuotes && <div className='quotes-area'>
                <div className='quotes'>
                <Swiper {...params}>
                  {this.renderQuoteCards()}
                </Swiper>
                </div>
                <div className='quote-tools card'>
                  <a><i className='mdi mdi-plus cursor-pointer add-quoute-icon'/></a>
                  <a><i className='mdi mdi-chevron-down cursor-pointer add-quoute-icon'/></a>
                </div>

                {this.renderAddQuoteModal()}
                <div className="text-center">
                  <a className="link add-quote" onClick={() => {
                    this.setState({
                      showAddQuote: true
                    })
                  }}>
                    <small>Add Quote</small>
                  </a>
                </div>
              </div>}

              {/** Table | (Popular vs Alert History) */}
              <div className='d-flex flex-row data-section-small flex-wrap'>
                {
                  this.state.showStream &&
                  this.renderStream()
                }

                <div className='d-flex grid-margin stretch-card flex-column pr-0 popular-table'>

                  {this.state.showPopular && <div className='card'>
                    <div className='card-body'>
                      <div className='d-flex flex-row justify-content-between'>
                        <h4 className='card-title mb-1'>Popular</h4>
                        <p className='text-muted mb-1' />
                      </div>
                      <div className='column mt-3'>
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
                  }
                  {(this.state.showAlertHistory && this.state.showPopular) && <div className='data-separator'></div>}
                  {this.state.showAlertHistory &&
                    <div className='card flex-fill'>
                      <div className='card-body'>
                        <div className='d-flex flex-row justify-content-between'>
                          <h4 className='card-title mb-1'>Alert History</h4>
                          <p className='text-muted mb-1' />
                        </div>
                        <div className='data-section'>
                          <div className='d-flex flex-row flex-fill alert-history-separator' />
                          <div className='alert-history-data'>
                            {this.renderAlertHistory()}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              {/** Discovery */}
              {(this.props.isPro && this.state.showDiscovery) &&
                this.renderDiscovery()
              }

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
  isPro: state.auth.user.subscription.plan === 'pro_monthly' || state.auth.user.subscription.plan === 'pro_semi_annual'
});

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard))
);
