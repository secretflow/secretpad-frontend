/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** query environment info
@return successful SecretPadResponse with environment
 POST /api/v1alpha1/env/get */
export async function getEnv(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_EnvDTO_>('/api/v1alpha1/env/get', {
    method: 'POST',
    ...(options || {}),
  });
}
