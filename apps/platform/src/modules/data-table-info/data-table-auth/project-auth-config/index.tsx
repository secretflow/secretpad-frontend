import { CloseOutlined, LeftOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Typography,
  Select,
  Space,
  message,
  Empty,
  Tag,
} from 'antd';
import { parse } from 'query-string';
import React, { useEffect, useState } from 'react';

import { hasAccess, Platform } from '@/components/platform-wrapper';
import { DataManagerView } from '@/modules/data-manager/data-manager.view';
import { ComputeModeType, computeModeText } from '@/modules/project-list';
import { listP2PProject } from '@/services/secretpad/P2PProjectController';
import {
  listProject,
  getProjectDatatable,
  addProjectDatatable,
  updateProjectTableConfig,
} from '@/services/secretpad/ProjectController';
import { Model, useModel } from '@/util/valtio-helper';

import { SafeSettingModal } from '../safe-setting-modal.tsx';

import styles from './index.less';
import { ProjectTableField } from './project-table-field';

export type ProjectAuthConfigType = 'ADD' | 'EDIT';

const { Link } = Typography;

export const ProjectAuthConfigDrawer = ({
  open,
  onClose,
  type,
  tableInfo,
  data,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  type: ProjectAuthConfigType;
  tableInfo: API.DatatableVO; // 原始schema, 只有添加授权的时候才会用到
  data?: API.AuthProjectVO; // 编辑授权的时候使用的关于项目的信息
  onOk?: () => void;
}) => {
  const [form] = Form.useForm();
  const { nodeId } = parse(window.location.search);

  const viewInstance = useModel(ProjectAuthConfigModel);
  const dataManagerViewService = useModel(DataManagerView);

  const selectedProject = Form.useWatch('project', form);

  const [projectOptions, setProjectOptions] = useState<
    { label: JSX.Element | string; value: string }[]
  >([]);

  const onDrawerClose = () => {
    onClose();
    form.resetFields();
  };

  useEffect(() => {
    const getProjectList = async () => {
      const isP2p = hasAccess({ type: [Platform.AUTONOMY] });

      const { data, status } = isP2p ? await listP2PProject() : await listProject();
      if (status?.code !== 0) {
        setProjectOptions([]);
        return;
      } else {
        const projectData = isP2p
          ? (data || []).filter((item) => item.status === 'APPROVED')
          : data || [];
        setProjectOptions(
          projectData.map((item) => ({
            value: item.projectId!,
            label: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Tag style={{ background: '#fff', height: 22 }}>
                  {computeModeText[item.computeMode as keyof typeof computeModeText] ||
                    computeModeText[ComputeModeType.MPC]}
                </Tag>
                <div>{item.projectName}</div>
              </div>
            ),
          })),
        );
      }
    };
    if (type === 'ADD' && open) {
      getProjectList();
    }
  }, [type, open]);

  useEffect(() => {
    // 选择项目后，设置schema原始表信息 tableInfo
    if (selectedProject) {
      form.setFieldsValue({
        fields: tableInfo.schema,
      });
    }
  }, [selectedProject]);

  React.useEffect(() => {
    const getProjectDatatableRequest = async () => {
      const res = await getProjectDatatable({
        projectId: data?.projectId,
        nodeId: nodeId as string,
        datatableId: tableInfo.datatableId,
        type: tableInfo.type,
      });
      if (res?.status?.code === 0) {
        form.setFieldsValue({
          fields: res?.data?.configs || [],
        });
      }
    };
    // 获取编辑数据
    if (type === 'EDIT' && data && open) {
      getProjectDatatableRequest();
    }
  }, [data, type, open]);

  const onSave = async () => {
    const value = await form.validateFields();
    if (type === 'ADD') {
      const res = await addProjectDatatable({
        projectId: value.project,
        nodeId: nodeId as string,
        datatableId: tableInfo.datatableId,
        configs: value.fields,
        type: tableInfo.type,
      });
      if (res.status?.code == 0) {
        message.success('授权成功');
        dataManagerViewService.getTableList();
        onDrawerClose();
        onOk && onOk();
      } else {
        message.error(res.status?.msg);
      }
    } else if (type === 'EDIT') {
      if (!value.fields) return;
      const res = await updateProjectTableConfig({
        projectId: data?.projectId,
        nodeId: nodeId as string,
        datatableId: tableInfo.datatableId,
        configs: value.fields,
        type: tableInfo.type,
      });
      if (res.status?.code == 0) {
        message.success('授权修改成功');
        onDrawerClose();
      } else {
        message.error(res.status?.msg);
      }
    }
  };

  return (
    <Drawer
      width={680}
      title={
        <div>
          {type === 'ADD' && (
            <Space>
              <LeftOutlined onClick={onDrawerClose} /> 添加授权项目
            </Space>
          )}
          {type === 'EDIT' && (
            <Space>
              <LeftOutlined onClick={onDrawerClose} />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                「
                <Tag style={{ background: '#fff', height: 22, marginLeft: 4 }}>
                  {computeModeText[data?.computeMode as keyof typeof computeModeText] ||
                    computeModeText[ComputeModeType.MPC]}
                </Tag>
                <div className={styles.drawerTitleText}>{data?.name}</div>」 配置授权
              </div>
            </Space>
          )}
        </div>
      }
      extra={<CloseOutlined style={{ fontSize: 12 }} onClick={onDrawerClose} />}
      open={open}
      placement="right"
      closable={false}
      onClose={onDrawerClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onDrawerClose}>取消</Button>
          <Button
            type="primary"
            onClick={onSave}
            disabled={type === 'ADD' && !selectedProject}
          >
            确认
          </Button>
        </Space>
      }
    >
      <>
        <Form form={form} layout="vertical" autoComplete="off" initialValues={data}>
          {type === 'ADD' && (
            <div className={styles.selectProject}>
              <div>关联项目:</div>
              <Form.Item name="project" colon>
                <Select
                  optionFilterProp="label"
                  style={{ width: 380 }}
                  placeholder="请选择"
                  options={projectOptions}
                />
              </Form.Item>
            </div>
          )}
          <Form.Item
            name="fields"
            className={styles.fields}
            label={
              <div className={styles.fieldsTip}>
                <div className={styles.tips}>数据表安全设置</div>
                <Link
                  className={styles.linkTips}
                  onClick={viewInstance.openSafeSettingDrawer}
                >
                  安全配置说明
                </Link>
              </div>
            }
          >
            {(type === 'EDIT' || (selectedProject && type === 'ADD')) && (
              <ProjectTableField />
            )}
            {!selectedProject && type === 'ADD' && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="请先选择关联项目"
                className={styles.emptyProject}
              />
            )}
          </Form.Item>
        </Form>
        <SafeSettingModal
          open={viewInstance.showSafeSettingDrawer}
          onClose={() => (viewInstance.showSafeSettingDrawer = false)}
        />
      </>
    </Drawer>
  );
};

export class ProjectAuthConfigModel extends Model {
  showSafeSettingDrawer = false;

  openSafeSettingDrawer = () => {
    this.showSafeSettingDrawer = true;
  };
}
