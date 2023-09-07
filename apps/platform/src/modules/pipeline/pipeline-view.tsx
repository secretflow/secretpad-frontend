import { NodeIndexOutlined, EditOutlined } from '@ant-design/icons';
import { Input, Tooltip, Tree, message } from 'antd';
import { App } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { CommandRegistry } from '@/util/command';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import style from './index.less';
import { PipelineMenu } from './pipeline-menu';
import type { Pipeline, PipelineTreeItem } from './pipeline-protocol';
import { PipelineCommands } from './pipeline-protocol';
import { DefaultPipelineService } from './pipeline-service';

const PipelineListNode = (props: { node: PipelineTreeItem }) => {
  const { node } = props;
  const viewInstance = useModel(PipelineView);
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <Input
      maxLength={22}
      defaultValue={node.title}
      prefix={<NodeIndexOutlined />}
      autoFocus
      onPressEnter={(e) => {
        const newName = (e.target as HTMLInputElement).value;
        viewInstance.rename(node, newName);
        setIsEditing(false);
      }}
      onBlur={(e) => {
        const newName = (e.target as HTMLInputElement).value;
        viewInstance.rename(node, newName);
        setIsEditing(false);
      }}
    ></Input>
  ) : (
    <div className={style.pipelineItemContainer}>
      <div className={style.pipelineItemText}>
        <div className={style.treeIcon}>
          <NodeIndexOutlined />
        </div>
        {node.title}
      </div>
      <div className={style.pipelineItemIcons}>
        <div className={classnames(style.treeIcon, style.commandIcon)}>
          <Tooltip title="编辑" placement="top">
            <EditOutlined
              onClick={() => {
                setIsEditing(true);
              }}
            />
          </Tooltip>
        </div>
        <div className={classnames(style.treeIcon, style.commandIcon)}>
          <PipelineMenu
            pipeline={node}
            commandCallback={() => viewInstance.refresh()}
          />
        </div>
      </div>
    </div>
  );
};

export const PipelineViewComponent = () => {
  const { search } = useLocation();
  const { projectId, dagId } = parse(search);
  const { message: messageApi } = App.useApp();
  const viewInstance = useModel(PipelineView);

  useEffect(() => {
    viewInstance.setCurrentPipeline(dagId);
  }, [dagId]);

  useEffect(() => {
    const update = async () => {
      await viewInstance.refresh();
      const currentPipeline = viewInstance.pipelineService.pipelines.find(
        (item) => item.projectId === projectId && item.graphId === dagId,
      ) as { projectId: string; graphId: string; name: string } | undefined;
      if (currentPipeline) {
        viewInstance.pipelineService.setCurrentPipeline(
          currentPipeline.graphId,
          currentPipeline.name,
        );
        viewInstance.currentPipelineId = currentPipeline.graphId;
      } else {
        if (viewInstance.pipelines[0]) {
          viewInstance.pipelineService.setCurrentPipeline(
            viewInstance.pipelines[0].key,
            viewInstance.pipelines[0].title,
          );
          viewInstance.currentPipelineId = viewInstance.pipelines[0].key as string;
        }
      }
    };

    update();
  }, [projectId]);
  return (
    <div className={style.treeContainer}>
      <Tree
        blockNode
        treeData={viewInstance.pipelines}
        titleRender={(node) => <PipelineListNode node={node} />}
        rootClassName={style.pipelineTree}
        selectedKeys={[viewInstance.currentPipelineId]}
        onSelect={(selectedKeys, { selectedNodes }) => {
          selectedNodes[0]?.key &&
            viewInstance.pipelineService.setCurrentPipeline(
              selectedNodes[0]?.key,
              selectedNodes[0]?.title,
            );
          messageApi.destroy('quick-config');
        }}
      ></Tree>

      {/* <Slot name="pipeline-creation" /> */}
    </div>
  );
};

export class PipelineView extends Model {
  pipelineService = getModel(DefaultPipelineService);
  commands = CommandRegistry;
  constructor() {
    super();
    this.pipelineService.onPipelineChanged(this.setCurrentPipeline.bind(this));
    this.pipelineService.onPipelineCreated(async () => await this.refresh());
  }

  pipelines: any[] = [];

  currentPipelineId = '';

  onViewMount = async () => {
    this.convert(await this.pipelineService.getPipelines());
    if (this.pipelineService.pipelines.length > 0) {
      const { search } = window.location;

      const { projectId, dagId } = parse(search);
      const currentPipeline = this.pipelineService.pipelines.find(
        (item) => item.projectId === projectId && item.graphId === dagId,
      ) as { projectId: string; graphId: string; name: string } | undefined;
      if (currentPipeline) {
        this.pipelineService.setCurrentPipeline(
          currentPipeline.graphId,
          currentPipeline.name,
        );
        this.currentPipelineId = currentPipeline.graphId;
      } else {
        this.pipelineService.setCurrentPipeline(
          this.pipelines[0].key,
          this.pipelines[0].title,
        );
        this.currentPipelineId = this.pipelines[0].key as string;
      }
    }
  };

  async refresh() {
    this.convert(await this.pipelineService.getPipelines());
  }

  convert(pipelines: Pipeline[]) {
    const pipelineData = pipelines.map((i) => ({
      title: i.name,
      key: i.graphId,
    }));

    this.pipelines = pipelineData;
  }

  async rename(pipelineData: PipelineTreeItem, name: string) {
    if (name !== pipelineData.title) {
      try {
        await this.commands.executeCommand(
          PipelineCommands.RENAME.id,
          pipelineData,
          name,
        );
        this.refresh();
        this.pipelineService.setCurrentPipeline(pipelineData.key);
      } catch (e) {
        // TODO
        message.error('rename fail');
      }
    }
  }

  setCurrentPipeline(pipelineId: string) {
    if (!pipelineId) return;
    this.currentPipelineId = pipelineId;
  }
}
