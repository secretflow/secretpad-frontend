/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** list cooperating for edge user in center platform .
@param request NodeIdRequest
@return Node Info List
 POST /api/v1alpha1/node/edge/list */
export async function listCooperatingNode(
  body?: API.NodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_NodeVO__>('/api/v1alpha1/node/edge/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Interim plan, node info for edge user in edge platform . List all base info
@param request
@return
 POST /api/v1alpha1/node/edge/base/listOther */
export async function listNodeBaseInfo(
  body?: API.NodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_>('/api/v1alpha1/node/edge/base/listOther', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
