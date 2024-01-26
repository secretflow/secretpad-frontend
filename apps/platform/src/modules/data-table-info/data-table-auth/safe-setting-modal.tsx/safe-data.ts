export enum CaseKey {
  NoCorrelationNoGroupAuth = '0-0-1',
  CorrelationNoGroupAuth = '1-0-1',
  NoCorrelationGroupAuth = '0-1-1',
  NoCorrelationNoGroupNoAuth = '0-0-0',
}

export const safeConfigData = [
  {
    key: CaseKey.NoCorrelationNoGroupAuth,
    correlationKey: '关',
    groupKey: '关',
    auth: '开',
    desclist: [
      '不能用做关联键，不能用做分组键。经比较函数、聚合函数处理后，才能出现在SELECT的分析结果中',
    ],
  },
  {
    key: CaseKey.CorrelationNoGroupAuth,
    correlationKey: '开',
    groupKey: '关',
    auth: '开',
    desclist: [
      '可以用做关联键，不能用做分组键。经比较函数、聚合函数处理后，才能出现在SELECT的分析结果中',
    ],
  },
  {
    key: CaseKey.NoCorrelationGroupAuth,
    correlationKey: '关',
    groupKey: '开',
    auth: '开',
    desclist: [
      '不可以用做关联键，能用做分组键。经比较函数、聚合函数、或 GROUP-BY 处理后，才能出现在SELECT的分析结果中',
    ],
  },
  {
    key: CaseKey.NoCorrelationNoGroupNoAuth,
    correlationKey: '关',
    groupKey: '关',
    auth: '关',
    desclist: [
      '任意操作，可以用作关联键，可以用作分组键。可以直接出现在SELECT的分析结果中',
      '注意：关闭保护时，字段数值可以明文透出在结果中，字段可以任意操作',
    ],
  },
];

export const KeyTypes = [
  {
    label: '关联键',
    keys: 'correlationKey',
  },
  {
    label: '分组列',
    keys: 'groupKey',
  },
  {
    label: '保护开关',
    keys: 'auth',
  },
];

export const QuerySql = {
  [CaseKey.NoCorrelationNoGroupAuth]: `    # 不能执行成功，试图套出某个id对应的label
    select
      tb.label
    from
      ta join tb
    on ta.id_a = tb.id_b
    where ta.id_a = "123";

    # 不能执行成功，试图拿到所有交集id的label
    select
      tb.label
    from
      ta join tb
    on ta.id_a = tb.id_b;

    # 每组样本数均不小于3时，能执行成功，不拿个体的分箱值、label，也不会拿出具体的id值
    # 存在分组样本数小于3时，不能执行成功，有套出个体分箱值、label的风险
    select
      ta.pred_a_binned,
      count(*),
      sum(tb.label)
    from
      ta join tb
    on ta.id_a = tb.id_b
    group by
      ta.pred_a_binned;`,
  [CaseKey.CorrelationNoGroupAuth]: `    # 不能执行成功，试图拿到具体id值
    select
      id_a
    from
      ta join tb
    on ta.id_a = tb.id_b;

    # 不能执行成功，试图套出某个id值
    select
      max(id_a)
    from
      ta join tb
    on ta.id_a = tb.id_b;

    # 可以执行成功，不会泄露个体的id值
    select
      count(*)
    from
      ta join tb
    on ta.id_a = tb.id_b
    group by
      ta.pred_a_binned;

    # 每组样本数均不小于3时，能执行成功，不拿个体的分箱值、label，也不会拿出具体的id值
    # 存在分组样本数小于3时，不能执行成功，有套出个体分箱值、label的风险
    select
      ta.pred_a_binned,
      count(*),
      sum(tb.label)
    from
      ta join tb
    on ta.id_a = tb.id_b
    group by
      ta.pred_a_binned;`,
  [CaseKey.NoCorrelationGroupAuth]: `    # 不能执行成功，试图套出某个id对应的分箱值
    select
      ta.pred_a_binned
    from
      ta join tb
    on ta.id_a = tb.id_b
    where ta.id_a = "123";

    # 不能执行成功，试图拿到所有交集id的明细分箱值
    select
      ta.pred_a_binned
    from
      ta join tb
    on ta.id_a = tb.id_b;

    # 每组样本数均不小于3时，能执行成功，不拿个体的分箱值、label，也不会拿出具体的id值
    # 存在分组样本数小于3时，不能执行成功，有套出个体分箱值、label的风险
    select
      ta.pred_a_binned,
      count(*),
      sum(tb.label)
    from
      ta join tb
    on ta.id_a = tb.id_b
    group by
      ta.pred_a_binned;`,
  [CaseKey.NoCorrelationNoGroupNoAuth]: '',
};

export const SafeConfigTableData = [
  {
    key: '1',
    ownedBy: 'Ant',
    Table: 'ta',
    column: 'id_a',
    Type: 'STRING',
    correlationKey: '开',
    groupKey: '关',
    auth: '开',
    desc: '任意id明文不会透出',
    highlight: 1,
  },
  {
    key: '2',
    ownedBy: 'Ant',
    Table: 'ta',
    column: 'pred_a_binned',
    Type: 'INT',
    correlationKey: '关',
    groupKey: '开',
    auth: '开',
    desc: '不能拿到个体的分箱值',
    highlight: 2,
  },
  {
    key: '3',
    ownedBy: 'Bank',
    Table: 'tb',
    column: 'id_b',
    Type: 'STRING',
    correlationKey: '开',
    groupKey: '关',
    auth: '开',
    desc: '任意id明文不会透出',
    highlight: 1,
  },
  {
    key: '4',
    ownedBy: 'Bank',
    Table: 'tb',
    column: 'label',
    Type: 'INT',
    correlationKey: '关',
    groupKey: '关',
    auth: '开',
    desc: '不能拿到个体的label值',
    highlight: 0,
  },
];
