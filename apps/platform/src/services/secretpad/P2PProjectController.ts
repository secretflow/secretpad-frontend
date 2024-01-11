/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Create a new project api
@param request create project request
@return successful SecretPadResponse with create project view object
 POST /api/v1alpha1/p2p/project/create */
export async function createP2PProject(
  body?: API.CreateProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_CreateProjectVO_>(
    '/api/v1alpha1/p2p/project/create',
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

/** List project api
@return successful SecretPadResponse with project view object list
 POST /api/v1alpha1/p2p/project/list */
export async function listP2PProject(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_ProjectVO__>(
    '/api/v1alpha1/p2p/project/list',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** Archive project api
@return successful SecretPadResponse with project archive
 POST /api/v1alpha1/p2p/project/archive */
export async function projectArchive(
  body?: API.ArchiveProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_List_ProjectVO__>(
    '/api/v1alpha1/p2p/project/archive',
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

/** Update project api
@param request update project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/p2p/project/update */
export async function updateProject(
  body?: API.UpdateProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/p2p/project/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
