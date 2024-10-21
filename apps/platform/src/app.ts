import { history } from 'umi';
import request from 'umi-request';
import { v4 as uuidv4 } from 'uuid';

request.interceptors.request.use((url, options) => {
  const traceId = uuidv4(); // 生成唯一的 traceId
  const token = localStorage.getItem('User-Token') || '';
  return {
    url: `${url}`,
    options: {
      ...options,
      mode: 'cors',
      credentials: 'include',
      interceptors: true,
      headers: {
        'Content-Type': 'application/json',
        'User-Token': token,
        'Trace-Id': traceId,
      },
    },
  };
});

request.interceptors.response.use(async (response) => {
  const { status } = await response.clone().json();
  if (status.code === 202011602) {
    history.push('/login');
  }
  return response;
});
