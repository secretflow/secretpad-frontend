/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/approval/create */
export async function create(
  body?: API.CreateApprovalRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/approval/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/approval/pull/status */
export async function pullStatus(
  body?: API.PullStatusRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_PullStatusVO_>(
    '/api/v1alpha1/approval/pull/status',
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
