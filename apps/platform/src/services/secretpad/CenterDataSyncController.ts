/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 GET /sync */
export async function sync(
  params: {
    // query
    p?: string;
    // header
    'kuscia-origin-source'?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.SseEmitter>('/sync', {
    method: 'GET',
    headers: {
      'kuscia-origin-source': params['kuscia-origin-source']!,
    },
    params: {
      ...params,
    },
    responseType: 'text/event-stream',
    ...(options || {}),
  });
}
