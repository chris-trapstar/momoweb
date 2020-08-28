import React, { Component } from "react";

import throttle from "lodash/throttle";
import isFunction from "lodash/isFunction";
const numeral = require("numeral");

export default class StepRangeHandler extends Component {
  componentDidMount() {
    window.addEventListener("touchmove", this.handleTouchMove);
    window.addEventListener("touchend", this.handleMouseUp);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  }
  componentWillMount() {
    this.handleChange = throttle(this.handleChange, 200);
    this.setInitialState(this.props);
  }

  componentWillUnmount() {
    this.handleChange.cancel();
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("touchend", this.handleMouseUp);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  }
  setInitialState = (props) => {
    const { range, identifier, values } = props;
    const v = values[identifier];
    const value = range.ensureValue(v || props.defaultValue);
    const currentStep = range.getStepForValue(value);
    this.setState({ value, range, currentStep });
  };

  stepUp = (amount) => {
    const { range, currentStep } = this.state;
    const nextStep = currentStep + amount;
    if (nextStep <= range.maxStep) {
      const nextValue = range.getValueForStep(nextStep);
      this.setState({ currentStep: nextStep, value: nextValue });
    }
  };

  stepDown = (amount) => {
    const { range, currentStep } = this.state;
    const nextStep = currentStep - amount;
    if (nextStep >= range.minStep) {
      const nextValue = range.getValueForStep(nextStep);
      this.setState({ currentStep: nextStep, value: nextValue });
    }
  };

  handleChange = () => {
    const { value } = this.state;
    const { onChange } = this.props;
    isFunction(onChange) && onChange(value);
  };

  handleChangeComplete = () => {
    const { value } = this.state;
    const { onChangeComplete, identifier } = this.props;
    isFunction(onChangeComplete) && onChangeComplete(value, identifier);
  };

  handleMouseUp = (e) => {
    if (this.state.pressed) {
      this.setState({ pressed: false });
      this.handleChangeComplete();
    }
  };

  handleMouseMove = (e) => {
    if (this.state.pressed) {
      this.handleMove(e);
    }
  };

  handleMouseDown = (e) => {
    e.preventDefault();
    this.handlePress();
    this.handleMove(e);
  };

  handleTouchMove = (e) => {
    if (this.state.pressed) {
      e.preventDefault();
      this.handleMouseMove(e.touches[0]);
    }
  };

  handleTouchStart = (e) => {
    this.handlePress();
    this.handleMove(e.touches[0]);
  };

  handlePress = () => {
    this.sliderRect = this.handler.parentNode.getBoundingClientRect();
    this.setState({ pressed: true });
  };

  handleMove = (e) => {
    const { clientX } = e;
    const { disabled } = this.props;
    const { range } = this.state;
    const { width, left, right } = this.sliderRect;

    if (!clientX || disabled) return;

    let position;
    if (clientX < left) {
      position = 0;
    } else if (clientX > right) {
      position = right - left;
    } else {
      position = clientX - left;
    }
    const currentStep = Math.round((position / width) * range.maxStep);
    const value = range.getValueForStep(currentStep);

    if (value !== this.state.value || currentStep !== this.state.currentStep) {
      this.setState({ value, currentStep }, this.handleChange);
    }
  };

  getTooltip = (value) => {
    const { maxValue, minValue } = this.props.range;
    if (value === maxValue) {
      return "MAX";
    }

    if (value === minValue) {
      return "MIN";
    }

    return numeral(value).format("0a").toUpperCase();
  };

  render() {
    const { children } = this.props;
    const { value, range, currentStep } = this.state;

    const offset = (currentStep / range.maxStep) * 100;
    const offsetStyle = { left: `${offset}%` };
    return (
      <div
        className="StepRangeSlider__handle"
        onTouchStart={this.handleTouchStart}
        onMouseDown={this.handleMouseDown}
        style={offsetStyle}
        ref={(node) => (this.handler = node)}
      >
        <div
          className="StepRangeSlider__thumb"
          aria-valuemin={range.minValue}
          aria-valuemax={range.maxValue}
          aria-valuenow={value}
          role="slider"
        />
        {isFunction(children) ? children(this.getTooltip(value)) : children}
      </div>
    );
  }
}

StepRangeHandler.defaultProps = {
  defaultValue: 0,
  range: [{ value: 0, step: 1 }, { value: 100 }],
  children: (value) => <div className="StepRangeSlider__tooltip">{value}</div>,
};
