import { PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Popover, Typography, App, Form } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { useEffect, useMemo, useState } from 'react';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DefaultModalManager } from '../dag-modal-manager';

import style from './index.less';
import P2PCreatePipelineModal from './p2p-pipeline-creation-view';
import type { PipelineTemplateContribution } from './pipeline-protocol';
import { PipelineTemplateType } from './pipeline-protocol';
import { DefaultPipelineService } from './pipeline-service';

const { Link } = Typography;

export const QuickConfigEntry = (prop: { type: PipelineTemplateType }) => {
  const { message } = App.useApp();
  const { type } = prop;
  const modalManager = useModel(DefaultModalManager);
  return (
    <>
      训练流创建成功，可点击
      <Link
        onClick={() => {
          message.destroy('quick-config');
          modalManager.openModal('quick-config', { type });
        }}
      >
        快速配置
      </Link>
      ；如15s内未快速配置，后续可逐个配置
    </>
  );
};

export const PipelineCreationComponent = () => {
  const projectEditService = useModel(ProjectEditService);
  const viewInstance = useModel(PipelineCreationView);
  const { message } = App.useApp();
  const { mode } = parse(window.location.search);
  const [showCreatePipelineModal, setShowCreatePipelineModal] = useState(false);
  const [pipelineForm] = Form.useForm();

  useEffect(() => {
    return () => {
      message.destroy('quick-config');
    };
  }, []);

  const quickConfig = (key: string) => {
    if (
      key === PipelineTemplateType.PSI ||
      key === PipelineTemplateType.RISK ||
      key === PipelineTemplateType.TEE ||
      key === PipelineTemplateType.PSI_TEE
    ) {
      message.success({
        content: <QuickConfigEntry type={key} />,
        duration: 15,
        key: 'quick-config',
      });
    } else {
      message.success('训练流创建成功');
    }
  };

  const onClick: MenuProps['onClick'] = async ({ key }) => {
    try {
      await viewInstance.create(key as PipelineTemplateType);
      quickConfig(key);
    } catch (e) {
      message.error(e as string);
    }
  };

  const p2pSubmit = async () => {
    try {
      await viewInstance.create(
        pipelineForm.getFieldValue('templateId') as PipelineTemplateType,
        pipelineForm.getFieldValue('name'),
      );
      handleCreatePipeline(false);
      const key = pipelineForm.getFieldValue('templateId');
      quickConfig(key);
    } catch (e) {
      message.error(e as string);
    }
  };

  const templateList = useMemo(() => {
    return viewInstance.templates.filter(({ computeMode = ['MPC'] }) =>
      computeMode?.includes(mode as string),
    );
  }, [mode]);

  const templates: MenuProps['items'] = templateList.map((t) => ({
    key: t.type,
    label: (
      <>
        {t.type === PipelineTemplateType.BLANK ? (
          <div>{t.name}</div>
        ) : (
          <Popover
            title={`${t.name}内容预览`}
            placement="right"
            overlayStyle={{ left: 230, paddingBottom: 20 }}
            content={<img className={style.templatePreview} src={t.minimap}></img>}
          >
            <div>使用{t.name}模板</div>
          </Popover>
        )}
      </>
    ),
  }));

  const handleCreatePipeline = (isShow: boolean) => {
    setShowCreatePipelineModal(isShow);
  };

  return (
    <div className={style.pipelineCreation}>
      {hasAccess({ type: [Platform.AUTONOMY] }) ? (
        <>
          <Button
            className={classNames(style.pipelineCreationBtn, {
              [style.pipelineCreationDisableBtn]:
                projectEditService.canEdit.createPipelineDisabled,
            })}
            onClick={() => handleCreatePipeline(true)}
            disabled={projectEditService.canEdit.createPipelineDisabled}
          >
            <PlusOutlined /> 创建训练流
          </Button>
          {showCreatePipelineModal && (
            <P2PCreatePipelineModal
              visible={showCreatePipelineModal}
              data={{ templateList, form: pipelineForm, submit: p2pSubmit }}
              close={() => {
                handleCreatePipeline(false);
              }}
            />
          )}
        </>
      ) : (
        <Dropdown menu={{ items: templates, onClick }} trigger={['hover']}>
          <Button className={style.pipelineCreationBtn}>
            <PlusOutlined /> 创建训练流
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export class PipelineCreationView extends Model {
  templates: PipelineTemplateContribution[];

  pipelineService = getModel(DefaultPipelineService);

  constructor() {
    super();
    this.templates = this.pipelineService.pipelineTemplates.filter(
      ({ argsFilled }) => !argsFilled,
    );
  }

  getPipeline = () => {
    return this.pipelineService.pipelines;
  };

  async create(type: PipelineTemplateType, p2pName?: string) {
    const name = hasAccess({ type: [Platform.AUTONOMY] })
      ? p2pName
      : this.templates.find((item) => item.type === type)?.name;
    if (!name) return;
    const pipelineResult = await this.pipelineService.createPipeline(name, type);
    this.pipelineService.setCurrentPipeline(pipelineResult.id, pipelineResult.name);
  }
}
