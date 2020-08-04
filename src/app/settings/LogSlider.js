import React from 'react'
import Slider from 'nouislider-react';

export function toValue(position, minp = 0, maxp = 100, _minv = 100000, _maxv = 2000000) {

    var minv = Math.log(_minv);
    var maxv = Math.log(_maxv);
    // The result should be between 100 an 10000000


    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (position - minp));
}

export function fromValue(value, minp = 0, maxp = 100, _minv = 100000, _maxv = 2000000) {

    // The result should be between 100 an 10000000
    var minv = Math.log(_minv);
    var maxv = Math.log(10000000);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return (Math.pow(Math.E, value) - minv) / scale + minp
}

export default function ({ start, onChange, ...props }) {
    return <Slider
        {...props}
        range={{ min: 0, max: 100 }}
        start={[fromValue(start[0]), fromValue(start[1])]}
        onChange={(render, handle, value, un, percent) => {
            console.info('On Change:', value)
            onChange(render, handle, value.map(toValue), un, percent)
        }}
    />
}
