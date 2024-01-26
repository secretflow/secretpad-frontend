/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** query user info
@return successful SecretPadResponse with user name
 POST /api/v1alpha1/user/get */
export async function get(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_UserContextDTO_>('/api/v1alpha1/user/get', {
    method: 'POST',
    ...(options || {}),
  });
}

/** Update user pwd by userName
@param userUpdatePwdRequest
@return {@link SecretPadResponse }<{@link Boolean }>
 POST /api/v1alpha1/user/updatePwd */
export async function updatePwd(
  body?: API.UserUpdatePwdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Boolean_>('/api/v1alpha1/user/updatePwd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
