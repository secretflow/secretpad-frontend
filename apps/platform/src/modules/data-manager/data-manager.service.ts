import { listDatatables } from '@/services/secretpad/DatatableController';
import { Model } from '@/util/valtio-helper';

export class DataManagerService extends Model {
  async listDataTables(
    ownerId: string,
    pageNum: number,
    pageSize: number,
    status: string,
    search: string,
    typeFilters: string[],
    nodeNamesFilter: string[] | null,
  ) {
    const result = await listDatatables({
      ownerId,
      pageNumber: pageNum,
      pageSize,
      statusFilter: status,
      datatableNameFilter: search,
      types: typeFilters,
      nodeNamesFilter,
    });
    return result.data;
  }
}

export enum UploadStatus {
  RUNNING = 'RUNNING', // 数据正在加密
  SUCCESS = 'SUCCESS', // 数据已成功加密上传
  FAILED = 'FAILED', // 数据上传失败
}

export enum DataSheetType {
  'CSV' = 'CSV',
  'HTTP' = 'HTTP',
  'OSS' = 'OSS',
}

export enum DataSourceType {
  OSS = 'OSS',
  HTTP = 'HTTP',
  ODPS = 'ODPS',
  LOCAL = 'LOCAL',
}
