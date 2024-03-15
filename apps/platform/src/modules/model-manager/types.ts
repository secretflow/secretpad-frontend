export enum ModelStatus {
  PENDING = 'INIT',
  FAILED = 'PUBLISH_FAIL',
  PUBLISHED = 'PUBLISHED',
  OFFLINE = 'OFFLINE',
  DISCARDED = 'DISCARDED',
  PUBLISHING = 'PUBLISHING',
}

export interface ModelServiceProtocol {
  getModelList: (projectId: string) => Promise<any[]>;

  publish: (params: API.CreateModelServingRequest) => Promise<void>;
  delete: (modelId: string) => Promise<void>;
  discard: (modelId: string) => Promise<void>;
  getModelServiceInfo: (modelId: string) => Promise<any>;

  setOffline: (modelId: string) => Promise<any>;
}

export enum ModelActions {
  PUBLISH = 'PUBLISH',
  DISCARD = 'DISCARD',
  OFFLINE = 'OFFLINE',
  INFO = 'INFO',
  DELETE = 'DELETE',
}
