import { Drawer, Spin } from 'antd';

import { Model, useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '..';
import { BinningTable } from '../binning-table';
import { ToolBar } from '../toolbar';
import SaveBtn from '../toolbar/save-btn';

const BinningResultDrawer = () => {
  const { isVisible, setVisible } = useModel(BinningResultDrawerView);
  const { loading, setCurrOperation } = useModel(BinModificationsRenderView);

  return (
    <Drawer
      title={'编辑分箱'}
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
      <Spin
        spinning={loading}
        tip={'合并后会重新生成分箱规则，请等待，过程中请勿离开本窗口'}
      >
        <ToolBar />
        <BinningTable />
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

export default BinningResultDrawer;
