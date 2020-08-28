import React, { Component } from "react";
import "./StepRangeSlider.css";
import PropTypes from "prop-types";
import classnames from "classnames";
import isEqual from "lodash/isEqual";
import { configureRange } from "./slider-utils";
import StepRangeHandler from "./StepRangeHandler";

export class StepRangeSlider extends Component {
  constructor(props) {
    super(props);
    const range = configureRange(props.range);
    this.state = {
      range,
      values: props.values,
    };
    this.handleValueChange = this.handleValueChange.bind(this);
  }
  setInitialState = (props) => {
    const { values } = props;
    const range = configureRange(props.range);
    this.setState({ values, range });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.range && nextProps.range !== this.props.range) {
      this.setInitialState(nextProps);
    }
    if (
      !isEqual(nextProps.values, this.props.values) &&
      !isEqual(nextProps.values, this.state.values)
    ) {
      // const value = this.state.range.ensureValue(nextProps.value);
      this.setState({ values: nextProps.values });
    }
  }

  handleValueChange(value, identifier) {
    const { onChange } = this.props;
    let values = Object.assign({}, this.state.values);
    values[identifier] = value;
    const self = this;
    this.setState({ values }, () => {
      onChange(self.state.values);
    });
  }

  render() {
    const { id, name, disabled, tooltip, className } = this.props;
    const { range, values } = this.state;

    return (
      <div
        className={classnames("StepRangeSlider", className)}
        onMouseDown={this.handleMouseDown}
        onScroll={() => {
          console.log("Scrolling");
        }}
        ref={(node) => (this.slider = node)}
      >
        <div className="SliderBar" />
        <div className="StepRangeSlider__track" />
        <StepRangeHandler
          range={range}
          values={values}
          identifier="low"
          onChangeComplete={this.handleValueChange}
        />
        <StepRangeHandler
          range={range}
          values={values}
          identifier="high"
          onChangeComplete={this.handleValueChange}
        />
        <input type="hidden" id={id} name={name} disabled={disabled} />
      </div>
    );
  }
}

StepRangeSlider.displayName = "StepRangeSlider";

StepRangeSlider.propTypes = {
  children: PropTypes.any,
  value: PropTypes.objectOf(
    PropTypes.shape({
      first: PropTypes.number.isRequired,
      second: PropTypes.number.isRequired,
    })
  ),
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onChangeComplete: PropTypes.func,
  range: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      step: PropTypes.number,
    }).isRequired
  ).isRequired,
};

StepRangeSlider.defaultProps = {
  defaultValue: 0,
  range: [{ value: 0, step: 1 }, { value: 100 }],
  children: (value) => <div className="StepRangeSlider__tooltip">{value}</div>,
};

export default StepRangeSlider;
