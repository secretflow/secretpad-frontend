import { history } from 'umi';
import request from 'umi-request';

request.interceptors.request.use((url, options) => {
  return {
    url: `${url}`,
    options: {
      ...options,
      mode: 'cors',
      credentials: 'include',
      interceptors: true,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };
});

request.interceptors.response.use(async (response) => {
  const { status } = await response.clone().json();
  if (status.code === 202011601 || status.code === 202011602) {
    history.push('/login');
  }
  return response;
});
