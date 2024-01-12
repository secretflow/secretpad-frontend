import styles from './index.less';

const nodeFuncData = [
  {
    name: '管控节点+计算节点',
    desc: '适用于P2P的产品模式',
    status: '已支持',
  },
  // {
  //   name: '发起任务（仅PSI）',
  //   desc: '支持合作节点授权、发起任务计算等，仅支持隐私求交任务',
  //   status: '已支持',
  // },
  // {
  //   name: '支持TEE',
  //   desc: '支持通过可信TEE进行计算，包含数据加解密能力',
  //   status: '已支持',
  // },
];

export const NodeFunc = () => {
  return (
    <div className={styles.nodeFuncContent}>
      {nodeFuncData.map((item) => {
        return (
          <div className={styles.item} key={item.name}>
            <div className={styles.left}>
              <div className={styles.title}>{item.name}</div>
              <div className={styles.desc}>{item.desc}</div>
            </div>
            <div className={styles.status}>{item.status}</div>
          </div>
        );
      })}
    </div>
  );
};
