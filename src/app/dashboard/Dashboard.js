import React, { Component } from "react";
import "./dashboard.css";

export class Dashboard extends Component {
  render() {
    return (
      <div>
        <div className="row px-3">
          <div className="col-12 grid-margin stretch-card px-0">
            <div className="card-body py-0 px-0 px-sm-0">
              {/** Static Bar */}
              <div className="row static-bar">
                <div className="col-12 table-responsive">
                  <tbody>
                    <tr>
                      <td>
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">STREAM</span>
                      </td>
                      <td className="pl-5">
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">
                          ALERT HISTORY
                        </span>
                      </td>
                      <td className="pl-5">
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">
                          BREADTH
                        </span>
                      </td>
                      <td className="pl-5">
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">
                          POPULAR
                        </span>
                      </td>
                      <td className="pl-5">
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">QUOTE</span>
                      </td>
                      <td className="pl-5">
                        <img
                          className="static-img"
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                        />
                        <span className="pl-2 small white-no-wrap">
                          DISCOVERY
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </div>
              </div>

              {/** Popular Stocks */}
              <div className="container-fluid px-0 data-section-large">
                <div className="row flex-row flex-nowrap overflow-scroll">
                  <div className="col-xl-3 col-md-4 col-sm-6 pl-0">
                    <div className="card p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-md-4 col-sm-6">
                    <div className="card ant-card-loading-block p-1">
                      <div className="d-flex flex-row-reverse">
                        <img
                          className="img-15"
                          src={require("../../assets/images/dashboard/star.jpg")}
                          alt="face"
                        />
                      </div>
                      <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                        <div className="d-flex align-items-center align-self-start">
                          <label className="mb-0 font-weight-bold font-20">
                            $31.53
                          </label>
                          <label className="text-success ml-2 mb-0 font-10">
                            +3.5%
                          </label>
                        </div>
                        <div className="icon icon-box-success img-30">
                          <span className="mdi mdi-arrow-top-right icon-item font-15" />
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between pl-3 pr-3 mt-1">
                        <label className="font-12 dash-font-color">AAPL</label>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">H:</label>
                          <label className="font-13 dash-font-color ml-1">
                            34:22
                          </label>
                        </div>
                        <div className="d-flex flex-row mt-1">
                          <label className="font-13 white-color">L:</label>
                          <label className="font-13 dash-font-color ml-1">
                            10.99
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/** Table | (Popular vs Alert History) */}
              <div className="row data-section-large">
                <div className="col-md-8 grid-margin stretch-card px-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th> SYMBOL </th>
                                <th> COUNT </th>
                                <th> LAST </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                              <tr>
                                <td className="text-danger">AAPL</td>
                                <td className="text-danger">3</td>
                                <td className="text-danger">3</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th> SYMBOL </th>
                                <th> COUNT </th>
                                <th> LAST </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="text-success">AAPL</td>
                                <td className="text-success">3</td>
                                <td className="text-success">3</td>
                              </tr>
                              <tr>
                                <td className="text-success">AAPL</td>
                                <td className="text-success">3</td>
                                <td className="text-success">3</td>
                              </tr>
                              <tr>
                                <td className="text-success">AAPL</td>
                                <td className="text-success">3</td>
                                <td className="text-success">3</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 grid-margin stretch-card column-flex pr-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Popular</h4>
                        <p className="text-muted mb-1" />
                      </div>
                      <div className="row data-section popular">
                        <div className="col-12">
                          <h3>AMZN GOOG NS GE</h3>
                          <h4>TXN NVCN TVIX JNJ</h4>
                          <h5>STX SOX UVXY SLT TLT</h5>
                          <h6>MA V TTX ABA</h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card data-section">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Alert History</h4>
                        <p className="text-muted mb-1" />
                      </div>
                      <div className="row data-section popular" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row data-section">
                <div className="col-12 px-0">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex flex-row justify-content-between text-center">
                        <h4 className="card-title mb-1 py-1">Discovery</h4>
                        <div className="row">
                          <span className="border border-radius-10">
                            <div className="button btn-dark px-4 py-1 border-radius-10">
                              Industry
                            </div>
                          </span>
                          <span className="border border-radius-10 ml-4">
                            <div className="button btn-dark px-4 py-1 border-radius-10">
                              Favorites
                            </div>
                          </span>
                        </div>
                        <div />
                        <div />
                        <input
                          className="input p-0 text-center bg-dark white-color input-border"
                          placeholder="symbol search"
                        />
                      </div>

                      <table className="table table-striped data-section">
                        <thead>
                          <tr>
                            <th className="text-center"> SYMBOL </th>
                            <th className="text-center"> LAST </th>
                            <th className="text-center"> VOLUME </th>
                            <th className="text-center"> Momentum </th>
                            <th className="text-center"> Unusual Vol </th>
                            <th className="text-center"> VWAP DIST %</th>
                            <th className="text-center"> Short %</th>
                            <th className="text-center"> Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              AAPL
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              TXN
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                          <tr>
                            <td className="text-white font-weight-bold text-center">
                              GOOG
                            </td>
                            <td className="text-center">312.44</td>
                            <td className="text-center">1210,000</td>
                            <td className="text-success text-center">+121</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-success text-center">+18%</td>
                            <td className="text-center">25%</td>
                            <td className="text-center">* ^</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
