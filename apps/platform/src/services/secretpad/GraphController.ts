/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Batch query component detail list api
@param request get component request list
@return successful SecretPadResponse with component detail list
 POST /api/v1alpha1/component/batch */
export async function batchGetComponent(
  body?: Array<API.GetComponentRequest>,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/component/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Create a new graph api
@param request create graph request
@return successful SecretPadResponse with create graph view object
 POST /api/v1alpha1/graph/create */
export async function createGraph(
  body?: API.CreateGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_CreateGraphVO_>('/api/v1alpha1/graph/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete graph api
@param request delete graph request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/delete */
export async function deleteGraph(
  body?: API.DeleteGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/graph/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Fully update graph api
@param request full update graph request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/update */
export async function fullUpdateGraph(
  body?: API.FullUpdateGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/graph/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Query graph detail api
@param request get graph detail request
@return successful SecretPadResponse with graph detail view object
 POST /api/v1alpha1/graph/detail */
export async function getGraphDetail(
  body?: API.GetGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphDetailVO_>('/api/v1alpha1/graph/detail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Query graph node logs api
@param request query graph node logs request
@return successful SecretPadResponse with graph node task logs view object
 POST /api/v1alpha1/graph/node/logs */
export async function getGraphNodeLogs(
  body?: API.GraphNodeLogsRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphNodeTaskLogsVO_>(
    '/api/v1alpha1/graph/node/logs',
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

/** Query graph node output api
@param request query graph node output request
@return successful SecretPadResponse with graph node output view object
 POST /api/v1alpha1/graph/node/output */
export async function getGraphNodeOutput(
  body?: API.GraphNodeOutputRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphNodeOutputVO_>(
    '/api/v1alpha1/graph/node/output',
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

/** Refresh node max index api
@param request update graph node request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/node/max_index */
export async function graphNodeMaxIndexRefresh(
  body?: API.GraphNodeMaxIndexRefreshRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphNodeMaxIndexRefreshVO_>(
    '/api/v1alpha1/graph/node/max_index',
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

/** List component international config api
@return successful SecretPadResponse with component international config
 POST /api/v1alpha1/component/i18n */
export async function listComponentI18n(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/component/i18n', {
    method: 'POST',
    ...(options || {}),
  });
}

/** List component api
@return successful SecretPadResponse with component list view object
 POST /api/v1alpha1/component/list */
export async function listComponents(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_Map_String_CompListVO__>(
    '/api/v1alpha1/component/list',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** List graph api
@param request list graph request
@return successful SecretPadResponse with graph meta view object list
 POST /api/v1alpha1/graph/list */
export async function listGraph(
  body?: API.ListGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_GraphMetaVO__>('/api/v1alpha1/graph/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** List graph node status api
@param request list graph node status request
@return successful SecretPadResponse with graph status
 POST /api/v1alpha1/graph/node/status */
export async function listGraphNodeStatus(
  body?: API.ListGraphNodeStatusRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphStatus_>(
    '/api/v1alpha1/graph/node/status',
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

/** Start graph api
@param request start graph request
@return successful SecretPadResponse with start graph view object
 POST /api/v1alpha1/graph/start */
export async function startGraph(
  body?: API.StartGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_StartGraphVO_>('/api/v1alpha1/graph/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Stop graph node api
@param request stop graph node request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/stop */
export async function stopGraphNode(
  body?: API.StopGraphNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/graph/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Update graph meta information api
@param request update graph meta request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/meta/update */
export async function updateGraphMeta(
  body?: API.UpdateGraphMetaRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/graph/meta/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Update graph node api
@param request update graph node request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/graph/node/update */
export async function updateGraphNode(
  body?: API.UpdateGraphNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/graph/node/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
