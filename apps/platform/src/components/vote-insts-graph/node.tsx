import type { Node } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { Tag } from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import classnames from 'classnames';

import { ReactComponent as InstIcon } from '@/assets/inst.icon.svg';
import { MessageStateTagWrap } from '@/modules/message-center/component/common';
import {
  StatusEnum,
  StatusObj,
} from '@/modules/p2p-project-list/components/auth-project-tag';

import styles from './index.less';

const VoteNode = ({ node }: { node: Node }) => {
  const data = node.getData();
  const { action, isInitiator, instName, nodeName, isOurNode } = data;

  const voteTagClassNameMapping = {
    [StatusEnum.AGREE]: 'agree',
    [StatusEnum.PROCESS]: 'reviewing',
    [StatusEnum.REJECT]: 'rejected',
  };

  return (
    <div className={styles['custom-vote-node']}>
      <div className={styles.nodeName}>
        <Tag
          className={classnames(styles.tag, {
            [styles.tagInvitee]: !isInitiator,
          })}
        >
          {isInitiator ? '发起' : '受邀'}
        </Tag>
        <Paragraph
          style={{ fontSize: 14, marginRight: 8, width: 200, marginBottom: 0 }}
          ellipsis={{ rows: 1, tooltip: nodeName + (isOurNode ? '(我的)' : '') }}
        >
          {nodeName}
          <span style={{ color: '#00000026' }}>{isOurNode ? '(我的)' : ''}</span>
        </Paragraph>
        {isOurNode ? (
          <MessageStateTagWrap label={'本方状态'} status={action} />
        ) : (
          <Tag
            className={classnames(
              styles.tag,
              styles[voteTagClassNameMapping[action as StatusEnum] || 'agree'],
            )}
          >
            {StatusObj[action as StatusEnum]}
          </Tag>
        )}
      </div>

      <div className={styles.instName}>
        <InstIcon />
        <Paragraph
          style={{ fontSize: 14, marginLeft: 4, width: 200, marginBottom: 0 }}
          ellipsis={{ rows: 1, tooltip: instName }}
        >
          {instName}
        </Paragraph>
      </div>
    </div>
  );
};

register({
  shape: 'custom-vote-node',
  width: 280,
  height: 64,
  component: VoteNode,
  effect: ['data'],
  inherit: 'react-shape',
});
