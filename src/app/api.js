import Axios from "axios";
import jwtDecode from "jwt-decode";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://dev-api.mometic.com";

// const baseUrl = "https://dev-api.mometic.com";

const axios = Axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: { "Content-Type": "application/json", Accept: "application/json" }
});

const STATS_API = 'https://beta-data.mometic.com/api/discovery'

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

  signup = (email, username, password) => {
    const header = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        username,
        password
      })
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/auth/signup`, header)
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

  verify = (email) => {
    const header = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({
        email
      })
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/auth/verify_email`, header)
        .then(async response => {
          let data = await response.json();
          if (data.sent) {
            resolve();
          } else {
            reject(data.error);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  getPopular = () => {
    const header = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/stock_stats/top`, header)
        .then(async response => {
          const data = await response.json();
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getStockPageLink = (domain, stock) => {
    return `${baseUrl}/api/stock/${domain}/${stock}/`
  }

  getAlertHistory = () => {
    const header = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/alert_history`, header)
        .then(async response => {
          const data = await response.json();
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

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
    const header = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    };
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/api/auth/user`, header)
        .then(async response => {
          const data = await response.json();
          if (data.error) {
            reject(data.error);
          }
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  signInWithGoogle = async (payload) => {
    const response = await axios
      .post("/api/auth/google", payload)
    if (response.data.user) {
      this.setSession(response.data.access_token);
      return response.data.user
    } else {
      throw response.data.error;
    }
  }

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
    type
  }) => {
    const response = await fetch(`${baseUrl}/api/alerts`, {
      method: 'POST',
      body: JSON.stringify({
        category, rate, high, low, type
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

  updateAlert = async (id, alert) => {
    const response = await fetch(`${baseUrl}/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alert),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('PUT /api/alerts/:id - response - ', data)
    return data
  }

  deleteAlert = async (id) => {
    const response = await fetch(`${baseUrl}/api/alerts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('DELETE /api/alerts/:id - response - ', data)
    return data
  }

  getAlerts = async () => {
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

  getQuotes = async () => {
    const response = await fetch(`${baseUrl}/api/quotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('GET /api/quotes - response - ', data)
    return data
  }

  registerQuote = async (symbol) => {
    console.info('registerQuotes:', symbol)
    const response = await fetch(`${baseUrl}/api/quotes`, {
      method: 'POST',
      body: JSON.stringify({ symbol }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('POST /api/quotes - response - ', data)
    return data
  }

  deleteQuote = async (symbol) => {
    console.info('deleteQuote:', symbol)
    const response = await fetch(`${baseUrl}/api/quotes/${symbol}`, {
      method: 'DELETE',
      body: JSON.stringify({ symbol }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('DELETE /api/quotes - response - ', data)
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

  getStats = async () => {
    const res = await fetch(STATS_API)
    const data = await res.json()
    return data
  }

  getStripePlans = async () => {
    const response = await fetch(`${baseUrl}/api/stripe/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_access_token')}`
      }
    })
    const data = await response.json()
    console.info('GET /api/stripe/plans - response - ', data)
    return data
  }

  createCustomer = async (token) => {
    try {
      const res = await fetch(`${baseUrl}/api/stripe/customer`, {
        method: 'POST',
        body: JSON.stringify({
          token
        }),
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('Stripe Customer Created:', data)
      return data
    } catch (e) {
      console.error('Failed to create stripe customer', e)
    }
  }

  getCustomer = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/stripe/customer`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('Stripe Customer:', data)
      return data
    } catch (e) {
      console.error('Failed to create stripe customer', e)
    }
  }

  createSubscription = async (plan, coupon) => {
    try {
      const res = await fetch(`${baseUrl}/api/stripe/subscription`, {
        method: 'POST',
        body: JSON.stringify({ plan, coupon }),
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('createSubscription:', data)
      return data
    } catch (e) {
      console.error('Failed to create createSubscription', e)
    }
  }

  cancelSubscription = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/stripe/subscription/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('delete subscription:', data)
      return data
    } catch (e) {
      console.error('Failed to cancelSubscription', e)
    }
  }

  getCoupon = async (code) => {
    try {
      const res = await fetch(`${baseUrl}/api/stripe/coupon/${code}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      console.info('coupon data:', data)
      return data
    } catch (e) {
      console.error('Failed to getCoupon', e)
    }
  }
}

const instance = new API();

export default instance;
