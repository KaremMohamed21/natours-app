/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

// update user data
export const updateUserData = async data => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      withCredentials: true,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Updated!');
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const updatePassword = async data => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      withCredentials: true,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password Updated!');
    }
  } catch (err) {
    // console.log(err);
    showAlert('error', err.response.data.message);
  }
};
