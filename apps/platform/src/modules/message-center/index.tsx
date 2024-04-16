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
  Typography,
} from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { useEffect, type ChangeEvent, type ReactNode } from 'react';
import { history, useLocation } from 'umi';

import { Platform, hasAccess, isP2PWorkbench } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { P2pProjectListService } from '@/modules/p2p-project-list/p2p-project-list.service';
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
  P2PSelectMessageOptions,
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
                  if (hasAccess({ type: [Platform.AUTONOMY] })) {
                    history.push({
                      pathname: '/edge',
                      search: `nodeId=${nodeId}&tab=workbench`,
                    });
                  } else {
                    history.push({
                      pathname: '/node',
                      search: `nodeId=${nodeId}&tab=data-management`,
                    });
                  }
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
  const { pathname } = useLocation();
  const { activeTab, changeTabs, messageService, filterState, nodeId } = viewInstance;
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
  const { Link } = Typography;

  useEffect(() => {
    const onViewMount = async () => {
      const { active, nodeId } = parse(window.location.search);
      if (nodeId) {
        viewInstance.nodeId = nodeId as string;
      }
      await changeTabs(
        (active as MessageActiveTabType) || MessageActiveTabType.PROCESS,
        pathname,
      );
      // P2P 工作台要求如果我处理的数量为0,则默认跳转到我发起的页面
      if (
        isP2PWorkbench(pathname) &&
        activeTab === MessageActiveTabType.PROCESS &&
        filterState === MessageState.ALL &&
        viewInstance.selectType === SelectOptionsValueEnum.ALL &&
        viewInstance.totalNum === 0
      ) {
        changeTabs(MessageActiveTabType.APPLY, pathname);
      }
      viewInstance.getProcessMessage();
      viewInstance.p2pProjectListService.P2pProjectCallBack(viewInstance.getList);
    };
    viewInstance.pageSize = isP2PWorkbench(pathname) ? 5 : 10;
    onViewMount();
  }, [pathname]);

  const loadMore = isP2PWorkbench(pathname) && !!viewInstance.totalNum && (
    <div className={styles.showAll}>
      <Link
        onClick={() => {
          history.push(`/message?active=${activeTab}&nodeId=${nodeId}`);
        }}
      >
        查看全部
      </Link>
    </div>
  );

  const showEnterProjectButton = (item: Record<string, any>) => {
    // 所有节点都同意的项目邀约则可以进入项目
    if (
      item.type === SelectOptionsValueEnum.PROJECT_NODE_ADD &&
      item.initiatingTypeMessage.partyVoteStatuses?.every(
        (i: Record<string, any>) => i.action === StatusEnum.AGREE,
      )
    ) {
      return true;
    }
    // 项目归档则需要根据projectCreateVoteAction来判断当前项目的参与节点是否都同意创建项目
    if (
      item.type === SelectOptionsValueEnum.PROJECT_ARCHIVE &&
      item.initiatingTypeMessage.partyVoteStatuses?.every(
        (i: Record<string, any>) => i.projectCreateVoteAction === StatusEnum.AGREE,
      )
    ) {
      return true;
    }
    return false;
  };

  const showAgree = (item: { status?: string }) => {
    return (
      activeTab === MessageActiveTabType.PROCESS &&
      (filterState === MessageState.PENDING || filterState === MessageState.ALL) &&
      item.status === StatusEnum.PROCESS
    );
  };

  return (
    <div
      className={classNames(styles.messageContent, {
        [styles.p2pMessageContent]: isP2PWorkbench(pathname),
      })}
    >
      <div className={styles.tabsHeader}>
        <Tabs
          defaultActiveKey={MessageActiveTabType.PROCESS}
          items={items}
          onChange={(e) => {
            changeTabs(e as MessageActiveTabType, pathname);
            viewInstance.showMessageInfoDrawer = false;
          }}
          type="card"
          activeKey={activeTab}
          tabBarExtraContent={
            <div className={styles.tabContent}>
              {!isP2PWorkbench(pathname) && (
                <Radio.Group
                  defaultValue={MessageState.PENDING}
                  style={{ marginBottom: 16 }}
                  onChange={(e: RadioChangeEvent) => {
                    viewInstance.changefilterState(e.target.value);
                    viewInstance.getList();
                  }}
                  value={viewInstance.filterState}
                >
                  {/* {activeTab === MessageActiveTabType.APPLY && ( */}
                  <Radio.Button value={MessageState.ALL}>全部</Radio.Button>
                  {/* )} */}
                  <Radio.Button value={MessageState.PENDING}>
                    {activeTab === MessageActiveTabType.PROCESS
                      ? `待处理(${messageService.processCount})`
                      : '待处理'}
                  </Radio.Button>
                  <Radio.Button value={MessageState.PROCESS}>已处理</Radio.Button>
                </Radio.Group>
              )}
              {((isP2PWorkbench(pathname) &&
                activeTab !== MessageActiveTabType.APPLY) ||
                !isP2PWorkbench(pathname)) && (
                <Select
                  defaultValue={SelectOptionsValueEnum.ALL}
                  style={{ width: 120 }}
                  onChange={(value) => {
                    viewInstance.changeSelect(value);
                    viewInstance.getList();
                  }}
                  options={
                    isP2PWorkbench(pathname) || hasAccess({ type: [Platform.AUTONOMY] })
                      ? P2PSelectMessageOptions
                      : SelectMessageOptions
                  }
                />
              )}
              {!isP2PWorkbench(pathname) && (
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
              )}
            </div>
          }
        />
      </div>
      <div
        className={classNames(styles.listContent, {
          [styles.showPageListContent]: viewInstance.totalNum > 10,
        })}
      >
        <List
          pagination={
            isP2PWorkbench(pathname)
              ? false
              : {
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
                }
          }
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
                {hasAccess({ type: [Platform.AUTONOMY] }) &&
                  showEnterProjectButton(item) && (
                    <Button
                      onClick={() =>
                        history.push(
                          {
                            pathname: '/dag',
                            search: `projectId=${
                              item?.voteTypeMessage?.projectId
                            }&mode=${
                              item?.voteTypeMessage?.computeMode || 'MPC'
                            }&type=${item?.voteTypeMessage?.computeFunc || 'DAG'}`,
                          },
                          {
                            origin: isP2PWorkbench(pathname)
                              ? 'workbench'
                              : 'my-project',
                          },
                        )
                      }
                      type="link"
                      size="small"
                      style={{ marginRight: showAgree(item) ? 16 : 0, padding: 0 }}
                    >
                      进入项目
                    </Button>
                  )}
                {showAgree(item) && (
                  <Space size={12}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() =>
                        viewInstance.processMessage(
                          StatusEnum.AGREE,
                          item.voteID!,
                          pathname,
                        )
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
                        viewInstance.processMessage(
                          StatusEnum.REJECT,
                          item.voteID!,
                          pathname,
                        );
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
        {loadMore}
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
  readonly loginService;
  readonly p2pProjectListService;

  constructor() {
    super();
    this.messageService = getModel(MessageService);
    this.homeLayoutService = getModel(HomeLayoutService);
    this.loginService = getModel(LoginService);
    this.p2pProjectListService = getModel(P2pProjectListService);
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

  totalNum = 0;

  comment = '';

  searchDebounce: number | undefined = undefined;

  showMessageInfoDrawer = false;

  chickMessageRecord: API.MessageVO | undefined = undefined;

  nodeId: string | undefined = undefined;

  resetPagination = (pathname: string) => {
    this.pageNumber = 1;
    this.pageSize = isP2PWorkbench(pathname) ? 5 : 10;
  };

  changeSelect = (value: SelectOptionsValueEnum) => {
    this.selectType = value;
  };

  changefilterState = (value: MessageState) => {
    this.filterState = value;
  };

  changeTabs = async (key: MessageActiveTabType, pathname: string) => {
    this.activeTab = key;
    const locationSearch = parse(window.location.search);
    const searchObj = {
      ...locationSearch,
      active: key,
    };
    const search = Object.entries(searchObj).reduce((pre, cur, index) => {
      return `${pre}${index === 0 ? '' : '&'}${cur[0]}=${cur[1]}`;
    }, '');
    if (!isP2PWorkbench(pathname)) {
      history.replace({
        pathname,
        search,
      });
    }
    if (key === MessageActiveTabType.APPLY) {
      this.changefilterState(MessageState.ALL);
    } else {
      // this.changefilterState(MessageState.PENDING);
      this.changefilterState(MessageState.ALL);
    }
    this.resetPagination(pathname);
    await this.getList();
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

  getList = async (getProcessMessage = true) => {
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
  };

  refreshList = () => {
    this.getList(false);
    this.getProcessMessage();
  };

  processMessage = async (action: StatusEnum, id: string, pathname: string) => {
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
      if (isP2PWorkbench(pathname)) {
        this.p2pProjectListService.getListProject();
      }
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
