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
  userStatusMessage.style.color = 'black';
  console.log('access_token', localStorage.getItem('access_token'));
  console.log('refresh_token', localStorage.getItem('refresh_token'));
  if(
    !localStorage.getItem('access_token') ||
    !localStorage.getItem('refresh_token')
  ) {
    requestStatus.innerHTML = 'Log in, please...';
    return;
  }

  if (event.target.classList.contains("access")) {
    requestStatus.innerHTML = 'Access...';
  
    User.getAccess()
      .then(response => {
        console.log(response);
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
        console.log(response);
        if (response.data.statusCode === 200) {
          localStorage.setItem('access_token', response.data.body.access_token);
          userStatusMessage.innerHTML = 'Refershed';
        } else {
          userStatusMessage.innerHTML = `${response.data.body.message}`;
          userStatusMessage.style.color = 'darkred';
          clearTokens();
        }
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
        console.log(response);
        console.log('status_code', !!response.data['status_code']);
        if (!!response.data['status_code']) {
          userStatusMessage.innerHTML = `${response.data.body.message}`;
          userStatusMessage.style.color = 'darkred';
          return response;
        }
        if (response.data.status !== 'error') {
          localStorage.setItem('access_token', response.data.body.access_token);
          localStorage.setItem('refresh_token', response.data.body.refresh_token);
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
        console.log(response);
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
  localStorage.clear('access_token');
  localStorage.clear('refresh_token');
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
