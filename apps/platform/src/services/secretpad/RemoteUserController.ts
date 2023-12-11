/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** create user
@param createAccountRequest request
@return response
 POST /api/v1alpha1/user/remote/create */
export async function create(
  body?: API.NodeUserCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/user/remote/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** query user by node id
@param request request
@return response
 POST /api/v1alpha1/user/remote/listByNodeId */
export async function listByNodeId(
  body?: API.NodeUserListByNodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_UserVO__>(
    '/api/v1alpha1/user/remote/listByNodeId',
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
