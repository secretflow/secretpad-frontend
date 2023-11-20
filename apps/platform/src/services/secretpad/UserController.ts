/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** create account
@param userCreateRequest create account request
@return successful SecretPadResponse with user name
 POST /api/v1alpha1/user/create */
export async function create(
  body?: API.UserCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/user/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** query user info
@return successful SecretPadResponse with user name
 POST /api/v1alpha1/user/get */
export async function get(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_UserContextDTO_>('/api/v1alpha1/user/get', {
    method: 'POST',
    ...(options || {}),
  });
}
