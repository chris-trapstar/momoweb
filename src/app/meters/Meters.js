import React, { Component } from 'react'

import './meters.css'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const tiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const indexes = ['DOW', 'NAZ', 'SPY']

export default class Meters extends Component {

  constructor(props) {
    super(props)

    this.state = {
      bars: [1, 0.6, -1],
      total: isMobile ? 5 : 10,
      gradients: [
        ['#bd19d6', '#ea7d10'],
        ['#ff2121', '#25c668'],
      ]
    }
  }
  getRandomArbitrary = (min, max) => {
    return Math.random() * (max - min) + min;
  };
  _updateStatusBar = bars => {
    bars = bars
      ? bars
      : [
        this.getRandomArbitrary(-1, 1),
        this.getRandomArbitrary(-1, 1),
        this.getRandomArbitrary(-1, 1)
      ];
    console.info('Status Bars:', bars)
    this.setState({
      bars: bars
    });
  };

  _handleData = data => {
    // console.info('compressedUpdate:', data)
    let msg = data[0];

    try {
      this._updateStatusBar([
        msg[0][1], // dow
        msg[0][0], // nasdaq
        msg[0][2] // spy
      ]);
    } catch (e) {
      console.error('_updateStatusBar', e);
    }
  };

  onCompressedUpdate = (event) => {
    this._handleData(event.detail)
  }

  componentDidMount() {
    window.addEventListener('compressedUpdate', this.onCompressedUpdate, false)
  }

  componentWillUnmount() {
    window.removeEventListener('compressedUpdate', this.onCompressedUpdate)
  }

  getValues = () => {
    const { bars } = this.state
    const lows = []
    const highs = []
    bars.forEach((value, index) => {
      if (value >= 0) {
        highs[index] = value
        lows[index] = 1 - value
      } else {
        lows[index] = -value
        highs[index] = 1 - lows[index]
      }
    })
    return { lows, higs }
  }

  render() {


    return <div className='d-flex  card m-2 p-2' style={{ flex: 1, }}>
      <h4>MOMO Meters</h4>
      {
        indexes.map((name) => {
          return <div className='flex-row justify-content-center meters-body w-100'>
            <div className='meters-area'>
              {
                tiles.map((m, index) => {
                  return <div className='meters-tile'></div>
                })
              }
            </div>
            <div className='meters-type'>
              <div>{name}</div>
            </div>
            <div className='meters-area'>
              {
                tiles.map((m, index) => {
                  return <div className='meters-tile'></div>
                })
              }
            </div>
          </div>
        })
      }
    </div>
  }
}