/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** rest password
@param userRequest request
@return response
 POST /api/v1alpha1/user/remote/resetPassword */
export async function resetPwd(
  body?: API.ResetNodeUserPwdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>(
    '/api/v1alpha1/user/remote/resetPassword',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      ...(options || {}),
    },
  );
}
