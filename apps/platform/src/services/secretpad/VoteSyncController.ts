/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** the sync method of edge push to center
@param voteSyncRequest
@return
 POST /api/v1alpha1/vote_sync/create */
export async function sync(
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
