/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/datasource/create */
export async function create(
  body?: API.CreateDatasourceRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_CreateDatasourceVO_>(
    '/api/v1alpha1/datasource/create',
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

/** delete POST /api/v1alpha1/datasource/delete */
export async function deleteUsingPOST(
  body?: API.DeleteDatasourceRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/datasource/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/datasource/detail */
export async function detail(
  body?: API.DatasourceDetailRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_DatasourceDetailVO_>(
    '/api/v1alpha1/datasource/detail',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/datasource/list */
export async function list(
  body?: API.DatasourceListRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_DatasourceListVO_>(
    '/api/v1alpha1/datasource/list',
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
