import React, { Component } from "react";

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
              <div className="row mt-4">
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
