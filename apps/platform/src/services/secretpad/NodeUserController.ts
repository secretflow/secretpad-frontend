/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** create center account for remote node plateform
@param createAccountRequest create acctount request
@return successful SecretPadResponse
 POST /api/v1alpha1/user/node/create */
export async function create(
  body?: API.NodeUserCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/user/node/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** query use info by node id
@param createAccountRequest request
@return successful SecretPadResponse with result
 POST /api/v1alpha1/user/node/listByNodeId */
export async function listByNodeId(
  body?: API.NodeUserListByNodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_UserVO__>(
    '/api/v1alpha1/user/node/listByNodeId',
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

/** reset password
@param userRequest reset password request
@return response
 POST /api/v1alpha1/user/node/resetPassword */
export async function resetPwd(
  body?: API.ResetNodeUserPwdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>(
    '/api/v1alpha1/user/node/resetPassword',
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
