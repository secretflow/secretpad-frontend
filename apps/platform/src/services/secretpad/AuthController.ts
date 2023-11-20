/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** User login api
@param response http servlet response
@param request login request
@return successful SecretPadResponse with token
 POST /api/login */
export async function login(
  params: {
    // query
    /** http servlet response */
    response?: API.HttpServletResponse;
  },
  body?: API.LoginRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_UserContextDTO_>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
      response: undefined,
      ...params['response'],
    },
    data: body,
    ...(options || {}),
  });
}

/** User logout api
@param request http servlet request
@param logoutRequest logout request
@return successful SecretPadResponse with user name
 POST /api/logout */
export async function logout(
  params: {
    // query
    /** http servlet request */
    request?: API.HttpServletRequest;
  },
  body?: API.LogoutRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
      request: undefined,
      ...params['request'],
    },
    data: body,
    ...(options || {}),
  });
}
