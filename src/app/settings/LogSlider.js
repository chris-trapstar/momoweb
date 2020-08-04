import React from 'react'
import Slider from 'nouislider-react';


function toValue(position, minp = 0, maxp = 100, _minv = 100000, _maxv = 2000000) {
    // position will be between 0 and 100
    var minp = 0;
    var maxp = 100;

    // The result should be between 100 an 10000000
    var minv = Math.log(_minv);
    var maxv = Math.log(10000000);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return Math.exp(minv + scale * (position - minp));
}

function fromValue(value, minp = 0, maxp = 100, _minv = 100000, _maxv = 2000000) {
    // position will be between 0 and 100
    var minp = 0;
    var maxp = 100;

    // The result should be between 100 an 10000000
    var minv = Math.log(_minv);
    var maxv = Math.log(10000000);

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp);

    return (Math.pow(Math.E, value) - minv) / scale + minp
}


export default function ({ ...props }) {
    return <Slider {...props} />
}
