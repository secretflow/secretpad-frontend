import { SearchOutlined } from '@ant-design/icons';
import type { RadioChangeEvent, TabsProps } from 'antd';
import {
  Breadcrumb,
  Input,
  Tabs,
  Select,
  Radio,
  Space,
  List,
  Skeleton,
  Button,
  Popconfirm,
  message,
} from 'antd';
import { parse } from 'query-string';
import type { ChangeEvent, ReactNode } from 'react';
import { history } from 'umi';

import { Model, getModel, useModel } from '@/util/valtio-helper';

import { HomeLayoutService } from '../layout/home-layout/home-layout.service';

import { ListItemDescRender, ListItemTitleRender } from './component/list-item';
import styles from './index.less';
import { MessageInfoModal } from './message-info/message-info.view';
import {
  MessageActiveTabType,
  MessageService,
  MessageState,
  MessageStateObj,
  SelectMessageOptions,
  SelectOptionsValueEnum,
  StatusEnum,
} from './message.service';

export const MessagBreadcrumb = ({ children }: { children: ReactNode }) => {
  const { nodeId } = parse(window.location.search);
  return (
    <div className={styles.messagePage}>
      <Breadcrumb
        items={[
          {
            title: (
              <div
                onClick={() => {
                  history.push({
                    pathname: '/node',
                    search: `nodeId=${nodeId}&tab=data-management`,
                  });
                }}
                style={{ cursor: 'pointer' }}
              >
                返回
              </div>
            ),
          },
          {
            title: '消息中心',
          },
        ]}
      />
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export const MessagePageView = () => {
  return (
    <MessagBreadcrumb>
      <MessageComponent />
    </MessagBreadcrumb>
  );
};

export const MessageComponent: React.FC = () => {
  const viewInstance = useModel(MessageModel);
  const { activeTab, changeTabs, messageService, filterState } = viewInstance;
  const items: TabsProps['items'] = [
    {
      key: MessageActiveTabType.PROCESS,
      label: (
        <>
          {'我处理的'}
          {/* <Badge showZero count={messageService.processCount} overflowCount={999} /> */}
        </>
      ),
    },
    {
      key: MessageActiveTabType.APPLY,
      label: (
        <>
          {'我发起的'}
          {/* <Badge showZero count={messageService.applyCount} overflowCount={999} /> */}
        </>
      ),
    },
  ];

  return (
    <div className={styles.messageContent}>
      <div className={styles.tabsHeader}>
        <Tabs
          defaultActiveKey={MessageActiveTabType.PROCESS}
          items={items}
          onChange={(e) => {
            changeTabs(e as MessageActiveTabType);
            viewInstance.showMessageInfoDrawer = false;
          }}
          type="card"
          activeKey={activeTab}
          tabBarExtraContent={
            <div className={styles.tabContent}>
              <Radio.Group
                defaultValue={MessageState.PENDING}
                style={{ marginBottom: 16 }}
                onChange={(e: RadioChangeEvent) => {
                  viewInstance.changefilterState(e.target.value);
                  viewInstance.getList();
                }}
                value={viewInstance.filterState}
              >
                {activeTab === MessageActiveTabType.APPLY && (
                  <Radio.Button value={MessageState.ALL}>全部</Radio.Button>
                )}
                <Radio.Button value={MessageState.PENDING}>
                  {activeTab === MessageActiveTabType.PROCESS
                    ? `待处理(${messageService.processCount})`
                    : '待处理'}
                </Radio.Button>
                <Radio.Button value={MessageState.PROCESS}>已处理</Radio.Button>
              </Radio.Group>
              <Select
                defaultValue={SelectOptionsValueEnum.ALL}
                style={{ width: 120 }}
                onChange={(value) => {
                  viewInstance.changeSelect(value);
                  viewInstance.getList();
                }}
                options={SelectMessageOptions}
              />
              <Input
                placeholder="搜索关键字"
                onChange={(e) => viewInstance.searchNode(e)}
                style={{ width: 200 }}
                suffix={
                  <SearchOutlined
                    style={{
                      color: '#aaa',
                    }}
                  />
                }
              />
            </div>
          }
        />
      </div>
      <div className={styles.listContent}>
        <List
          pagination={{
            hideOnSinglePage: viewInstance.pageSize > 10 ? false : true,
            showSizeChanger: true,
            size: 'default',
            total: viewInstance.totalNum || 1,
            current: viewInstance.pageNumber,
            pageSize: viewInstance.pageSize,
            onChange: (page, pageSize) => {
              viewInstance.pageNumber = page;
              viewInstance.pageSize = pageSize;
              viewInstance.getList();
            },
          }}
          dataSource={messageService.messageList}
          renderItem={(item) => (
            <List.Item>
              <Skeleton loading={messageService.loading} active>
                <List.Item.Meta
                  title={
                    <ListItemTitleRender
                      item={item}
                      activeTab={activeTab}
                      showInfoDrawer={viewInstance.showInfoDrawer}
                      filterState={viewInstance.filterState}
                    />
                  }
                  description={<ListItemDescRender item={item} activeTab={activeTab} />}
                />
                {activeTab === MessageActiveTabType.PROCESS &&
                  filterState === MessageState.PENDING && (
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() =>
                          viewInstance.processMessage(StatusEnum.AGREE, item.voteID!)
                        }
                      >
                        同意
                      </Button>
                      <Popconfirm
                        title="你确定要拒绝吗？"
                        placement="left"
                        destroyTooltipOnHide
                        onOpenChange={(open) => {
                          if (!open) {
                            viewInstance.setComment('');
                          }
                        }}
                        description={
                          <Input.TextArea
                            maxLength={50}
                            placeholder="请输50字符以内的理由"
                            allowClear
                            onChange={(e) => viewInstance.setComment(e.target.value)}
                          />
                        }
                        okText="拒绝"
                        cancelText="取消"
                        okButtonProps={{
                          danger: true,
                          ghost: true,
                        }}
                        onConfirm={async () => {
                          viewInstance.processMessage(StatusEnum.REJECT, item.voteID!);
                        }}
                      >
                        <Button type="default" size="small">
                          拒绝
                        </Button>
                      </Popconfirm>
                    </Space>
                  )}
              </Skeleton>
            </List.Item>
          )}
        />
        {viewInstance.chickMessageRecord && (
          <MessageInfoModal
            open={viewInstance.showMessageInfoDrawer}
            onClose={() => (viewInstance.showMessageInfoDrawer = false)}
            data={viewInstance.chickMessageRecord}
            activeTab={viewInstance.activeTab}
            onOk={viewInstance.refreshList}
          />
        )}
      </div>
    </div>
  );
};

export class MessageModel extends Model {
  readonly messageService;
  readonly homeLayoutService;

  constructor() {
    super();
    this.messageService = getModel(MessageService);
    this.homeLayoutService = getModel(HomeLayoutService);
  }

  onViewMount() {
    const { active, nodeId } = parse(window.location.search);
    if (nodeId) {
      this.nodeId = nodeId as string;
    }
    this.changeTabs((active as MessageActiveTabType) || MessageActiveTabType.PROCESS);
    this.getProcessMessage();
  }

  onViewUnMount(): void {
    this.showMessageInfoDrawer = false;
  }

  activeTab = MessageActiveTabType.PROCESS;

  filterState = MessageState.PENDING;

  selectType = SelectOptionsValueEnum.ALL;

  search = '';

  pageNumber = 1;

  pageSize = 10;

  totalNum = 1;

  comment = '';

  searchDebounce: number | undefined = undefined;

  showMessageInfoDrawer = false;

  chickMessageRecord: API.MessageVO | undefined = undefined;

  nodeId: string | undefined = undefined;

  resetPagination = () => {
    this.pageNumber = 1;
    this.pageSize = 10;
  };

  changeSelect = (value: SelectOptionsValueEnum) => {
    this.selectType = value;
  };

  changefilterState = (value: MessageState) => {
    this.filterState = value;
  };

  changeTabs = (key: MessageActiveTabType) => {
    this.activeTab = key;
    const locationSearch = parse(window.location.search);
    const { pathname } = window.location;
    const searchObj = {
      ...locationSearch,
      active: key,
    };
    const search = Object.entries(searchObj).reduce((pre, cur, index) => {
      return `${pre}${index === 0 ? '' : '&'}${cur[0]}=${cur[1]}`;
    }, '');
    history.replace({
      pathname,
      search,
    });
    if (key === MessageActiveTabType.APPLY) {
      this.changefilterState(MessageState.ALL);
    } else {
      this.changefilterState(MessageState.PENDING);
    }
    this.resetPagination();
    this.getList();
  };

  setComment = (value: string) => {
    this.comment = value;
  };

  searchNode = (e: ChangeEvent<HTMLInputElement>) => {
    this.search = e.target.value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.getList();
    }, 300) as unknown as number;
  };

  async getList(getProcessMessage = true) {
    const data = await this.messageService.getMessageList({
      page: this.pageNumber,
      size: this.pageSize,
      isInitiator: this.activeTab === MessageActiveTabType.APPLY ? true : false,
      nodeID: this.nodeId,
      isProcessed: MessageStateObj[this.filterState],
      type:
        this.selectType === SelectOptionsValueEnum.ALL ? undefined : this.selectType,
      keyWord: this.search,
    });
    this.totalNum = data?.total || 0;

    if (getProcessMessage) {
      if (this.activeTab === MessageActiveTabType.PROCESS) {
        this.getProcessMessage();
      }
    }
  }

  refreshList = () => {
    this.getList(false);
    this.getProcessMessage();
  };

  processMessage = async (action: StatusEnum, id: string) => {
    const { status } = await this.messageService.process({
      action,
      reason: this.comment,
      voteID: id,
      voteParticipantID: this.nodeId,
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      message.success('处理成功');
      this.refreshList();
    }
  };

  getProcessMessage = async () => {
    if (!this.nodeId) return;
    const res = await this.messageService.getMessageCount(this.nodeId);
    if (res.status) {
      this.homeLayoutService.setMessageCount(res?.data || 0);
      this.messageService.processCount = res?.data || 0;
    }
  };

  showInfoDrawer = (record: API.MessageVO) => {
    this.chickMessageRecord = record;
    this.showMessageInfoDrawer = true;
  };
}
