/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** User login api
@param request login request
@return successful SecretPadResponse with token
 POST /api/login */
export async function login(body?: API.LoginRequest, options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_UserContextDTO_>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** User logout api
@param request http servlet request
@return {@link SecretPadResponse }<{@link String }>
@author lihaixin
@date 2023/12/15
 POST /api/logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_String_>('/api/logout', {
    method: 'POST',
    ...(options || {}),
  });
}
