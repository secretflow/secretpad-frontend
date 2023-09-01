import { ShowMenuContext, Portal } from '@secretflow/dag';
import classnames from 'classnames';
import type { ReactNode } from 'react';

import { useModel } from '@/util/valtio-helper';

import { HeaderComponent } from './header-view';
import { HomeLayoutService } from './home-layout.service';
import styles from './index.less';

export const HomeLayout = ({ children }: { children: ReactNode }) => {
  const layoutService = useModel(HomeLayoutService);
  const { bgClassName } = layoutService;
  const X6ReactPortalProvider = Portal.getProvider();
  return (
    <div className={classnames(styles.home, styles[bgClassName])}>
      <ShowMenuContext.Provider value={false}>
        <X6ReactPortalProvider />
      </ShowMenuContext.Provider>

      <div className={styles.header}>
        <HeaderComponent />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
