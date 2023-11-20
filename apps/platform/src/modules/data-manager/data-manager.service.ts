import { listDatatables } from '@/services/secretpad/DatatableController';
import { Model } from '@/util/valtio-helper';

export class DataManagerService extends Model {
  async listDataTables(
    nodeId: string,
    pageNum: number,
    pageSize: number,
    status: string,
    search: string,
  ) {
    const result = await listDatatables({
      nodeId,
      pageNumber: pageNum,
      pageSize,
      statusFilter: status,
      datatableNameFilter: search,
    });
    return result.data;
  }
}

export enum UploadStatus {
  RUNNING = 'RUNNING', // 数据正在加密
  SUCCESS = 'SUCCESS', // 数据已成功加密上传
  FAILED = 'FAILED', // 数据上传失败
}
