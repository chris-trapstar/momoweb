export const PRICE_MIN = 0
export const PRICE_MAX = 3001

export const AVG_VOL_MIN = 0
export const AVG_VOL_MAX = 20001 // Max 20000K


export const SECTORS_FILTER = {
    'BASIC INDUSTRIES': {
        'Process Industries': true,
        'Conglomerates': true,
        'Industrials': true,
        'Basic Industries': true,
        'Basic Materials': true,
    },
    'CAPITAL GOODS': {
        'Capital Goods': true,
    },
    'CONSUMER GOODS': {
        'Consumer Non Durables': true,
        'Consumer Non-Durables': true,
        'Consumer Defensive': true,
        'Consumer Cyclical': true,
        'Consumer Durables': true,
    },
    'SERVICES': {
        'Consumer': true,
        'Services': true,
        'Commercial Services': true,
        'Communications Services': true,
    },
    'ENERGY': {
        Energy: true,
    },
    'FINANCE': {
        'Finance': true,
        'Financial Services': true,
    },
    'HEALTH CARE': {
        'Health Care': true,
        'Health Technology': true,
        'Heathcare': true,
    },
    'PUBLIC UTILITIES': {
        'Public Utilities': true,
        'Utilities': true,
    },
    'COMMUNICATIONS': {
        Coummunications: true,
        Technology: true,
    },
    'TRANSPORTION': {
        Transportation: true,
    },
    'MISCELLANEOUS': {
        'Miscellaneous': true,
        'n/a': true,
        'Real Estate': true,
    },
};

export const DEFAULT_FILTER = {
    industries: {
        'BASIC INDUSTRIES': true,
        'CAPITAL GOODS': true,
        'CONSUMER GOODS': true,
        'SERVICES': true,
        'ENERGY': true,
        'FINANCE': true,
        'HEALTH CARE': true,
        'PUBLIC UTILITIES': true,
        'COMMUNICATIONS': true,
        'TRANSPORTION': true,
        'MISCELLANEOUS': true
    },
    price: { min: PRICE_MIN, max: PRICE_MAX },
    volume: { min: AVG_VOL_MIN, max: AVG_VOL_MAX }
}