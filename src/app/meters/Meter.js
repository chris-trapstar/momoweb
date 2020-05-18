import React, { Component } from 'react'

export class Meters extends Component {

  constructor(props) {
    super(props)

    this.state = {
      bars: [1, 0.6, -1],
      total: 0
    }
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

  render() {
    return <div className='d-flex flex-row justify-content-center'>
      {this.renderMeters('lows')}
      <div className='logo'>
        <h1>MOMO</h1>
        <h2>PROFIT FROM MOMENTUM</h2>
      </div>
      {this.renderMeters('highs')}
    </div>
  }
}