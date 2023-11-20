/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/vote_sync/create */
export async function createAudit(
  body?: API.VoteSyncRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/vote_sync/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
