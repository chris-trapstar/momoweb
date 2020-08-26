import { createReducer, createActions } from "reduxsauce";
import {
  AVG_VOL_MAX,
  AVG_VOL_MIN,
  DEFAULT_FILTER,
  PRICE_MAX,
  PRICE_MIN,
} from "../constants";

const defaultState = {
  filter: DEFAULT_FILTER,
};

export const { Types, Creators } = createActions({
  updatePriceFilter: ["value"],
  updateVolumeFilter: ["value"],
  updateIndustryFilter: ["value"],
});

export const ConfigTypes = Types;

export const getVolNumber = (strValue) => {
  if (strValue === "MIN") {
    return AVG_VOL_MIN * 1000;
  } else if (strValue === "MAX") {
    return AVG_VOL_MAX * 1000;
  } else if (strValue.indexOf("K") > -1) {
    return parseInt(strValue.replace("K", "")) * 1000;
  } else {
    return parseInt(strValue.replace("M", "") * 1000000);
  }
};

export const priceRangeFormat = (value) => {
  if (value === "MIN") {
    return 0;
  } else if (value === "MAX") {
    return PRICE_MAX;
  } else {
    return value;
  }
};

const updatePriceFilter = (state, { value }) => {
  const filter = { ...state.filter };
  filter.price = {
    min: priceRangeFormat(value[0]),
    max: priceRangeFormat(value[1]),
  };
  return {
    ...state,
    filter,
  };
};

const updateVolumeFilter = (state, { value }) => {
  const filter = { ...state.filter };
  filter.volume = {
    min: getVolNumber(value[0]),
    max: getVolNumber(value[1]),
  };
  return {
    ...state,
    filter,
  };
};

const updateIndustryFilter = (state, { value }) => {
  const filter = { ...state.filter };
  filter.industries = {
    ...filter.industries,
    [value]: !filter.industries[value],
  };
  return {
    ...state,
    filter,
  };
};

export const configReducer = createReducer(defaultState, {
  [Types.UPDATE_PRICE_FILTER]: updatePriceFilter,
  [Types.UPDATE_VOLUME_FILTER]: updateVolumeFilter,
  [Types.UPDATE_INDUSTRY_FILTER]: updateIndustryFilter,
});

export default Creators;