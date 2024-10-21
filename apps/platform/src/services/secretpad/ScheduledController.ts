/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/graph/create */
export async function create(
  body?: API.ScheduledGraphCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/scheduled/graph/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/del */
export async function del(
  body?: API.ScheduledDelRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/scheduled/del', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/id */
export async function id(
  body?: API.ScheduledIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/scheduled/id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/info */
export async function info(
  body?: API.ScheduledInfoRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ProjectJobVO_>('/api/v1alpha1/scheduled/info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/job/list */
export async function listJob(
  body?: API.ScheduleListProjectJobRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_PageResponse_ProjectJobSummaryVO__>(
    '/api/v1alpha1/scheduled/job/list',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/offline */
export async function offline(
  body?: API.ScheduledOfflineRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/scheduled/offline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/graph/once/success */
export async function onceSuccess(
  body?: API.ScheduledGraphOnceSuccessRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Boolean_>(
    '/api/v1alpha1/scheduled/graph/once/success',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/page */
export async function page(
  body?: API.PageScheduledRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_SecretPadPageResponse_PageScheduledVO__>(
    '/api/v1alpha1/scheduled/page',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/task/info */
export async function taskInfo(
  body?: API.TaskInfoScheduledRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_ProjectJobVO_>(
    '/api/v1alpha1/scheduled/task/info',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/task/page */
export async function taskPage(
  body?: API.TaskPageScheduledRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_SecretPadPageResponse_TaskPageScheduledVO__>(
    '/api/v1alpha1/scheduled/task/page',
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

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/task/rerun */
export async function taskRerun(
  body?: API.TaskReRunScheduledRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/scheduled/task/rerun', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/v1alpha1/scheduled/task/stop */
export async function taskStop(
  body?: API.TaskStopScheduledRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/scheduled/task/stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
