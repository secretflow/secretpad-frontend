/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import { Outlet } from 'umi';

import { DefaultComponentInterpreterService } from '@/modules/component-interpreter/component-interpreter-service';
import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import { useModel } from '@/util/valtio-helper';

const ComponentWrapper = () => {
  const componentInterpreterService = useModel(DefaultComponentInterpreterService);
  const componentService = useModel(DefaultComponentTreeService);

  return <Outlet />;
};

export default ComponentWrapper;
