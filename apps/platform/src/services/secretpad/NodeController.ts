/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Create a new node api
@param request create node request
@return successful SecretPadResponse with nodeId
 POST /api/v1alpha1/node/create */
export async function createNode(
  body?: API.CreateNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/node/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** delete node by node id
@param request node id
@return void
 POST /api/v1alpha1/node/delete */
export async function deleteNode(
  body?: API.NodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/node/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** get node info by nodeId
@param request nodeId
@return node info
 POST /api/v1alpha1/node/get */
export async function get(body?: API.NodeIdRequest, options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_NodeVO_>('/api/v1alpha1/node/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Query node result detail api
@param request get node result detail request
@return successful SecretPadResponse with node result detail view object
 POST /api/v1alpha1/node/result/detail */
export async function getNodeResultDetail(
  body?: API.GetNodeResultDetailRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeResultDetailVO_>(
    '/api/v1alpha1/node/result/detail',
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

/** List node api
@return successful SecretPadResponse with node view object list
 POST /api/v1alpha1/node/list */
export async function listNode(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_NodeVO__>('/api/v1alpha1/node/list', {
    method: 'POST',
    ...(options || {}),
  });
}

/** List node result api
@return successful SecretPadResponse with node result list view object
 POST /api/v1alpha1/node/result/list */
export async function listResults(
  body?: API.ListNodeResultRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeResultsListVO_>(
    '/api/v1alpha1/node/result/list',
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

/** get new token unused
@param request node id
@return token
 POST /api/v1alpha1/node/newToken */
export async function newToken(
  body?: API.NodeTokenRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeTokenVO_>('/api/v1alpha1/node/newToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** page node info
@param request page params
@return page of node
 POST /api/v1alpha1/node/page */
export async function page(
  body?: API.PageNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_SecretPadPageResponse_NodeVO__>(
    '/api/v1alpha1/node/page',
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

/** get now node stats
@param request node id
@return node info
 POST /api/v1alpha1/node/refresh */
export async function refresh(
  body?: API.NodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeVO_>('/api/v1alpha1/node/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** get exist token maybe used or unused
@param request node id
@return token
 POST /api/v1alpha1/node/token */
export async function token(
  body?: API.NodeTokenRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeTokenVO_>('/api/v1alpha1/node/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** update node info only address
@param request update node info
@return nodeId
 POST /api/v1alpha1/node/update */
export async function update(
  body?: API.UpdateNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/node/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
