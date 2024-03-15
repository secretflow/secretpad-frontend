/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/model/serving/create */
export async function createServing(
  body?: API.CreateModelServingRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ModelPartiesVO_>(
    '/api/v1alpha1/model/serving/create',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/model/delete */
export async function deleteModelPack(
  body?: API.DeleteModelPackRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/model/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/model/serving/delete */
export async function deleteModelServing(
  body?: API.DeleteModelServingRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/model/serving/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/model/discard */
export async function discardModelPack(
  body?: API.DiscardModelPackRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/model/discard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/model/detail */
export async function modelPackDetail(
  body?: API.QueryModelDetailRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ModelPackDetailVO_>(
    '/api/v1alpha1/model/detail',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/model/info */
export async function modelPackInfo(
  body?: API.QueryModelDetailRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ModelPackInfoVO_>('/api/v1alpha1/model/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/model/page */
export async function modelPackPage(
  body?: API.QueryModelPageRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ModelPackListVO_>('/api/v1alpha1/model/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/model/serving/detail */
export async function modelServing(
  body?: API.QueryModelServingRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ServingDetailVO_>(
    '/api/v1alpha1/model/serving/detail',
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
