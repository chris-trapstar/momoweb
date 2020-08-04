import React from 'react'
import Slider from 'nouislider-react';

import { PRICE_MIN, PRICE_MAX, AVG_VOL_MIN, AVG_VOL_MAX, SECTORS_FILTER, DEFAULT_FILTER } from '../constants'

export function toValue(position, minp = 0, maxp = 40, _minv = AVG_VOL_MIN, _maxv = AVG_VOL_MAX) {

    var minv = Math.log(_minv);
    var maxv = Math.log(_maxv);


    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (position - minp));
}

export function fromValue(value, minp = 0, maxp = 40, _minv = AVG_VOL_MIN, _maxv = AVG_VOL_MAX) {

    var minv = Math.log(_minv);
    var maxv = Math.log(_maxv);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return (Math.log(value) - minv) / scale + minp
}

export default function ({  ...props }) {
    return <Slider
        {...props}
        range={{ min: 0, max: 40 }}
    />
}
