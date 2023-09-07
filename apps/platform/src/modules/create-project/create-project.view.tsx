import { QuestionCircleOutlined } from '@ant-design/icons';
import { Input, Form, Drawer, Button, Space, Radio, Tooltip, App } from 'antd';
import type { InputRef } from 'antd';
import classnames from 'classnames';
import React from 'react';

import { Model, getModel, useModel } from '@/util/valtio-helper';

import { GuideTourKeys, GuideTourService } from '../guide-tour/guide-tour-service';
import { QuickConfigEntry } from '../pipeline/pipeline-creation-view';
import { PipelineTemplateType } from '../pipeline/pipeline-protocol';

import { AddNodeTag } from './add-node-tag';
import { CreateProjectService } from './create-project.service';
import { EmbeddedNodePreview } from './embedded-node.view';
import styles from './index.less';
import { TemplateSwitch } from './template-switch';

interface ICreateProjectModal {
  visible: boolean;
  data: any;
  close: () => void;
}

export const CreateProjectModal = ({ visible, data, close }: ICreateProjectModal) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const service = useModel(CreateProjectService);
  const viewInstance = useModel(CreateProjectModalView);

  const inputRef = React.useRef<InputRef>(null);

  const templateId = Form.useWatch('templateId', form);
  const projectName = Form.useWatch('projectName', form);
  const computeMode = Form.useWatch('computeMode', form);
  const nodes = Form.useWatch('nodes', form);

  React.useEffect(() => {
    service.getNodeList();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      viewInstance.createLoading = true;
      await service.createProject(value, data.showBlank);
      data.showBlank &&
        value.templateId !== PipelineTemplateType.BLANK &&
        message.success({
          content: <QuickConfigEntry type={value.templateId} />,
          duration: 15,
          key: 'quick-config',
        });
      viewInstance.createLoading = false;
      close();
    });
  };

  React.useEffect(() => {
    inputRef.current?.focus({
      cursor: 'start',
    });
  }, []);

  return (
    <Drawer
      className={!data.showBlank ? styles.createModal : styles.createModalMax}
      title={'新建项目'}
      destroyOnClose
      open={visible}
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={close}>取消</Button>
          <Button
            type="primary"
            onClick={handleOk}
            className={classnames({
              [styles.buttonDisable]:
                !templateId || !projectName || !computeMode || nodes.length < 2,
            })}
            loading={viewInstance.createLoading}
          >
            创建
          </Button>
        </Space>
      }
      // width={!data.showBlank ? 668 : 1008}
      width={690}
    >
      <Form form={form} preserve={false} layout="vertical" requiredMark="optional">
        <Form.Item
          label="项目名称"
          required
          className={styles.formLabelItem}
          name="projectName"
          rules={[
            { max: 32, message: '长度限制32' },
            {
              pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
              message: '只能包含中文/英文/数字/下划线/中划线',
            },
          ]}
        >
          <Input
            ref={inputRef}
            placeholder="请输入中文、大小写英文、数字、下划线、中划线，32个字符以内"
            allowClear
          />
        </Form.Item>
        <Form.Item
          label="项目描述"
          className={styles.formLabelItem}
          name="description"
          rules={[
            { max: 128, message: '长度限制128' },
            {
              pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
              message: '只能包含中文/英文/数字/下划线/中划线',
            },
          ]}
        >
          <Input.TextArea
            placeholder="请输入128字符以内的介绍"
            allowClear
            autoSize={{
              minRows: 2,
            }}
          />
        </Form.Item>
        <Form.Item
          label="计算模式"
          required
          className={styles.formLabelItem}
          name="computeMode"
          initialValue={'pipeline'}
        >
          <Radio.Group>
            <Radio value={'pipeline'}>
              <Space>
                管道模式
                <Tooltip title="MPC、FL等多方模式">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            </Radio>
            {/* <Radio value={'hub'}>
              <Space>
                枢纽模式
                <Tooltip title="TEE等集中式方案">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            </Radio> */}
          </Radio.Group>
        </Form.Item>
        <Form.Item
          className={styles.formLabelItem}
          label="训练流模板"
          name="templateId"
          required
        >
          <TemplateSwitch
            visible={visible}
            viewInstance={viewInstance}
            templateList={service.pipelineTemplates}
            showBlank={data.showBlank}
          />
        </Form.Item>
        <Form.Item
          className={styles.formLabelItem}
          label="参与节点"
          name="nodes"
          initialValue={data.showBlank ? [] : ['alice', 'bob']}
          required
          tooltip="最多可选十个，至少要两个节点才能创建一个项目"
        >
          {data.showBlank ? (
            <AddNodeTag nodeList={service.nodeList || []} />
          ) : (
            <EmbeddedNodePreview />
          )}
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export class CreateProjectModalView extends Model {
  createLoading = false;

  guideTourService = getModel(GuideTourService);

  createProjectService = getModel(CreateProjectService);

  closeGuideTour() {
    this.guideTourService.finishTour(GuideTourKeys.CreateProjectTour);
  }
}
