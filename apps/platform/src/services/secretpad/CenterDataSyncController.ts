/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 GET /sync/${param0} */
export async function sync(
  params: {
    // query
    p?: string;
    // path
    nodeId?: string;
  },
  options?: { [key: string]: any },
) {
  const { nodeId: param0, ...queryParams } = params;
  return request<API.SseEmitter>(`/sync/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    responseType: 'text/event-stream',
    ...(options || {}),
  });
}
