import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Empty, Tag } from 'antd';
import { Button, Typography, Tooltip, Input, Space } from 'antd';
import { Spin } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import React from 'react';
import { history, useLocation } from 'umi';

import { EdgeRouteWrapper, isP2PWorkbench } from '@/components/platform-wrapper';
import { P2PCreateProjectModal } from '@/modules/create-project/p2p-create-project/p2p-create-project.view';
import { formatTimestamp } from '@/modules/dag-result/utils';
import { EditProjectModal } from '@/modules/project-list/components/edit-project';
import {
  ProjectNodePopover,
  ProjectPipeLinePopover,
  ProjectTaskPopover,
} from '@/modules/project-list/components/popover';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { AuthProjectTag } from '../p2p-project-list/components/auth-project-tag';
import {
  SelectProjectState,
  checkAllApproved,
} from '../p2p-project-list/components/common';
import {
  ComputeModeType,
  P2pProjectButtons,
  ProjectComputeModeSelect,
  ProjectStateSelect,
  ProjectStatus,
  RadioGroup,
  RadioGroupState,
  computeModeText,
} from '../p2p-project-list/components/common';

import { ProjectTypeTag } from './components/project-type-tag';
import styles from './index.less';
import { P2pProjectListService } from './p2p-project-list.service';

export const P2pProjectListComponent: React.FC = () => {
  const projectListModel = useModel(ProjectListModel);
  const p2pProjectService = useModel(P2pProjectListService);

  const { pathname } = useLocation();

  const { handleCreateProject } = projectListModel;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { displayProjectList: projectList } = p2pProjectService;

  const { Title, Paragraph } = Typography;

  const { nodeId } = parse(window.location.search);

  useEffect(() => {
    p2pProjectService.getListProject();
  }, []);

  const [editProjectData, setEditProjectData] = useState({});

  const [hoverCurrent, setHoverCurrent] = useState(-1);

  const { Link } = Typography;

  const loadMore = isP2PWorkbench(pathname) && projectList.length > 6 && (
    <div className={styles.showAll}>
      <Link
        style={{ color: 'rgba(0,0,0,0.45)' }}
        onClick={() => {
          history.push(`/edge?nodeId=${nodeId}&tab=my-project`);
        }}
      >
        查看全部
      </Link>
    </div>
  );

  const [searchInput, setSearchInput] = useState('');
  const searchProject = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    projectListModel.searchProject(e.target.value);
  };

  useEffect(() => {
    setSearchInput('');
  }, [
    projectListModel.radioFilterState,
    projectListModel.computeMode,
    projectListModel.selectState,
  ]);

  return (
    <div
      className={classNames(styles.projectList, {
        [styles.p2pProjectList]: isP2PWorkbench(pathname),
      })}
    >
      <EdgeRouteWrapper>
        <div className={styles.projectListHeader}>
          {isP2PWorkbench(pathname) ? (
            <div className={styles.headerTitle}>我的项目</div>
          ) : (
            <Space size="middle" wrap>
              <Input
                placeholder="搜索项目"
                onChange={(e) => searchProject(e)}
                style={{ width: 200 }}
                value={searchInput}
                suffix={
                  <SearchOutlined
                    style={{
                      color: '#aaa',
                    }}
                  />
                }
              />
              <RadioGroup
                value={projectListModel.radioFilterState}
                onChange={projectListModel.changefilterState}
              />
              <ProjectComputeModeSelect
                onChange={projectListModel.onSelectProject}
                value={projectListModel.computeMode}
              />
              <ProjectStateSelect
                onChange={projectListModel.changeProjectState}
                value={projectListModel.selectState}
              />
            </Space>
          )}
          <Button type="primary" onClick={handleCreateProject}>
            新建项目
          </Button>
          <P2PCreateProjectModal
            visible={projectListModel.showCreateProjectModel}
            close={() => {
              projectListModel.showCreateProjectModel = false;
            }}
            onOk={() => p2pProjectService.getListProject()}
          />
        </div>
      </EdgeRouteWrapper>
      <Spin
        spinning={projectListModel.projectListService.projectListLoading}
        className={styles.spin}
      >
        <div></div>
      </Spin>
      {projectList.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div
          className={classNames(styles.content, {
            [styles.p2pContent]: isP2PWorkbench(pathname),
          })}
        >
          {(isP2PWorkbench(pathname) ? projectList.slice(0, 6) : projectList).map(
            (item, index) => {
              return (
                <div
                  className={styles.projectBox}
                  key={item.projectId}
                  onMouseEnter={() => {
                    setHoverCurrent(index);
                  }}
                  onMouseLeave={() => {
                    setHoverCurrent(-1);
                  }}
                >
                  <div>
                    <div className={styles.listBox}>
                      {item.status === ProjectStatus.ARCHIVED && (
                        <div className={styles.archiveTag}>
                          <span>已归档</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip
                          title={
                            item.computeMode === ComputeModeType.TEE
                              ? item.teeNodeId
                              : ''
                          }
                        >
                          <Tag className={styles.computeModeTag}>
                            {computeModeText[
                              item.computeMode as keyof typeof computeModeText
                            ] || computeModeText[ComputeModeType.MPC]}
                          </Tag>
                        </Tooltip>
                        <div style={{ marginRight: 8 }}>
                          <ProjectTypeTag type={item.computeFunc || 'DAG'} />
                        </div>
                        <div className={styles.header} style={{ flex: 1 }}>
                          <Tooltip title={item.projectName}>
                            <Title
                              className={styles.ellipsisName}
                              level={5}
                              ellipsis={true}
                            >
                              {item.projectName}
                            </Title>
                          </Tooltip>
                          {/* 只有项目发起方才可编辑，并且项目不是已归档项目 */}
                          {item.status !== ProjectStatus.ARCHIVED &&
                            item.initiator === nodeId && (
                              <EditOutlined
                                className={styles.editButton}
                                onClick={() => {
                                  setIsModalOpen(true);
                                  setEditProjectData(item);
                                }}
                              />
                            )}
                        </div>
                      </div>
                      <Paragraph ellipsis={{ rows: 1 }} className={styles.ellipsisDesc}>
                        {item.description || '暂无描述'}
                      </Paragraph>
                      {/* 有受邀方没有通过 */}
                      {!checkAllApproved(item) && (
                        <div className={styles.authProjectTagContent}>
                          <AuthProjectTag
                            currentNode={{ id: nodeId as string }}
                            simple={hoverCurrent !== index}
                            project={item}
                          />
                        </div>
                      )}
                      {/* 所有的受邀方都通过展示 */}
                      {checkAllApproved(item) && (
                        <div className={styles.projects}>
                          <div className={styles.task}>
                            <div className={styles.titleName}>参与节点</div>

                            <div className={styles.count}>
                              <ProjectNodePopover
                                project={{
                                  nodes: [
                                    {
                                      nodeId: item.initiator,
                                      nodeName: item.initiatorName,
                                    },
                                    ...(item.partyVoteInfos || []),
                                  ],
                                }}
                                isP2P
                                currentId={nodeId as string}
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              flex: 1,
                            }}
                          >
                            <div className={styles.titleName}>训练流</div>
                            <span className={styles.count}>
                              <ProjectPipeLinePopover project={item} />
                            </span>
                          </div>
                          <div className={styles.task}>
                            <div className={styles.titleName}>任务数</div>
                            <div className={styles.count}>
                              <ProjectTaskPopover project={item} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className={styles.time}>
                        创建于{formatTimestamp(item.gmtCreate as string)}
                      </div>
                    </div>
                    <div className={styles.bootom}>
                      <P2pProjectButtons project={item} />
                    </div>
                  </div>
                </div>
              );
            },
          )}
          {!isP2PWorkbench(pathname) && (
            <>
              <i></i>
              <i></i>
              <i></i>
            </>
          )}
        </div>
      )}
      {loadMore}
      <EditProjectModal
        isModalOpen={isModalOpen}
        handleCancel={() => setIsModalOpen(false)}
        data={editProjectData}
        onEdit={p2pProjectService.projectEdit}
      />
    </div>
  );
};

export class ProjectListModel extends Model {
  readonly projectListService;

  constructor() {
    super();
    this.projectListService = getModel(P2pProjectListService);
  }

  nodeId: string | undefined = undefined;

  onViewMount() {
    const { nodeId } = parse(window.location.search);
    if (nodeId) {
      this.nodeId = nodeId as string;
    }
    this.resetFilters();
  }

  pipelines: API.GraphMetaVO[] = [];

  showCreateProjectModel = false;

  radioFilterState = RadioGroupState.ALL;
  selectState = SelectProjectState.ALL;
  computeMode = ComputeModeType.ALL;

  changefilterState = (value: RadioGroupState) => {
    this.resetFilters();
    this.radioFilterState = value;
    this.projectListService.displayProjectList =
      this.projectListService.projectList.filter((i) => {
        if (value === RadioGroupState.ALL) {
          return i;
        } else if (value === RadioGroupState.APPLY) {
          return i.initiator && i.initiator === this.nodeId;
        } else if (value === RadioGroupState.PROCESS) {
          return (
            i.partyVoteInfos &&
            (i.partyVoteInfos || []).some((item) => item.nodeId === this.nodeId)
          );
        }
      });
  };

  changeProjectState = (value: SelectProjectState) => {
    this.resetFilters();
    this.selectState = value;
    this.projectListService.displayProjectList =
      this.projectListService.projectList.filter((i) => {
        if (!i.status) return;
        if (value === SelectProjectState.ALL) {
          return i;
        } else if (value === SelectProjectState.ARCHIVED) {
          return i.status && i.status === SelectProjectState.ARCHIVED;
        } else if (value === SelectProjectState.REVIEWING) {
          return i.status && i.status === SelectProjectState.REVIEWING;
        }
      });
  };

  searchProject = (value: string) => {
    this.projectListService.displayProjectList =
      this.projectListService.projectList.filter((i) => {
        if (!i.projectName) return;
        return i.projectName?.indexOf(value) >= 0;
      });
  };

  onSelectProject = (e: string) => {
    this.resetFilters();
    this.computeMode = e as ComputeModeType;
    this.projectListService.displayProjectList =
      this.projectListService.projectList.filter((i) => {
        if (e === ComputeModeType.ALL) {
          return i;
        } else if (e === ComputeModeType.TEE) {
          return i.computeMode && i.computeMode.indexOf(ComputeModeType.TEE) >= 0;
        } else if (e === ComputeModeType.MPC) {
          // 兼容除tee外的
          return i.computeMode && !(i.computeMode.indexOf(ComputeModeType.TEE) >= 0);
        }
      });
  };

  resetFilters = () => {
    this.computeMode = ComputeModeType.ALL;
    this.radioFilterState = RadioGroupState.ALL;
    this.selectState = SelectProjectState.ALL;
  };

  handleCreateProject = () => {
    this.showCreateProjectModel = true;
  };
}
