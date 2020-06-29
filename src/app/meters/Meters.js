import React, { Component } from 'react'

import './meters.css'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const tiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const indexes = ['DOW', 'NAZ', 'SPY']
const empty = 'rgba(0, 0, 0, 0.2)'

const lowColors = [
  '#e13129',
  '#dd3729',
  '#d83b29',
  '#d5412a',
  '#d4422a',
  '#c84d28',
  '#c5552b',
  '#bf5c2c',
  '#ba642c',
  '#b46b2c',
  '#b46b2c',
  '#a6772b',
  '#a1822e',
  '#9c872d'
]

const highColors = [
  '#78752a',
  '#74792a',
  '#6f802b',
  '#647f23',
  '#658b2c',
  '#61912d',
  '#61912d',
  '#61912d',
  '#61912d',
  '#569f2d',
  '#4d9d25',
  '#4fa82e',
  '#4fa82e',
  '#4fa82e'
]

export default class Meters extends Component {

  constructor(props) {
    super(props)

    this.state = {
      bars: [0.9, -0.9, 0.5],
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
      if (value === -1) {
        highs[index] = 0
        lows[index] = 0
      } else if (value >= 0) {
        highs[index] = value
        lows[index] = 1 - value
      } else {
        lows[index] = -value
        highs[index] = 1 - lows[index]
      }
    })


    return {
      lows: lows.map((low) => (Math.ceil(low * tiles.length))),
      highs: highs.map((high) => (Math.floor(high * tiles.length)))
    }
  }

  render() {
    const { lows, highs } = this.getValues()

    return <div className='d-flex  card m-2 p-2' style={{ flex: 1, }}>
      <h4>MOMO Meters</h4>
      {
        indexes.map((name, i) => {
          return <div key={i} className='flex-row justify-content-center meters-body w-100'>
            <button
              type='button'
              className='btn btn-icon btn-max'
              onClick={this.props.onClose}
            >
              <i
                className='mdi mdi-window-close'
              />
            </button>
            <div className='meters-area'>
              {
                tiles.map((m, index) => {
                  const isEmpty = (tiles.length - index) > lows[i]
                  const opacityL = (tiles.length - index) / tiles.length * 0.9 + 0.1
                  const opacityR = (tiles.length - index - 1) / tiles.length * 0.9 + 0.1

                  return <div key={index} className='meters-tile'
                    style={{
                      background: isEmpty ? empty : `linear-gradient(90deg, ${lowColors[index]} 0%, ${lowColors[index + 1]} 100%)`
                    }}
                    key={`${name}_low:${index}`}
                  >
                  </div>
                })
              }
            </div>
            <div className='meters-type'>
              <div>{name}</div>
            </div>
            <div className='meters-area'>
              {
                tiles.map((m, index) => {
                  const isEmpty = index >= highs[i]

                  const opacityL = (index + 1) / tiles.length * 0.9 + 0.1
                  const opacityR = index / tiles.length * 0.9 + 0.1

                  return <div key={index} className='meters-tile'
                    style={{
                      background: isEmpty ? empty : `linear-gradient(90deg, ${highColors[index]} 0%, ${highColors[index + 1]} 0%)`
                    }}
                  />
                })
              }
            </div>
          </div>
        })
      }
    </div>
  }
}