import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Divider,
  message,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
  Tag,
  Alert,
} from 'antd';
import React, { useEffect } from 'react';

import { PadMode, Platform, hasAccess } from '@/components/platform-wrapper';
import { formatTimestamp } from '@/modules/dag-result/utils';
import { NodeService } from '@/modules/node';
import {
  ComputeModeType,
  computeModeText,
} from '@/modules/p2p-project-list/components/common';
import { P2pProjectListService } from '@/modules/p2p-project-list/p2p-project-list.service';
import { ProjectListService } from '@/modules/project-list/project-list.service';
import { getDatatable } from '@/services/secretpad/DatatableController';
import {
  addProjectDatatable,
  deleteProjectDatatable,
} from '@/services/secretpad/ProjectController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DatatableInfoService } from './data-table-auth.service';
import styles from './index.less';

const { Text } = Typography;

export enum DataInfoArea {
  Auth = 'Auth',
}

interface IProps {
  tableInfo: API.DatatableVO;
  size: 'small' | 'large' | 'middle' | undefined;
}
export const DataTableAuthComponent: React.FC<IProps> = (props: IProps) => {
  const viewInstance = useModel(DataTableAuth);
  const { tableInfo, size } = props;

  useEffect(() => {
    viewInstance.setAuthList([...(tableInfo.authProjects || [])].reverse() || []);
    viewInstance.getProjectList();
    viewInstance.getTableInfo(tableInfo);
  }, [tableInfo, tableInfo.authProjects, viewInstance]);

  useEffect(() => {
    viewInstance.newAuthList = [];
  }, []);

  return (
    <div
      style={{ fontSize: '12px' }}
      className={`${styles.auth} ${size === 'middle' ? styles.authLarge : ''}`}
    >
      <Descriptions
        column={5}
        style={{
          background: '#fafafa',
          fontWeight: 600,
          height: size === 'middle' ? 45 : 36,
        }}
      >
        <Descriptions.Item style={{ width: 150 }}>已授权项目</Descriptions.Item>
        <Descriptions.Item style={{ width: 120 }}>
          <Divider type="vertical" />
          关联键
        </Descriptions.Item>
        <Descriptions.Item className={styles.labelKey} style={{ width: 120 }}>
          <Divider type="vertical" />
          标签列
          <Tooltip title="要预测的字段，如线性回归中的Y变量">
            <QuestionCircleOutlined style={{ marginLeft: '6px', cursor: 'pointer' }} />
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item>
          <Divider type="vertical" />
          授权时间
        </Descriptions.Item>
        <Descriptions.Item style={{ width: 120 }}>
          <Divider type="vertical" />
          操作
        </Descriptions.Item>
      </Descriptions>
      <div
        style={{
          padding: '8px 0',
          background: 'rgba(0,0,0,.02)',
          borderTop: '1px solid rgba(0,0,0,.03)',
        }}
      >
        <Button
          type="dashed"
          block
          onClick={() => viewInstance.addNewAuth()}
          style={{
            fontSize: 12,
            height: 28,
            lineHeight: '18px',
          }}
        >
          <PlusOutlined />
          添加授权
        </Button>
      </div>
      <div className={styles.authList}>
        {viewInstance.newAuthList.map((item, index) => {
          return (
            <div
              key={item.project + '-' + index}
              style={{ display: 'flex' }}
              className={styles.authListItem}
            >
              <div
                className={styles.authItem}
                style={{
                  width: 170,
                }}
              >
                <Select
                  placeholder="授权项目"
                  style={{ width: '100%' }}
                  value={item.project}
                  onChange={(e) => (item.project = e)}
                  size={size}
                  popupClassName={styles.popup}
                  optionFilterProp="children"
                >
                  {hasAccess({
                    mode: [PadMode.TEE, PadMode['ALL-IN-ONE']],
                  }) && (
                    <Select.Option disabled className={styles.padModeWrapper}>
                      <Alert
                        message="授权到枢纽类型项目，数据表会自动加密上传到TEE存储中"
                        type="warning"
                        showIcon
                      />
                    </Select.Option>
                  )}
                  {viewInstance.projectList?.map((i) => {
                    return (
                      <Select.Option key={i.projectId} value={i.projectId}>
                        <Tag>
                          {computeModeText[
                            i.computeMode as keyof typeof computeModeText
                          ] || computeModeText[ComputeModeType.MPC]}
                        </Tag>
                        {i.projectName}
                      </Select.Option>
                    );
                  })}
                </Select>
              </div>
              <div style={{ width: 120 }} className={styles.authItem}>
                <Select
                  style={{ width: 94 }}
                  placeholder="关联键"
                  value={item.key}
                  popupClassName={styles.popup}
                  onChange={(e) => (item.key = e)}
                  size={size}
                >
                  {tableInfo.schema?.map((i) => {
                    return (
                      <Select.Option key={i.colName} value={i.colName}>
                        {i.colName}
                      </Select.Option>
                    );
                  })}
                </Select>
              </div>
              <div style={{ width: 120 }} className={styles.authItem}>
                <Select
                  style={{ width: 94 }}
                  placeholder="标签列"
                  value={item.label}
                  popupClassName={styles.popup}
                  onChange={(e) => (item.label = e)}
                  size={size}
                >
                  {[
                    <Select.Option key="sf_label_default_none_key" value="">
                      无
                    </Select.Option>,
                  ].concat(
                    tableInfo.schema?.map((i) => {
                      return (
                        <Select.Option key={i.colName} value={i.colName}>
                          {i.colName}
                        </Select.Option>
                      );
                    }) || [],
                  )}
                </Select>
              </div>
              <div className={styles.authItem} style={{ flex: 1 }}>
                -
              </div>
              <div className={styles.authItem} style={{ width: 120 }}>
                <Space>
                  <Typography.Link
                    disabled={!item.project || !item.key}
                    onClick={() => viewInstance.saveAuth(item, tableInfo)}
                  >
                    保存
                  </Typography.Link>
                  <Typography.Link onClick={() => viewInstance.deleteAuth(item)}>
                    取消
                  </Typography.Link>
                </Space>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.authList}>
        {viewInstance.authList.map((item, index) => {
          return (
            <div
              key={item.projectId + '-' + index}
              style={{ display: 'flex' }}
              className={styles.authListItem}
            >
              <div
                className={styles.authItem}
                style={{
                  width: 170,
                }}
              >
                <Tag>
                  {computeModeText[item?.computeMode as keyof typeof computeModeText] ||
                    computeModeText[ComputeModeType.MPC]}
                </Tag>
                <span className={styles.authItemText}>{item.name}</span>
              </div>
              <div style={{ width: 120 }} className={styles.authItem}>
                <Text
                  style={{ width: 100 }}
                  ellipsis={{ tooltip: item.associateKeys?.join(',') }}
                >
                  {item.associateKeys?.join(',')}
                </Text>
              </div>
              <div style={{ width: 120 }} className={styles.authItem}>
                <Text
                  style={{ width: 100 }}
                  ellipsis={{ tooltip: item.labelKeys?.join(',') }}
                >
                  {item.labelKeys?.join(',')}
                </Text>
              </div>
              <div className={styles.authItem} style={{ flex: 1 }}>
                <Tooltip title={formatTimestamp(item.gmtCreate as string)}>
                  {formatTimestamp(item.gmtCreate as string).split(' ')[0]}
                </Tooltip>
              </div>
              <div className={styles.authItem} style={{ width: 120 }}>
                <Space>
                  <Popconfirm
                    placement="topLeft"
                    title={`确定要取消对「${item.name}」的授权吗`}
                    onConfirm={() => viewInstance.cancelAuth(item, tableInfo)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a>取消授权</a>
                  </Popconfirm>
                </Space>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DataTableAuthId = 'DataTableAuthId';

type Datatable = API.DatatableVO;

interface AuthInfo {
  project?: string;
  key?: string;
  label?: string;
  computeMode?: string;
}

export class DataTableAuth extends Model {
  projectListService = getModel(ProjectListService);
  nodeService = getModel(NodeService);
  datatableInfoService = getModel(DatatableInfoService);
  p2pProjectListService = getModel(P2pProjectListService);

  newAuthList: AuthInfo[] = [];

  authList: API.AuthProjectVO[] = [];

  projectList: API.ProjectVO[] = [];

  tableInfo: Datatable = {};

  async getProjectList() {
    if (hasAccess({ type: [Platform.AUTONOMY] })) {
      this.projectList = (await this.p2pProjectListService.getListProject()).filter(
        (item) => item.status === 'APPROVED',
      );
    } else {
      this.projectList = await this.projectListService.getListProject();
    }
  }

  addNewAuth() {
    this.newAuthList.push({
      project: undefined,
      key: undefined,
      label: undefined,
    });
  }

  setAuthList(authList: API.AuthProjectVO[]) {
    this.authList = authList;
  }

  setAuthInfo(item: AuthInfo, newItem: AuthInfo) {
    const index = this.newAuthList.indexOf(item);
    this.newAuthList.splice(index, 1, newItem);
  }

  async getTableInfo(tableInfo: API.DatatableVO) {
    const response = await getDatatable({
      datatableId: tableInfo.datatableId,
      nodeId: this.nodeService.currentNode?.nodeId,
    });
    this.tableInfo = response.data || {};
    this.authList = [...(this.tableInfo.authProjects || [])].reverse() || [];
  }

  async saveAuth(item: AuthInfo, tableInfo: API.DatatableVO) {
    if (!item.key || !item.project) return;

    if (item.key === item.label) {
      message.error('关联键和标签列不能一样');
      return;
    }

    const configs: any = [
      {
        colName: item.key,
        isAssociateKey: true,
        isProtection: true,
      },
    ];

    if (item.label) {
      configs.push({
        colName: item.label,
        isLabelKey: true,
      });
    }

    const res = await addProjectDatatable({
      projectId: item.project,
      nodeId: this.nodeService.currentNode?.nodeId,
      datatableId: tableInfo.datatableId,
      configs,
    });
    if (res.status?.code == 0) {
      message.success('授权成功');
      this.deleteAuth(item);
      await this.getTableInfo(tableInfo);
      this.datatableInfoService.eventEmitter.fire(null);
    } else {
      message.error(res.status?.msg);
    }
  }

  deleteAuth(item: AuthInfo) {
    const index = this.newAuthList.indexOf(item);
    this.newAuthList.splice(index, 1);
  }

  async cancelAuth(item: API.AuthProjectVO, tableInfo: API.DatatableVO) {
    const res = await deleteProjectDatatable({
      projectId: item.projectId,
      nodeId: this.nodeService.currentNode?.nodeId,
      datatableId: tableInfo.datatableId,
    });

    if (res.status?.code == 0) {
      message.success('取消成功');
    } else {
      message.error('操作失败');
    }
    await this.getTableInfo(tableInfo);
    this.datatableInfoService.eventEmitter.fire(null);
  }
}
