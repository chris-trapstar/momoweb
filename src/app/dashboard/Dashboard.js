import React, { Component } from "react";
import './dashboard.css';

export class Dashboard extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-12 grid-margin stretch-card">
            <div className="card-body py-0 px-0 px-sm-0">
              <div
                className="row"
                style={{
                  background: "#1a1c23",
                  paddingTop: 10,
                  paddingBottom: 10
                }}
              >
                <div className="col-1" />
                <div className="col-10 table-responsive">
                  <tbody>
                    <tr>
                      <td>
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">STREAM</span>
                      </td>
                      <td className="pl-5">
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">ALERT HISTORY</span>
                      </td>
                      <td className="pl-5">
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">BREADTH</span>
                      </td>
                      <td className="pl-5">
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">POPULAR</span>
                      </td>
                      <td className="pl-5">
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">QUOTE</span>
                      </td>
                      <td className="pl-5">
                        <img
                          src={require("../../assets/images/faces-clipart/pic-1.png")}
                          alt="face"
                          style={{ width: 25, height: 25 }}
                        />
                        <span className="pl-2 small">DISCOVERY</span>
                      </td>
                    </tr>
                  </tbody>
                </div>
                <div className="col-1" />
              </div>
              {/* Popular Stocks*/}
              <div className="row mt-4 ">
                <div className="col-1" />
                <div className="col-10">
                  <div
                    className="col-xl-2 p-1"
                    style={{ background: "#1a1c23" }}
                  >
                    <div className="d-flex flex-row-reverse">
                      <img
                        src={require("../../assets/images/dashboard/star.jpg")}
                        alt="face"
                        style={{
                          width: 15,
                          height: 15
                        }}
                      />
                    </div>
                    <div className="d-flex flex-row justify-content-between mt-2 pl-3 pr-3">
                      <div className="d-flex align-items-center align-self-start">
                        <h6 className="mb-0 font-weight-bold">$31.53</h6>
                        <label
                          className="text-success ml-2 mb-0"
                          style={{ "font-size": 10 }}
                        >
                          +3.5%
                        </label>
                      </div>
                      <div
                        className="icon icon-box-success"
                        style={{ width: 30, height: 30 }}
                      >
                        <span
                          className="mdi mdi-arrow-top-right icon-item small"
                          style={{ "font-size": 15 }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-1" />
              </div>

              {/** Table | (Popular vs Alert History) */}
              <div className="row data-section">
                <div className="col-md-8 grid-margin stretch-card">
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th> SYMBOL </th>
                                <th> LAST </th>
                                <th> COUNT </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-1">
                                  <img src={require("../../assets/images/faces/face1.jpg")} alt="user icon" />
                                </td>
                                <td> Herman Beck </td>
                                <td> 3 </td>
                              </tr>
                            </tbody>
                          </table>

                        </div>
                        <div className="col-md-6">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th> SYMBOL </th>
                                <th> LAST </th>
                                <th> COUNT </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-1">
                                  <img src={require("../../assets/images/faces/face1.jpg")} alt="user icon" />
                                </td>
                                <td> Herman Beck </td>
                                <td> 3 </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 grid-margin stretch-card column-flex">
                  <div class="card">
                    <div class="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Popular</h4>
                        <p className="text-muted mb-1"></p>
                      </div>
                      <div className="row data-section popular">
                        <div className="col-12">
                          <h3>AMZN GOOG NS GE</h3>
                          <h4>TXN NVCN TVIX JNJ</h4>
                          <h5>STX SOX UVXY SLT TLT</h5>
                          <h6>STX SOX UVXY SLT TLT</h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="card data-section">
                    <div class="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Alert History</h4>
                        <p className="text-muted mb-1"></p>
                      </div>
                      <div className="row data-section popular">

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row data-section">
                <div className="col-12">
                  <div class="card">
                    <div class="card-body">
                      <div className="d-flex flex-row justify-content-between">
                        <h4 className="card-title mb-1">Discovery</h4>
                        <div className="button">Industry</div>
                        <div className="button">Favorites</div>
                        <input className="input" placeholder="symbol search"></input>
                      </div>

                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th> SYMBOL </th>
                            <th> LAST </th>
                            <th> VOLUME </th>
                            <th> Momentum </th>
                            <th> Unusual Vol </th>
                            <th> VWAP DIST %</th>
                            <th> Short %</th>
                            <th> Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>AAPL</td>
                            <td>312.44</td>
                            <td>1210,000</td>
                            <td>+121</td>
                            <td>+18%</td>
                            <td>+18%</td>
                            <td>25%</td>
                            <td>* ^</td>
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
