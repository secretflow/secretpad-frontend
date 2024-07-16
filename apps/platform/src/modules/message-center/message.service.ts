import { list, reply, pending, detail } from '@/services/secretpad/MessageController';
import { Model } from '@/util/valtio-helper';
import { message } from 'antd';

/**
 * This is the service for a message center list. There are list of message items. It allows processing
 * messages and getting message count
 */
export class MessageService extends Model {
  /**
   * Message detail loading state
   */
  messageInfoLoading = false;

  /**
   * Message detail
   */
  messageDetail: Record<string, any> = {};

  /**
   * Message list loading state
   */
  loading = false;

  /**
   * Number of messages applied
   */
  applyCount = 0;

  /**
   * Number of pending messages
   */
  processCount = 0;

  /**
   * Message process loading
   */
  processLoading: {
    rejectLoading: boolean;
    agreeLoading: boolean;
    type: string | undefined;
  } = {
    rejectLoading: false,
    agreeLoading: false,
    type: undefined,
  };

  /**
   * Messages list
   */
  messageList: API.MessageVO[] = [];

  /**
   * Get message list
   *
   * @param params
   * @param type is pending or applied
   */
  getMessageList = async (params: API.MessageListRequest) => {
    this.loading = true;
    const { data } = await list(params);
    this.loading = false;
    this.messageList = data?.messages || [];
    return data;
  };

  /**
   * Process messages
   *
   * @param Agree or reject
   */
  process = async (params: API.VoteReplyRequest) => {
    this.processLoading = {
      type: params.action,
      rejectLoading: params.action === StatusEnum.REJECT ? true : false,
      agreeLoading: params.action === StatusEnum.AGREE ? true : false,
    };
    const res = await reply(params);
    this.processLoading = {
      rejectLoading: false,
      agreeLoading: false,
      type: undefined,
    };
    return res;
  };

  /**
   * process message count
   * @param nodeID
   * @returns
   */
  getMessageCount = async (nodeID: string) => {
    const res = await pending({ nodeID });
    return res;
  };

  /**
   *
   * @param messageId
   * @returns
   */
  getMessageDetail = async (params: API.MessageDetailRequest) => {
    this.messageInfoLoading = true;
    const info = await detail(params);
    if (info.status && info.status.code === 0 && info.data) {
      this.messageDetail = info.data;
    } else {
      this.messageDetail = {};
      message.error(info?.status?.msg);
    }
    this.messageInfoLoading = false;
  };
}

export enum MessageActiveTabType {
  PROCESS = 'process',
  APPLY = 'apply',
}

export enum MessageState {
  ALL = '',
  PENDING = 'PENDING',
  PROCESS = 'PROCESS',
}

export const MessageStateObj = {
  [MessageState.ALL]: undefined,
  [MessageState.PENDING]: false,
  [MessageState.PROCESS]: true,
};

export enum StatusEnum {
  PROCESS = 'REVIEWING',
  AGREE = 'APPROVED',
  REJECT = 'REJECTED',
}

export const StatusTextObj = {
  [StatusEnum.PROCESS]: {
    text: '待同意',
    labelStyle: {
      backgroundColor: '#65A4FD',
    },
    textStyle: {
      backgroundColor: '#F0F5FF',
      border: '1px solid #65A4FD',
      color: '#0068FA',
    },
  },
  [StatusEnum.AGREE]: {
    text: '已同意',
    labelStyle: {
      backgroundColor: '#36C872',
    },
    textStyle: {
      backgroundColor: '#ECFFF4',
      border: '1px solid #68D092',
      color: '#23B65F',
    },
  },
  [StatusEnum.REJECT]: {
    text: '已拒绝',
    labelStyle: {
      backgroundColor: '#f50',
    },
    textStyle: {
      backgroundColor: '#FFF1F0',
      border: '1px solid #FB9D9D',
      color: '#FC7574',
    },
  },
};

export enum SelectOptionsValueEnum {
  TEE_DOWNLOAD = 'TEE_DOWNLOAD',
  NODE_ROUTE = 'NODE_ROUTE',
  PROJECT_ARCHIVE = 'PROJECT_ARCHIVE',
  PROJECT_NODE_ADD = 'PROJECT_CREATE',
  ALL = 'ALL',
}

export const SelectMessageOptions = [
  { value: SelectOptionsValueEnum.TEE_DOWNLOAD, label: '结果下载' },
  { value: SelectOptionsValueEnum.NODE_ROUTE, label: '节点合作' },
  { value: SelectOptionsValueEnum.ALL, label: '全部类型' },
];

export const P2PSelectMessageOptions = [
  { value: SelectOptionsValueEnum.PROJECT_ARCHIVE, label: '项目归档' },
  { value: SelectOptionsValueEnum.PROJECT_NODE_ADD, label: '项目邀约' },
  { value: SelectOptionsValueEnum.ALL, label: '全部类型' },
];

export type NodeStatusList = {
  nodeID: string;
  nodeName: string;
  action: StatusEnum;
  reason: string;
};
