/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** All page requests are returned to this index, and the front end handles page routing
@return the string
 GET / */
export async function index(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /dag/ */
export async function indexUsingGET(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/dag/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_10 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /edge/ */
export async function index10(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/edge/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_11 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /edge */
export async function index11(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/edge', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_12 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /model-submission/ */
export async function index12(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/model-submission/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_2 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /home/ */
export async function index2(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/home/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_3 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /node/ */
export async function index3(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/node/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_4 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /guide/ */
export async function index4(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/guide/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_5 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /record/ */
export async function index5(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/record/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_6 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /login/ */
export async function index6(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/login/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_7 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /logout/ */
export async function index7(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/logout/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_8 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /my-node/ */
export async function index8(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/my-node/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** index_9 All page requests are returned to this index, and the front end handles page routing
@return the string
 GET /message/ */
export async function index9(options?: { [key: string]: any }) {
  return request<API.OneApiResult_string_>('/message/', {
    method: 'GET',
    ...(options || {}),
  });
}
