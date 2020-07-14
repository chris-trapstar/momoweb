import React, { Component } from 'react';
import {
  Table,
  Column,
  InfiniteLoader,
  AutoSizer,
  SortDirection,
} from 'react-virtualized';
import './DiscoveryTable.css';
import 'react-virtualized/styles.css';
import { ContextMenuTrigger } from 'react-contextmenu';
let contextTrigger = null;
let alertContextTrigger = null;
class DiscoveryTable extends Component {
  constructor() {
    super();
    this._sort = this._sort.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this._rowClassName = this._rowClassName.bind(this);
    this.state = {
      items: [],
      sortedList: [],
      sortBy: 'symbol',
      sortDirection: SortDirection.DESC,
    };
  }
  componentWillReceiveProps(props) {
    if (props.discoveryData)
      this.setState({
        items: props.discoveryData,
        sortedList: props.discoveryData,
      });
  }

  loadMore() {
    return new Promise((resolve, reject) => {
      this.promiseResolve = resolve;
    });
  }

  _sort({ sortBy }) {
    const sortedList = this._sortList(sortBy, this.state.sortDirection);
    this.setState({
      sortBy,
      sortDirection:
        this.state.sortDirection === SortDirection.DESC
          ? SortDirection.ASC
          : SortDirection.DESC,
      sortedList,
    });
  }

  _sortList(sortBy, sortDirection) {
    const { items } = this.state;
    return sortDirection === SortDirection.ASC
      ? _.sortBy(items, sortBy).reverse()
      : _.sortBy(items, sortBy);
  }

  _round = (value, decimals) => parseFloat(value).toFixed(decimals);

  _setColorOnValue(symbol, data, type, decimals) {
    const roundedValue = this._round(data, decimals);
    return (
      <div
        style={{ color: data > 0 ? '#00d25b' : '#fc424a' }}
        onClick={(e) => this.toggleMenu(e, symbol)}
      >
        {roundedValue > 0
          ? `+${roundedValue}${type}`
          : `${roundedValue}${type}`}
      </div>
    );
  }

  _rowClassName({ index }) {
    if (index < 0) {
      return 'row-color-grey';
    } else {
      return index % 2 === 0 ? 'row-color-grey' : 'row-color-black';
    }
  }

  toggleMenu(event, symbol) {
    if (contextTrigger) {
      contextTrigger.handleContextClick(event);
      this.props.onContextMenuTrigger(symbol);
    }
  }

  render() {
    return (
      <div className='container'>
        <ContextMenuTrigger
          id={`discovery-context-menu`}
          ref={(c) => (contextTrigger = c)}
        >
          <></>
        </ContextMenuTrigger>
        <ContextMenuTrigger
          id={'discovery-alert-context-menu'}
          ref={(c) => (alertContextTrigger = c)}
        >
          <></>
        </ContextMenuTrigger>
        <InfiniteLoader
          isRowLoaded={({ index }) => !!this.state.sortedList[index]}
          loadMoreRows={this.loadMore}
          rowCount={this.state.sortedList.length}
        >
          {({ onRowsRendered }) => (
            <AutoSizer>
              {({ width }) => (
                <Table
                  width={1320}
                  height={600}
                  rowHeight={65}
                  headerHeight={50}
                  sort={this._sort}
                  style={{ fontSize: 14 }}
                  sortBy={this.state.sortBy}
                  onRowsRendered={onRowsRendered}
                  rowCount={this.state.sortedList.length}
                  sortDirection={this.state.sortDirection}
                  rowGetter={({ index }) => this.state.sortedList[index]}
                  rowClassName={(index) =>
                    index.index % 2 === 0 ? 'oddRow' : 'evenRow'
                  }
                >
                  <Column
                    width={220}
                    label='Symbol'
                    dataKey='symbol'
                    style={{ fontWeight: 600 }}
                    cellRenderer={({ cellData }) => (
                      <div onClick={(e) => this.toggleMenu(e, cellData)}>
                        {cellData}
                      </div>
                    )}
                  />
                  <Column
                    width={200}
                    label='Last'
                    dataKey='price_dist'
                    cellRenderer={({ cellData, rowData }) => (
                      <div onClick={(e) => this.toggleMenu(e, rowData.symbol)}>
                        <div>{rowData.last}</div>
                        <small className={'price-dist ' + (rowData.price_dist == 0 ? '' : (rowData.price_dist > 0 ? 'text-success' : 'text-danger'))}>
                          {rowData.price_dist > 0 ? '+' : ''}{rowData.price_dist}%
                        </small>
                      </div>
                    )}
                  />
                  <Column
                    width={200}
                    label='Volume'
                    dataKey='volume'
                    cellRenderer={({ cellData, rowData }) => (
                      <div
                        onClick={(e) => this.toggleMenu(e, rowData.symbol)}
                        style={{ color: '#9B9B9C' }}
                      >
                        {cellData}
                      </div>
                    )}
                  />
                  <Column
                    width={200}
                    label='Momentum'
                    dataKey='momentum'
                    cellRenderer={({ cellData, rowData }) =>
                      this._setColorOnValue(rowData.symbol, cellData, '', '')
                    }
                  />
                  <Column
                    width={200}
                    label='UVol'
                    dataKey='uVol'
                    cellRenderer={({ cellData, rowData }) =>
                      this._setColorOnValue(rowData.symbol, cellData, '%', '2')
                    }
                  />
                  <Column
                    width={200}
                    label='vWapDist'
                    dataKey='vWapDist'
                    cellRenderer={({ cellData, rowData }) =>
                      this._setColorOnValue(rowData.symbol, cellData, '%', '2')
                    }
                  />
                  <Column
                    width={120}
                    dataKey='alert'
                    label='Actions'
                    cellRenderer={({ cellData, rowData }) => (
                      <div className='action-column'>
                        <span
                          className='mdi mdi-bell text-white popover-icon'
                          style={{ marginRight: 16, cursor: 'pointer' }}
                          onClick={(e) => {
                            alertContextTrigger.handleContextClick(e);
                            this.props.onAlertTrigger(
                              cellData,
                              rowData.vWapDist
                            );
                          }}
                        />
                        <i
                          className={`${
                            this.props.checkIsFavorite(cellData)
                              ? 'mdi mdi-star quote-star popover-icon'
                              : 'mdi mdi-star text-white popover-icon'
                            }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => this.props.onSetSymbolFav(cellData)}
                        />
                      </div>
                    )}
                  />
                </Table>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    );
  }
}

export default DiscoveryTable;
