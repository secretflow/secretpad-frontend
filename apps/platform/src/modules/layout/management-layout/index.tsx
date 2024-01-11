import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { Menu } from 'antd';
import classnames from 'classnames';
import { parse, stringify } from 'query-string';
import { useEffect, useState } from 'react';
import { history, useLocation } from 'umi';

import { isWindows } from '@/util/platform';

import styles from './index.less';

type ManagementLayoutComponentProps = {
  menuItems: {
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    key: string;
  }[];
  defaultTabKey?: string;
};

export const foldHotKey = {
  key: isWindows ? 'ctrl.uparrow' : 'meta.ctrl.uparrow',
  text: isWindows ? 'Ctrl + ↑' : '⌘ + ctrl + ↑ ',
};

export const ManagementLayoutComponent = (props: ManagementLayoutComponentProps) => {
  const { menuItems, defaultTabKey } = props;
  const [collapsed, setCollapsed] = useState(false);

  const { pathname, search } = useLocation();
  const parsedSearch = parse(search);

  const { tab, nodeId } = parsedSearch as { tab?: string; nodeId?: string };
  const [tabKey, setTabKey] = useState<string>();

  useEffect(() => {
    history.replace({
      pathname: pathname === '/' ? '/home' : pathname,
      search: stringify(
        nodeId
          ? {
              ...parsedSearch,
              nodeId,
              tab: tab || defaultTabKey,
            }
          : { tab: tab || defaultTabKey },
      ),
    });
  }, [defaultTabKey, tab]);

  useEffect(() => {
    setTabKey(tab || defaultTabKey);
  }, [tab]);

  const [collapseInfo, setCollapsedInfo] = useState(`收起/展开 ${foldHotKey.text}`);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    if (!collapsed) {
      setTimeout(() => setCollapsedInfo(`收起/展开 ${foldHotKey.text}`), 250);
    } else {
      setCollapsedInfo(``);
    }
  }, [collapsed]);

  useKeyPress([foldHotKey.key], (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleCollapsed();
  });

  return (
    <div className={styles.layoutContainer}>
      <div
        className={classnames(
          styles.menuContainer,
          collapsed ? styles.fold : styles.unfold,
        )}
      >
        <Menu
          selectedKeys={[tabKey as string]}
          mode="inline"
          inlineCollapsed={collapsed}
          items={menuItems}
          onSelect={({ key }) => {
            history.replace({
              pathname: pathname === '/' ? '/home' : pathname,
              search: stringify(nodeId ? { nodeId, tab: key } : { tab: key }),
            });
          }}
        />

        <div className={styles.collapseInfo}>
          <div className={styles.collapseIcon} onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div className={classnames(styles.collapseText)}>{collapseInfo}</div>
        </div>
      </div>

      <div
        className={classnames(styles.contentContainer, {
          [styles.workbenchContentContainer]: tabKey === 'workbench',
        })}
      >
        {menuItems.find(({ key }) => key === tabKey)?.component}
      </div>
    </div>
  );
};
