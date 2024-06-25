/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** Add datatable to the project api
@param request add datatable to project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/datatable/add */
export async function addProjectDatatable(
  body?: API.AddProjectDatatableRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/project/datatable/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Add institution to the project api
@param request add institution to project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/inst/add */
export async function addProjectInst(
  body?: API.AddInstToProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/project/inst/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Add node to the project api
@param request add node to project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/node/add */
export async function addProjectNode(
  body?: API.AddNodeToProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/project/node/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Create a new project api
@param request create project request
@return successful SecretPadResponse with create project view object
 POST /api/v1alpha1/project/create */
export async function createProject(
  body?: API.CreateProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_CreateProjectVO_>(
    '/api/v1alpha1/project/create',
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

/** Delete project api
@param request delete project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/delete */
export async function deleteProject(
  body?: API.GetProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/project/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Delete datatable and cancel datatable authorization in the project api
@param request delete project datatable request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/datatable/delete */
export async function deleteProjectDatatable(
  body?: API.DeleteProjectDatatableRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>(
    '/api/v1alpha1/project/datatable/delete',
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

/** Query project job detail api
@param request get project job request
@return successful SecretPadResponse with project job view object
 POST /api/v1alpha1/project/job/get */
export async function getJob(
  body?: API.GetProjectJobRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ProjectJobVO_>('/api/v1alpha1/project/job/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Query project job task logs api
@param request get project job task log request
@return successful SecretPadResponse with graph node task logs view object
 POST /api/v1alpha1/project/job/task/logs */
export async function getJobLog(
  body?: API.GetProjectJobTaskLogRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphNodeTaskLogsVO_>(
    '/api/v1alpha1/project/job/task/logs',
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

/** Query project job task output api
@param request get project job task output request
@return successful SecretPadResponse with graph node output view object
 POST /api/v1alpha1/project/job/task/output */
export async function getJobTaskOutput(
  body?: API.GetProjectJobTaskOutputRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_GraphNodeOutputVO_>(
    '/api/v1alpha1/project/job/task/output',
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

/** Query project detail api
@param request get project request
@return successful SecretPadResponse with project view object
 POST /api/v1alpha1/project/get */
export async function getProject(
  body?: API.GetProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ProjectVO_>('/api/v1alpha1/project/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** project_graph_node outputs fix derived fields for chexian
@param request projectId graphId
@return ProjectOutputVO
 POST /api/v1alpha1/project/getOutTable */
export async function getProjectAllOutTable(
  body?: API.GetProjectGraphRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ProjectOutputVO_>(
    '/api/v1alpha1/project/getOutTable',
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

/** Query project datatable detail api
@param request get project request
@return successful SecretPadResponse with project datatable view object
 POST /api/v1alpha1/project/datatable/get */
export async function getProjectDatatable(
  body?: API.GetProjectDatatableRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Object_>('/api/v1alpha1/project/datatable/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** create project chose tee domain id ,this is for the chose list
@return successful SecretPadResponse with tee node list view object
 POST /api/v1alpha1/project/tee/list */
export async function getTeeNodeList(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_NodeVO__>(
    '/api/v1alpha1/project/tee/list',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** Paging list project job list api
@param request list project job request
@return successful SecretPadResponse with paging project job summary view object
 POST /api/v1alpha1/project/job/list */
export async function listJob(
  body?: API.ListProjectJobRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_PageResponse_ProjectJobSummaryVO__>(
    '/api/v1alpha1/project/job/list',
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
 POST /api/v1alpha1/project/list */
export async function listProject(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_ProjectVO__>('/api/v1alpha1/project/list', {
    method: 'POST',
    ...(options || {}),
  });
}

/** Update project schema api
@param request update project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/datasource/list */
export async function projectGraphDomainDataSourceList(
  body?: API.GetProjectGraphDomainDataSourceRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Set_ProjectGraphDomainDataSourceVO__>(
    '/api/v1alpha1/project/datasource/list',
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

/** Stop project job api
@param request stop project job task request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/job/stop */
export async function stopJob(
  body?: API.StopProjectJobTaskRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/project/job/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Update project api
@param request update project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/update */
export async function updateProject(
  body?: API.UpdateProjectRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/project/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Update project schema api
@param request update project request
@return successful SecretPadResponse with null data
 POST /api/v1alpha1/project/update/tableConfig */
export async function updateProjectTableConfig(
  body?: API.AddProjectDatatableRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>(
    '/api/v1alpha1/project/update/tableConfig',
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
