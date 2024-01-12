import {
  EditOutlined,
  ExclamationCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import type { TourProps } from 'antd';
import { Select } from 'antd';
import {
  Button,
  Tag,
  Typography,
  Tooltip,
  Modal,
  Input,
  Space,
  message,
  Tour,
} from 'antd';
import { Spin } from 'antd';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import React, { useRef } from 'react';
import { history } from 'umi';

import { EdgeAuthWrapper } from '@/components/edge-wrapper-auth';
import { getPadMode } from '@/components/platform-wrapper';
import { CreateProjectModal } from '@/modules/create-project/create-project.view';
import { formatTimestamp } from '@/modules/dag-result/utils';
import {
  GuideTourKeys,
  GuideTourService,
} from '@/modules/guide-tour/guide-tour-service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { EditProjectModal } from './components/edit-project';
import {
  ProjectNodePopover,
  ProjectPipeLinePopover,
  ProjectTaskPopover,
} from './components/popover';
import styles from './index.less';
import type { ProjectVO } from './project-list.service';
import { ProjectListService } from './project-list.service';

export enum ComputeModeType {
  'ALL' = 'all',
  'MPC' = 'MPC',
  'TEE' = 'TEE',
}
export const computeModeText = {
  [ComputeModeType.MPC]: '管道',
  [ComputeModeType.TEE]: '枢纽',
};

export const ProjectListComponent: React.FC = () => {
  const projectListModel = useModel(ProjectListModel);
  const projectListService = useModel(ProjectListService);

  const { handleCreateProject } = projectListModel;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { displayProjectList: projectList } = projectListModel;

  const { Title, Paragraph } = Typography;

  const [editProjectData, setEditProjectData] = useState({});

  useEffect(() => {
    projectListModel.getProjectList();
  }, []);

  // 新手引导
  const ref1 = useRef(null);
  const steps: TourProps['steps'] = [
    {
      title: '恭喜你完成体验🎉',
      description: '这是你创建的项目，以后都可以在这里查看',
      nextButtonProps: {
        children: <div>知道了</div>,
      },
      target: () => ref1.current,
    },
  ];

  // 删除项目
  const deleteProjectItem = (val: ProjectVO) => {
    let inputModalValue = '';
    const modal = Modal.confirm({
      title: `确认要删除「${val.projectName}」吗？`,
      icon: <ExclamationCircleFilled />,
      centered: true,
      content: (
        <>
          <div>即将删除项目及项目内的所有产出，请手动输入项目名称确认删除</div>
          <p>请输入 {val.projectName} 确认操作</p>
          <Input
            onChange={(e) => {
              inputModalValue = e.target.value;
              modal.update({
                okButtonProps: {
                  disabled: e.target.value !== val.projectName,
                  danger: true,
                },
              });
            }}
            placeholder="请输入"
          />
        </>
      ),
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      okButtonProps: {
        disabled: true,
      },
      async onOk(close) {
        if (inputModalValue === val.projectName) {
          const res = await projectListService.deleteProject(val.projectId as string);
          if (res.code === 0) {
            message.success('删除项目成功');
            projectListModel.getProjectList();
          } else {
            message.error(res.msg);
          }
          return close(Promise.resolve);
        }
      },
    });
  };

  const selectOptions = [
    { value: ComputeModeType.ALL, label: '全部计算模式' },
    { value: ComputeModeType.MPC, label: '管道模式' },
    { value: ComputeModeType.TEE, label: '枢纽模式' },
  ];
  const ModeSelect = {
    TEE: selectOptions.filter((item) => item.value !== ComputeModeType.MPC),
    MPC: selectOptions.filter((item) => item.value !== ComputeModeType.TEE),
    'ALL-IN-ONE': selectOptions,
  };

  return (
    <div className={styles.projectList}>
      <div className={styles.projectListHeader}>
        {/* <span className={styles.headerText}>我创建的项目</span> */}
        <Space size="middle">
          <Input
            placeholder="搜索项目"
            onChange={(e) => projectListModel.searchProject(e)}
            style={{ width: 200 }}
            suffix={
              <SearchOutlined
                style={{
                  color: '#aaa',
                }}
              />
            }
          />
          <Select
            style={{ width: 180 }}
            defaultValue="all"
            onChange={(e) => projectListModel.onSelectProject(e)}
            options={ModeSelect[getPadMode() as keyof typeof ModeSelect]}
          />

          <CreateProjectModal
            visible={projectListModel.showCreateProjectModel}
            data={{ showBlank: true }}
            close={() => {
              projectListModel.showCreateProjectModel = false;
            }}
          />
        </Space>

        <Button type="primary" onClick={handleCreateProject}>
          新建项目
        </Button>
      </div>
      <Spin
        spinning={projectListModel.projectListService.projectListLoading}
        className={styles.spin}
      >
        <div></div>
      </Spin>
      <div className={styles.content}>
        {projectList.map((item, index) => {
          // 新手引导ref
          const extendProps: Record<string, React.MutableRefObject<null>> = {};
          if (index === 0) {
            extendProps['ref'] = ref1;
          }
          return (
            <div className={styles.projectBox} key={item.projectId}>
              <div {...extendProps} className={styles.listBox}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip
                    title={
                      item.computeMode === ComputeModeType.TEE ? item.teeNodeId : ''
                    }
                  >
                    <Tag
                      style={{
                        fontSize: 10,
                        height: 20,
                        lineHeight: '18px',
                        background: 'white',
                      }}
                    >
                      {computeModeText[
                        item.computeMode as keyof typeof computeModeText
                      ] || computeModeText[ComputeModeType.MPC]}
                    </Tag>
                  </Tooltip>
                  <div className={styles.header} style={{ flex: 1 }}>
                    <Tooltip title={item.projectName}>
                      <Title className={styles.ellipsisName} level={5} ellipsis={true}>
                        {item.projectName}
                      </Title>
                    </Tooltip>
                    <EditOutlined
                      className={styles.editButton}
                      onClick={() => {
                        setIsModalOpen(true);
                        setEditProjectData(item);
                      }}
                    />
                  </div>
                </div>
                <Paragraph ellipsis={{ rows: 1 }} className={styles.ellipsisDesc}>
                  {item.description || '暂无描述'}
                </Paragraph>
                <div className={styles.projects}>
                  <div className={styles.task}>
                    <div className={styles.titleName}>参与节点</div>
                    <div className={styles.count}>
                      <ProjectNodePopover project={item} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                <div className={styles.time}>
                  创建于{formatTimestamp(item.gmtCreate as string)}
                </div>
              </div>
              <div className={styles.bootom}>
                <Button
                  type="primary"
                  size="small"
                  style={{ flex: 1 }}
                  onClick={() => {
                    history.push(
                      {
                        pathname: '/dag',
                        search: `projectId=${item.projectId}&mode=${
                          item.computeMode || 'MPC'
                        }`,
                      },
                      {
                        origin: 'project-management',
                      },
                    );
                  }}
                >
                  进入项目
                </Button>
                <Button
                  size="small"
                  onClick={() => deleteProjectItem(item)}
                  style={{ flex: 1 }}
                >
                  删除
                </Button>
              </div>
            </div>
          );
        })}
        <i></i>
        <i></i>
        <i></i>
      </div>
      <EditProjectModal
        isModalOpen={isModalOpen}
        handleCancel={() => setIsModalOpen(false)}
        data={editProjectData}
        onEdit={projectListModel.endEdit}
      />
      <EdgeAuthWrapper>
        <Tour
          open={
            !projectListModel.guideTourService.ProjectListTour &&
            projectList.length === 1
          }
          onClose={() => projectListModel.closeGuideTour()}
          mask={false}
          type="primary"
          steps={steps}
          placement="right"
          prefixCls="project-list-tour"
        />
      </EdgeAuthWrapper>
    </div>
  );
};

export class ProjectListModel extends Model {
  pipelines: API.GraphMetaVO[] = [];

  fetchingPipelineList = false;

  fetchingTaskList = false;

  jobs: API.ProjectJobSummaryVO[] = [];

  displayProjectList: API.ProjectVO[] = [];

  projectEditStatusMap: { [key: string]: boolean } = {};

  projectEditTargetMap: { [key: string]: string } = {};

  showCreateProjectModel = false;

  readonly projectListService;
  readonly guideTourService;

  constructor() {
    super();
    this.projectListService = getModel(ProjectListService);
    this.guideTourService = getModel(GuideTourService);
  }

  closeGuideTour() {
    this.guideTourService.finishTour(GuideTourKeys.ProjectListTour);
  }

  endEdit = async (item: API.ProjectVO, projectId: string) => {
    const params = {
      projectId,
      name: item.projectName as string,
      description: item.description as string,
    };
    message.loading({ content: '更新中', key: projectId });
    await this.projectListService.updateProject(params);
    message.destroy(item.projectId);
    await this.getProjectList();
    this.projectEditStatusMap[projectId as string] = false;
  };

  async getProjectList() {
    this.displayProjectList = await this.projectListService.getListProject();
  }

  async getPipelines(projectInfo: API.ProjectVO) {
    this.fetchingPipelineList = true;
    const pipelines = await this.projectListService.getPipelines(
      projectInfo.projectId || '',
    );
    this.pipelines = pipelines;
    this.fetchingPipelineList = false;
  }

  async getJobs(projectInfo: API.ProjectVO) {
    this.fetchingTaskList = true;
    const jobs = await this.projectListService.getJobs(projectInfo.projectId || '');
    this.jobs = (jobs as API.PageResponse_ProjectJobSummaryVO_).data || [];
    this.fetchingTaskList = false;
  }

  searchProject(e: ChangeEvent<HTMLInputElement>) {
    this.displayProjectList = this.projectListService.projectList.filter((i) => {
      if (!i.projectName) return;
      return i.projectName?.indexOf(e.target.value) >= 0;
    });
  }

  onSelectProject(e: string) {
    this.displayProjectList = this.projectListService.projectList.filter((i) => {
      if (e === ComputeModeType.ALL) {
        return i;
      } else if (e === ComputeModeType.TEE) {
        return i.computeMode && i.computeMode.indexOf(ComputeModeType.TEE) >= 0;
      } else if (e === ComputeModeType.MPC) {
        // 兼容除tee外的
        return i.computeMode && !(i.computeMode.indexOf(ComputeModeType.TEE) >= 0);
      }
    });
  }

  listProjectByMode(mode: 'all' | 'pipeline') {
    switch (mode) {
      case 'pipeline':
        this.displayProjectList = this.projectListService.projectList.filter((i) => {
          // TODO: api pending
          return !i.computeMode || i.computeMode === 'pipeline';
        });
        return;
      default:
        this.displayProjectList = this.projectListService.projectList;
    }
  }

  handleCreateProject = () => {
    this.showCreateProjectModel = true;
  };
}
