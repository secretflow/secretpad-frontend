/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Query graph node logs api
@param graphNodeLogsRequest query graph node cloud logs request
@return successful SecretPadResponse with graph node task logs view object
 POST /api/v1alpha1/cloud_log/sls */
export async function getCloudLog(
  body?: API.GraphNodeCloudLogsRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_CloudGraphNodeTaskLogsVO_>(
    '/api/v1alpha1/cloud_log/sls',
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
