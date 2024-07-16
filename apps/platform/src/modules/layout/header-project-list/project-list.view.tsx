import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Select, Tag } from 'antd';
import React from 'react';
import { history, useLocation, useSearchParams } from 'umi';

import { DagLayoutView } from '@/modules/layout/dag-layout';
import { StatusEnum } from '@/modules/p2p-project-list/components/auth-project-tag';
import {
  ComputeModeType,
  computeModeText,
} from '@/modules/p2p-project-list/components/common';
import { listP2PProject } from '@/services/secretpad/P2PProjectController';
import { listProject } from '@/services/secretpad/ProjectController';
import { Model, getModel, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { ProjectEditService } from './project-edit.service';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { AdvancedConfigDrawer } from '@/modules/advanced-config/advanced-config-drawer/advanced-config-view';

export type ProjectVO = API.ProjectVO;

export const ProjectListComponent: React.FC = () => {
  const viewInstance = useModel(HeaderProjectListView);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  React.useEffect(() => {
    viewInstance.selectValue = searchParams.get('projectId') || '';
  }, [searchParams, viewInstance.projectList]);

  return (
    <div className={styles.projectWrapper}>
      <Select
        disabled={viewInstance.projectList.length === 0}
        onChange={(value: string) => viewInstance.changeProjectList(value, pathname)}
        value={viewInstance.loading ? '加载中...' : viewInstance.selectValue}
        suffixIcon={viewInstance.loading ? <LoadingOutlined /> : <DownOutlined />}
        popupClassName={styles.projectDropdown}
        placeholder="请选择"
        showSearch
        optionFilterProp="label"
      >
        {viewInstance.projectList?.map((item) => (
          <Select.Option
            key={item.projectId}
            value={item.projectId}
            label={item.projectName}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag style={{ background: '#fff', height: 22 }}>
                {computeModeText[item.computeMode as keyof typeof computeModeText] ||
                  computeModeText[ComputeModeType.MPC]}
              </Tag>
              <div className={styles.fontBold}>{item.projectName}</div>
              {/* <div className={styles.rows}>
                {item.nodes?.map((node, index) => {
                  return (
                    <>
                      <div className={styles.nodeName}>
                        <Space>
                          <HddOutlined />
                          <span>{node.nodeName}服务节点</span>
                        </Space>
                      </div>
                      {index !== (item.nodes || []).length - 1 ? (
                        <span className={styles.line} />
                      ) : (
                        ''
                      )}
                    </>
                  );
                })}
              </div> */}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export class HeaderProjectListView extends Model {
  projectEditService = getModel(ProjectEditService);
  dagLayoutView = getModel(DagLayoutView);
  modalManager = getModel(DefaultModalManager);

  projectList: ProjectVO[] = [];

  selectValue = '';

  loading = false;

  getListProject = async () => {
    const isP2pMode = await this.projectEditService.isP2pMode();
    const { data } = await (isP2pMode ? listP2PProject() : listProject());
    if (data) {
      this.projectList = isP2pMode
        ? (data || []).filter((item) => this.checkProjectIsApproved(item))
        : (data as ProjectVO[]) || [];
    }
    return this.projectList.reverse();
  };

  checkProjectIsApproved = (project: API.ProjectVO) => {
    // 所有受邀方通过才可以进入项目
    const { partyVoteInfos = [] } = project;
    return (partyVoteInfos || []).every((node) => node.action === StatusEnum.AGREE);
  };

  onViewMount = async () => {
    this.loading = true;
    await this.getListProject();
    this.loading = false;
  };

  changeProjectList = async (value: string, pathname: string) => {
    this.selectValue = value;
    const project = this.projectList?.find((item) => item.projectId === value);

    if (!project) {
      history.push('/');
      return;
    }
    const { origin } = (history.location.state as { origin: string }) || {};
    history.push(
      {
        pathname,
        search: (await this.projectEditService.isP2pMode())
          ? `projectId=${value}&mode=${project.computeMode || 'MPC'}&type=${
              project.computeFunc || 'DAG'
            }`
          : `projectId=${value}&mode=${project.computeMode || 'MPC'}`,
      },
      { origin },
    );
    this.modalManager.closeModal(AdvancedConfigDrawer.id);
    this.dagLayoutView.setActiveKey('pipeline');
  };
}
