import Axios from "axios";
import jwtDecode from "jwt-decode";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://dev-api.mometic.com";

const axios = Axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: { "Content-Type": "application/json", Accept: "application/json" }
});

const STATS_API = 'http://momodatasource-dev-env.us-east-1.elasticbeanstalk.com/api/stats'

class API {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  emit() {
    console.info("API.emit - ", arguments);
  }

  setInterceptors = () => {
    axios.interceptors.response.use(
      response => {
        return response;
      },
      err => {
        return new Promise((resolve, reject) => {
          if (
            err &&
            err.response &&
            err.response.status === 401 &&
            err.config &&
            !err.config.__isRetryRequest
          ) {
            // if you ever get an unauthorized response, logout the user
            this.emit("onAutoLogout", "Invalid access_token");
            this.setSession(null);
          }
          throw err;
        });
      }
    );
  };

  login = (email, password) => {
    const header = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/auth/login`, header)
        .then(async response => {
          let data = await response.json();
          if (data.access_token) {
            resolve(data);
          } else {
            reject(data.error);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  handleAuthentication = () => {
    let access_token = this.getAccessToken();

    if (!access_token) {
      this.emit("onNoAccessToken");

      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      this.setSession(access_token);
      this.emit("onAutoLogin", true);
    } else {
      this.setSession(null);
      this.emit("onAutoLogout", "access_token expired");
    }
  };

  createUser = data => {
    return new Promise((resolve, reject) => {
      axios.post("/api/auth/register", data).then(response => {
        if (response.data.user) {
          this.setSession(response.data.access_token);
          resolve(response.data.user);
        } else {
          reject(response.data.error);
        }
      });
    });
  };

  signInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      axios
        .post("/api/auth/login", {
          email,
          password
        })
        .then(response => {
          if (response.data.user) {
            this.setSession(response.data.access_token);
            resolve(response.data.user);
          } else {
            reject(response.data.error);
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .get("/api/auth/user", {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`
          }
        })
        .then(response => {
          if (response.data.user) {
            this.setSession(response.data.access_token);
            resolve(response.data.user);
          } else {
            this.logout();
            reject("Failed to login with token.");
          }
        })
        .catch(error => {
          this.logout();
          reject("Failed to login with token.");
        });
    });
  };

  updateUserData = user => {
    return axios.post("/api/auth/user/update", {
      user: user
    });
  };

  setSession = access_token => {
    if (access_token) {
      localStorage.setItem("jwt_access_token", access_token);
      axios.defaults.headers.common["Authorization"] = "Bearer " + access_token;
    } else {
      localStorage.removeItem("jwt_access_token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  logout = () => {
    this.setSession(null);
  };

  isAuthTokenValid = access_token => {
    if (!access_token) {
      return false;
    }
    const decoded = jwtDecode(access_token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn("access token expired");
      return false;
    } else {
      return true;
    }
  };

  getAccessToken = () => {
    return window.localStorage.getItem("jwt_access_token");
  };

  addAlert = async ({
    category,
    rate,
    high,
    low,
  }) => {
    const response = await fetch(`${baseUrl}/api/alerts`, {
      method: 'POST',
      body: JSON.stringify({
        category, rate, high, low
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('POST /api/alerts - response - ', data)
    return data
  }

  deleteAlert = async (id) => {
    const response = await fetch(`${baseUrl}/api/alerts`, {
      method: 'POST',
      body: JSON.stringify({
        category, rate, high, low
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('POST /api/alerts - response - ', data)
    return data
  }

  getAlerts = async() => {
    const response = await fetch(`${baseUrl}/api/alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('GET /api/alerts - response - ', data)
    return data
  }

  registerPushToken = async (registration_id) => {
    try {
      const res = await fetch(`${baseUrl}/api/alerts/device/fcm`, {
        method: 'POST',
        body: JSON.stringify({
          registration_id
        }),
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('Push Token Registered:', data)
      return data
    } catch (e) {
      console.error('Failed to register the push token', e)
    }
  }

  getStats  = async () => {
    const res = await fetch(STATS_API)
    const data = await res.json()

    // Calculate VWAP dist
    data.map((stock) => {
      const { VWAP } = stock
      if (VWAP > 0) { // VWAP exists
        stock.VWAP_DIST = (stock.priorDayLast - VWAP) / VWAP * 100
      }
      if (isNaN(stock.VWAP_DIST)) {
        stock.VWAP_DIST = undefined
      } else {
        stock.VWAP_DIST = parseFloat(stock.VWAP_DIST.toFixed(2))
      }
    })

    return data
  }

}

const instance = new API();

export default instance;
