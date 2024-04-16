/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/feature_datasource/create */
export async function createFeatureDatasource(
  body?: API.CreateFeatureDatasourceRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse>('/api/v1alpha1/feature_datasource/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/feature_datasource/auth/list */
export async function projectFeatureTableList(
  body?: API.ListProjectFeatureDatasourceRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_FeatureDataSourceVO__>(
    '/api/v1alpha1/feature_datasource/auth/list',
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
