/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/model/modelPartyPath */
export async function modelPartyPath(
  body?: API.ModelPartyPathRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_ModelPartyPathResponse__>(
    '/api/v1alpha1/model/modelPartyPath',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/model/pack */
export async function pack(
  body?: API.ModelExportPackageRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ModelExportPackageResponse_>(
    '/api/v1alpha1/model/pack',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/model/status */
export async function status(
  body?: API.ModelExportStatusRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/model/status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
