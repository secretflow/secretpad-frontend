import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Popconfirm, message } from 'antd';

import { CommandRegistry } from '@/util/command';
import { useModel } from '@/util/valtio-helper';

import style from './index.less';
import type { PipelineTreeItem } from './pipeline-protocol';
import { PipelineCommands } from './pipeline-protocol';
import { DefaultPipelineService } from './pipeline-service';
import { getPipelineCommandFeeback } from './utils';

/** from: antd -> menu -> onClick */
interface MenuInfo {
  key: string;
  keyPath: string[];
  /** @deprecated This will not support in future. You should avoid to use this */
  item: React.ReactInstance;
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}

export const PipelineMenu = (prop: {
  pipeline: PipelineTreeItem;
  commandCallback: () => Promise<void>;
}) => {
  const { pipeline, commandCallback } = prop;
  const pipelineService = useModel(DefaultPipelineService);
  const menus = DefaultPipelineService.menus;

  const items = menus.map((m) => {
    if (m.id === PipelineCommands.DELETE.id) {
      return {
        key: m.id,
        label: (
          <Popconfirm
            title="你确定要删除吗"
            placement="rightTop"
            onConfirm={() => clickHandler(m.id, pipeline)}
            okText="确定"
            cancelText="取消"
            overlayClassName={style.cancelPipelinePopconfirm}
            overlayStyle={{ left: 250 }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span className={style.menuIcon}>{m.icon} </span>
              <span> {m.label}</span>
            </div>
          </Popconfirm>
        ),
      };
    } else {
      return {
        key: m.id,
        label: (
          <div>
            <span className={style.menuIcon}>{m.icon} </span>
            <span> {m.label}</span>
          </div>
        ),
        onClick: ({ key }: MenuInfo) => clickHandler(key, pipeline),
      };
    }
  });

  const clickHandler = async (commandId: string, pipelineItem: PipelineTreeItem) => {
    try {
      /** ⬇️ response always be undefined */
      await CommandRegistry.executeCommand(commandId, pipelineItem);

      await commandCallback();
      pipelineService.setCurrentPipeline(
        pipelineService.pipelines[0]?.graphId || '',
        pipelineService.pipelines[0]?.name,
      );
      const msg = getPipelineCommandFeeback(commandId, pipelineItem.title);
      if (msg) message.success(msg);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <MoreOutlined style={{ marginRight: 8 }} />
    </Dropdown>
  );
};
