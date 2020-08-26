import React from "react";
import Slider from "nouislider-react";

import { AVG_VOL_MAX, AVG_VOL_MIN } from "../constants";

export function toValue(
  position,
  minp = 0,
  maxp = 40,
  _minv = AVG_VOL_MIN,
  _maxv = AVG_VOL_MAX
) {
  const minv = Math.log(_minv);
  const maxv = Math.log(_maxv);

  // calculate adjustment factor
  const scale = (maxv - minv) / (maxp - minp);

  return Math.exp(minv + scale * (position - minp));
}

export function fromValue(
  value,
  minp = 0,
  maxp = 40,
  _minv = AVG_VOL_MIN,
  _maxv = AVG_VOL_MAX
) {
  const minv = Math.log(_minv);
  const maxv = Math.log(_maxv);

  // calculate adjustment factor
  const scale = (maxv - minv) / (maxp - minp);

  return (Math.log(value) - minv) / scale + minp;
}

export default function ({ ...props }) {
  return <Slider {...props} range={{ min: 0, max: 40 }} />;
}
