/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** vote detail
@param messageDetailRequest
@return
 POST /api/v1alpha1/message/detail */
export async function detail(
  body?: API.MessageDetailRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_MessageDetailVO_>(
    '/api/v1alpha1/message/detail',
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

/** vote info list
@param request
@return
 POST /api/v1alpha1/message/list */
export async function list(
  body?: API.MessageListRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_MessageListVO_>('/api/v1alpha1/message/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** the count of vote ,waiting for reply
@param messagePendingCountRequest
@return
 POST /api/v1alpha1/message/pending */
export async function pending(
  body?: API.MessagePendingCountRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Long_>('/api/v1alpha1/message/pending', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** vote invite reply
@param voteReplyRequest
@return
 POST /api/v1alpha1/message/reply */
export async function reply(
  body?: API.VoteReplyRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
