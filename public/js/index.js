/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateUserData, updatePassword } from './updateSettings';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginFrom = document.querySelector('.form--login');
const UserDataForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const bookingBtn = document.getElementById('book-tour');
const logOutBtn = document.querySelector('.nav__el--logout');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginFrom) {
  loginFrom.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (UserDataForm) {
  UserDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-user').textContent = 'updating...';

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateUserData(form);

    window.setTimeout(() => {
      location.reload(true);
    }, 1000);
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updatePassword({ currentPassword, password, passwordConfirm });

    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

if (bookingBtn) {
  bookingBtn.addEventListener('click', e => {
    e.target.textContent = 'processing...';
    const tourId = e.target.dataset.tourId;

    bookTour(tourId);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
