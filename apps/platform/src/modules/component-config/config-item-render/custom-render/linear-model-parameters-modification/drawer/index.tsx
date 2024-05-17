import { Drawer, Spin } from 'antd';

import { Model, useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '..';
import { LinearModelParametersTable } from '../linear-model-parameters-table';
import { ToolBar } from '../toolbar';
import SaveBtn from '../toolbar/save-btn';

const ModificationResultDrawer = () => {
  const { isVisible, setVisible } = useModel(BinningResultDrawerView);
  const { loading, setCurrOperation } = useModel(BinModificationsRenderView);

  return (
    <Drawer
      title={'编辑线性模型参数'}
      width={1200}
      closable
      destroyOnClose
      open={isVisible}
      bodyStyle={{ padding: '16px 16px 0 16px' }}
      onClose={() => {
        setCurrOperation(undefined);
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

export class BinningResultDrawerView extends Model {
  isVisible = false;

  setVisible = (visible: boolean) => {
    this.isVisible = visible;
  };
}

export default ModificationResultDrawer;
