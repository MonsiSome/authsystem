import axios from "./axios/axios"

export class User {

  static getAccess() {
    return axios.get('/me', { 
      headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('access_token'))}`} 
    });
  };

  static doRefresh() {
    return axios.post('/refresh', undefined, { 
      headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('refresh_token'))}`} 
    });
  };

  static doLogin(email, password) {
    return axios.post(`login?email=${email}&password=${password}`);
  };

  static doRegistration(user) {
    return axios.post('/sign_up', user);
  };
}
