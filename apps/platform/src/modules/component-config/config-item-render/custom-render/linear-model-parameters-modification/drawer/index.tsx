import { Drawer, Spin } from 'antd';

import { Model, useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '..';
import { LinearModelParametersTable } from '../table';
import { ToolBar } from '../toolbar';
import SaveBtn from '../toolbar/save-btn';

const ModificationResultDrawer = () => {
  const { isVisible, setVisible } = useModel(ParametersResultDrawerView);
  const { loading } = useModel(LinearModelParamsModificationsRenderView);

  return (
    <Drawer
      title={'编辑线性模型参数'}
      width={1200}
      closable
      destroyOnClose
      open={isVisible}
      bodyStyle={{ padding: '16px 16px 0 16px' }}
      onClose={() => {
        setVisible(false);
      }}
    >
      <Spin spinning={loading} tip={'...'}>
        <ToolBar />
        <LinearModelParametersTable />
        {/* 保存按钮 */}
        <SaveBtn />
      </Spin>
    </Drawer>
  );
};

export class ParametersResultDrawerView extends Model {
  isVisible = false;

  setVisible = (visible: boolean) => {
    this.isVisible = visible;
  };
}

export default ModificationResultDrawer;
