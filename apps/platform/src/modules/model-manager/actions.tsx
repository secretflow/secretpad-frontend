import { ModelStatus } from './types';

export const ModelStatusSelectOptions = [
  { value: '', label: '全部状态' },
  { value: ModelStatus.PENDING, label: '待发布' },
  { value: ModelStatus.PUBLISHING, label: '发布中' },
  { value: ModelStatus.PUBLISHED, label: '已发布' },
  { value: ModelStatus.FAILED, label: '发布失败' },
  { value: ModelStatus.OFFLINE, label: '已下线' },
  { value: ModelStatus.DISCARDED, label: '已废弃' },
];
