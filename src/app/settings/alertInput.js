import React, { Component } from 'react';
import { ProgressBar, Alert } from 'react-bootstrap';
import API from '../api';
import './settings.css';
import Slider from 'nouislider-react';
import cogoToast from 'cogo-toast';

export default class AlertInput extends Component {

  onChange = (name, newValue) => {
    const value = { ...this.props.value }
    value[name] = newValue
    this.props.onChange(value)
  }

  render() {
    const { value, editing, type } = this.props
    const { category, rate } = value
    const min = 0
    let max = 1000
    if (type === 'trade') {
      max = 1000
    } else {
      max = 100 // percent
    }

return <div className={"row mx-0 justify-content-between align-items-center item-content mt-1 pl-2 " + (editing ? 'alert-edit' : '')} >
      <input
        placeholder="Name"
        className="bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
        value={category}
        onChange={(e) => {
          this.onChange('category', e.target.value)
        }}
        autoFocus
        disabled={!editing}
      />
      <div className="d-flex flex-row flex-fill justify-content-center align-items-center progress-section">
        <Slider
          range={{ min, max }}
          step={0.1}
          start={rate}
          connect={[false, true]}
          className="flex-fill slider-white"
          onChange={(render, handle, value, un, percent) => {
            this.onChange('rate', value)
          }}
          disabled={!editing}
        />
        <input
          placeholder="Sensitivity"
          className="ml-3 bg-dark progress-input justify-content-center align-items-center text-center border-0 white-color small"
          value={rate}
          onChange={e => {
            this.onChange('rate', e.target.value)
          }}
          disabled={!editing}
        />
      </div>
      <button
        className="bg-transparent border-0"
        onClick={this.props.onSubmit}
        disabled={!editing || value.category === ''}
      >
        <i className= {"mdi  popover-icon mdi-check text-light " + (editing ? "": "transparent-txt")} />
      </button>
      <button
        className="bg-transparent border-0"
        onClick={this.props.onDelete}
      >
        <i className="mdi mdi-close text-white popover-icon" />
      </button>
    </div>
  }
}