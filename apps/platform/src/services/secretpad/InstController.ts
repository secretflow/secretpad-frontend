/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** create inst node POST /api/v1alpha1/inst/node/add */
export async function createNode(
  body?: API.CreateNodeRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_InstTokenVO_>('/api/v1alpha1/inst/node/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/inst/node/delete */
export async function deleteNode(
  body?: API.NodeIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/inst/node/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/inst/get */
export async function get(body?: API.InstRequest, options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_InstVO_>('/api/v1alpha1/inst/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** list all node POST /api/v1alpha1/inst/node/list */
export async function listNode(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_NodeVO__>('/api/v1alpha1/inst/node/list', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/inst/node/newToken */
export async function newToken(
  body?: API.NodeTokenRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_InstTokenVO_>(
    '/api/v1alpha1/inst/node/newToken',
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

/** util.sh post_kuscia_node POST /api/v1alpha1/inst/node/register */
export async function registerNode(
  params: {
    // query
    json_data?: string;
  },
  files?: File[],
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  if (files) {
    formData.append('certFile', files[0] || '');

    formData.append('keyFile', files[1] || '');

    formData.append('token', files[2] || '');
  }
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/inst/node/register', {
    method: 'POST',
    params: {
      ...params,
    },
    data: formData,
    ...(options || {}),
  });
}

/** get current token POST /api/v1alpha1/inst/node/token */
export async function token(
  body?: API.NodeTokenRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_InstTokenVO_>('/api/v1alpha1/inst/node/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
