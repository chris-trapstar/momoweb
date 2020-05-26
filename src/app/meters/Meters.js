import React, { Component } from 'react'

import './meters.css'

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

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
    this.setState({
      bars: bars
    });
  };

  _handleData = data => {
    // console.info('compressedUpdate:', data)
    let msg = data[0];
    let highs = msg[1];
    let lows = msg[2];

    if ('DISABLED' in window) {
      return false;
    }

    // try {
    //   this._updateStatusBar([
    //     msg[0][1], // dow
    //     msg[0][0], // nasdaq
    //     msg[0][2] // spy
    //   ]);
    // } catch (e) {
    //   console.error('_updateStatusBar', e);
    // }
  };

  componentDidMount() {
    window.addEventListener('compressedUpdate', (event) => {
      console.info('compressedUpdate - ', event.detail)
      this._handleData(event.detail)
    }, false)
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

      const highColor = 'rgba(0,255,0,1)'
      const lowColor = 'rgba(255,0,0,1)'

      divs.push(
        <div className='d-flex carreContainer' key={i} style={{
          width: `100%`,
          height: '10px',
          background: `linear-gradient(90deg, ${highColor} 0%, ${lowColor} 100%)`
        }}>

        </div>
      );
    }

    return (
      <div className={statClass}>
        {divs.reverse()}
      </div>
    )
  }

  render() {
    return <div className='d-flex flex-row justify-content-center' style={{ position: 'absolute', flex: 1, width: 'calc(100% - 30px)' }}>
      {/**linear-gradient(90deg, rgba(0,255,74,1) 0%, rgba(0,255,40,1) 0%, rgba(255,0,0,1) 100%) */}

      {this.renderMeters('lows')}
      {this.renderMeters('highs')}
    </div>
  }
}