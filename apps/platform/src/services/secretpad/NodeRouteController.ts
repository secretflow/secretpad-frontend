/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/create */
export async function create(
  body?: API.CreateNodeRouterRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/nodeRoute/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** delete POST /api/v1alpha1/nodeRoute/delete */
export async function deleteUsingPOST(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/nodeRoute/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/get */
export async function get(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeRouterVO_>('/api/v1alpha1/nodeRoute/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/listNode */
export async function listNode(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_NodeVO__>(
    '/api/v1alpha1/nodeRoute/listNode',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/page */
export async function page(
  body?: API.PageNodeRouteRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_SecretPadPageResponse_NodeRouterVO__>(
    '/api/v1alpha1/nodeRoute/page',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/refresh */
export async function refresh(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeRouterVO_>(
    '/api/v1alpha1/nodeRoute/refresh',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/nodeRoute/update */
export async function update(
  body?: API.UpdateNodeRouterRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/nodeRoute/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
