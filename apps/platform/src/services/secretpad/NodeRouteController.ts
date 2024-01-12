/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import request from 'umi-request';

/** delete delete domainRoute only for this routeId
@param request routeId
@return void
 POST /api/v1alpha1/nodeRoute/delete */
export async function deleteUsingPOST(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_Void_>('/api/v1alpha1/nodeRoute/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** get domainRoute info by routeId
@param request domainRouteId
@return domainRoute info
 POST /api/v1alpha1/nodeRoute/get */
export async function get(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeRouterVO_>('/api/v1alpha1/nodeRoute/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** select list domain for dst create dst domainRoute
@return list of domain info
 POST /api/v1alpha1/nodeRoute/listNode */
export async function listNode(options?: { [key: string]: any }) {
  return request<API.SecretPadResponse_List_NodeVO__>(
    '/api/v1alpha1/nodeRoute/listNode',
    {
      method: 'POST',
      ...(options || {}),
    },
  );
}

/** page request for query domain route
@param query dst domain name id address
@return page of domainRoute
 POST /api/v1alpha1/nodeRoute/page */
export async function page(
  body?: API.PageNodeRouteRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_SecretPadPageResponse_NodeRouterVO__>(
    '/api/v1alpha1/nodeRoute/page',
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

/** get domainRoute now stats
@param request routeId
@return RouteInfo
 POST /api/v1alpha1/nodeRoute/refresh */
export async function refresh(
  body?: API.RouterIdRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_NodeRouterVO_>(
    '/api/v1alpha1/nodeRoute/refresh',
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

/** update domainRoute info by routeId
@param request dst domainRoute address and domainRouteId
@return domainRouteId
 POST /api/v1alpha1/nodeRoute/update */
export async function update(
  body?: API.UpdateNodeRouterRequest,
  options?: { [key: string]: any },
) {
  return request<API.SecretPadResponse_String_>('/api/v1alpha1/nodeRoute/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
