/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** list secretflow component version
@return successful SecretPadResponse with secretflow component version
 POST /api/v1alpha1/version/list */
export async function listVersion(options?: { [key: string]: any }) {
  return request<API.OrgSecretflowSecretpadCommonDtoSecretPadResponse_ComponentVersion_>(
    '/api/v1alpha1/version/list',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}
