import { User } from './user';

clearTokens();
const form = document.querySelector('form');
form.addEventListener('submit', executeSubmit);

const requestStatus = document.createElement('p');
requestStatus.className = 'request_status';
form.after(requestStatus);

const userStatusMessage = document.createElement('span');
userStatusMessage.className = 'user_status';
form.after(userStatusMessage);

const access = document.querySelector('.access');
const refresh = document.querySelector('.refresh');

access.addEventListener('click', clickHandler);
refresh.addEventListener('click', clickHandler);

function clickHandler(event) {
  event.preventDefault();
  userStatusMessage.innerHTML = '';

  if(!JSON.parse(localStorage.getItem('access_token'))
    || !JSON.parse(localStorage.getItem('refresh_token'))) {
    requestStatus.innerHTML = 'Log in, please...';
    return;
  }

  if (event.target.classList.contains("access")) {
    requestStatus.innerHTML = 'Access...';
  
    User.getAccess()
      .then(response => {
        requestStatus.innerHTML = '';
        userStatusMessage.innerHTML = `${response.data.body.message}`;
        response.data.body.status === 'error' ? userStatusMessage.style.color = 'darkred'
          : userStatusMessage.style.color = 'black';
      })
      .catch(function (error) {
        requestStatus.innerHTML = `${error.message}`;
      });
  } else {
    requestStatus.innerHTML = 'Refresh...';

    User.doRefresh()
      .then(response => {
        localStorage.setItem('access_token', JSON.stringify(response.data.body.access_token));
        userStatusMessage.innerHTML = 'Refershed';
        requestStatus.innerHTML = '';
      })
      .catch(function (error) {
        requestStatus.innerHTML = `${error.message}`;
      });
  }
}

function executeSubmit(event) {
  event.preventDefault();

  userStatusMessage.innerHTML = '';
  userStatusMessage.style.color = 'black';
  clearTokens();

  const email = event.target.querySelector('#email');
  const password = event.target.querySelector('#password');

  if (event.submitter.defaultValue === 'Login') {
    requestStatus.innerHTML = 'Loggining...';

    User.doLogin(email.value, password.value)
      .then(response => {
        if (response.data.status !== 'error') {
          localStorage.setItem('access_token', JSON.stringify(response.data.body.access_token));
          localStorage.setItem('refresh_token', JSON.stringify(response.data.body.refresh_token));
          userStatusMessage.innerHTML = 'Logged in';
        } else {
          userStatusMessage.innerHTML = `${response.data.message}`;
          userStatusMessage.style.color = 'darkred';
        }
        return response;
      })
      .then(requestStatus.innerHTML = '')
      .catch(function (error) {
        requestStatus.innerHTML = `${error.message}`;
      });
  } else {
    requestStatus.innerHTML = 'Registering...';

    User.doRegistration({ 'email': email.value, 'password': password.value })
      .then(response => {
        if (response.data.status !== 'error') {
          email.value = '';
          password.value = '';
          addToLocalStorage(JSON.parse(response.config.data));
        }
        return response;
      })
      .then(response => {
        userStatusMessage.innerHTML = response.data.message;
        response.data.status === 'error' ? userStatusMessage.style.color = 'darkred'
          : userStatusMessage.style.color = 'black';
        requestStatus.innerHTML = '';
      })
      .catch(function (error) {
        requestStatus.innerHTML = `${error.message}`;
      });
  }
}

function clearTokens() {
  localStorage.setItem('access_token', JSON.stringify(''));
  localStorage.setItem('refresh_token', JSON.stringify(''));
}

//это я так, для себя
function addToLocalStorage(user) {
  const allUsers = getUsersFromLocalStorage();
  allUsers.push(user);
  localStorage.setItem('user', JSON.stringify(allUsers));
}

function getUsersFromLocalStorage() {
  return JSON.parse(localStorage.getItem('user') || '[]');
}
