/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Create a new node api
@param request create node request
@return successful SecretPadResponse with nodeId
 POST /api/v1alpha1/p2p/node/create */
export async function createP2pNode(
  body?: API.P2pCreateNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/p2p/node/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete collaborative node via router id
@param request delete collaborative node request
@return void
 POST /api/v1alpha1/p2p/node/delete */
export async function deleteP2pNode(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/p2p/node/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
