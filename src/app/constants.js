export const PRICE_MIN = 0;
export const PRICE_MAX = 5000;

export const AVG_VOL_MIN = 0;
export const AVG_VOL_MAX = 200000000; // Max 2M, unit is K

export const PRICE_RANGE = [
  { value: PRICE_MIN, step: 1 }, // acts as min value
  { value: 10, step: 10 },
  { value: 100, step: 100 },
  { value: 1000, step: 1000 }, // acts as max value
  { value: PRICE_MAX },
];

export const VOLUME_RANGE = [
  { value: AVG_VOL_MIN, step: 10000 }, // acts as min value
  { value: 100000, step: 100000 },
  { value: 500000, step: 500000 },
  { value: 1000000, step: 1000000 }, // acts as max value
  { value: 5000000, step: 5000000 },
  { value: 10000000, step: 10000000 },
  { value: AVG_VOL_MAX },
];

export const SECTORS_FILTER = {
  "BASIC INDUSTRIES": {
    "Process Industries": true,
    Conglomerates: true,
    Industrials: true,
    "Basic Industries": true,
    "Basic Materials": true,
  },
  "CAPITAL GOODS": {
    "Capital Goods": true,
  },
  "CONSUMER GOODS": {
    "Consumer Non Durables": true,
    "Consumer Non-Durables": true,
    "Consumer Defensive": true,
    "Consumer Cyclical": true,
    "Consumer Durables": true,
  },
  SERVICES: {
    Consumer: true,
    Services: true,
    "Commercial Services": true,
    "Communications Services": true,
  },
  ENERGY: {
    Energy: true,
  },
  FINANCE: {
    Finance: true,
    "Financial Services": true,
  },
  HEALTHCARE: {
    "Health Care": true,
    "Health Technology": true,
    Heathcare: true,
  },
  "PUBLIC UTILITIES": {
    "Public Utilities": true,
    Utilities: true,
  },
  COMMUNICATIONS: {
    Coummunications: true,
    Technology: true,
  },
  TRANSPORTION: {
    Transportation: true,
  },
  MISCELLANEOUS: {
    Miscellaneous: true,
    "n/a": true,
    "Real Estate": true,
  },
};

export const DEFAULT_FILTER = {
  industries: {
    "BASIC INDUSTRIES": true,
    "CAPITAL GOODS": true,
    "CONSUMER GOODS": true,
    SERVICES: true,
    ENERGY: true,
    FINANCE: true,
    HEALTHCARE: true,
    "PUBLIC UTILITIES": true,
    COMMUNICATIONS: true,
    TRANSPORTION: true,
    MISCELLANEOUS: true,
  },
  price: { min: PRICE_MIN, max: PRICE_MAX },
  volume: { min: AVG_VOL_MIN, max: AVG_VOL_MAX },
};
