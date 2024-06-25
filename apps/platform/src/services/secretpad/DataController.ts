/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Create data api
@param request create data request
@return successful SecretPadResponse with domain data id in apiLite
 POST /api/v1alpha1/data/create */
export async function createData(
  body?: API.CreateDataRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/data/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Download data api
@param response http servlet response
@param request download data request
 POST /api/v1alpha1/data/download */
export async function download(
  body?: API.DownloadDataRequest,
  options?: { [key: string]: any },
) {
  return request<API.OneApiResult_object_>('/api/v1alpha1/data/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Upload data api
@param nodeId target nodeId
@param file multipart file
@return successful SecretPadResponse with upload data result view object
 POST /api/v1alpha1/data/upload */
export async function upload(
  params: {
    // query
    /** target nodeId */
    'Node-Id'?: string;
  },
  files?: File[],
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  if (files) {
    formData.append('file', files[0] || '');
  }
  return request<API.SecretPadResponse_UploadDataResultVO_>(
    '/api/v1alpha1/data/upload',
    {
      method: 'POST',
      params: {
        ...params,
      },
      data: formData,
      ...(options || {}),
    },
  );
}
