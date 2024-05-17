import { SettingOutlined } from '@ant-design/icons';
import {
  AdvancedConfig,
  AdvancedConfigDrawer,
} from './advanced-config-drawer/advanced-config-view';
import { useModel } from '@/util/valtio-helper';
import { DefaultModalManager } from '@/modules/dag-modal-manager';

import styles from './index.less';
import { Tooltip } from 'antd';

export const AdvancedConfigComponent: React.FC = () => {
  const modalManager = useModel(DefaultModalManager);

  const handleClick = () => {
    modalManager.openModal(AdvancedConfigDrawer.id);
  };

  return (
    <div>
      <Tooltip title="全局配置">
        <SettingOutlined onClick={handleClick} className={styles.settingContent} />
      </Tooltip>
      <AdvancedConfig />
    </div>
  );
};
