/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/data/sync */
export async function sync(
  params: {
    // header
    'kuscia-origin-source'?: string;
  },
  body?: string,
  options?: { [key: string]: any },
) {
  return request<API.OrgSecretflowSecretpadCommonDtoSecretPadResponse_SyncDataDTO_>(
    '/api/v1alpha1/data/sync',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'kuscia-origin-source': params['kuscia-origin-source']!,
      },
      params: { ...params },
      data: body,
      ...(options || {}),
    },
  );
}
