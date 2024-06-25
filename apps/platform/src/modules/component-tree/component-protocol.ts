// The snake case is coming from the component spec (secretflow).

// Supported attribute types.
export type AtomicParameterType =
  // Atomic types
  | 'AT_INT'
  | 'AT_STRING'
  | 'AT_BOOL'
  | 'AT_FLOAT'
  // List types
  | 'AT_INTS'
  | 'AT_FLOATS'
  | 'AT_STRINGS'
  | 'AT_BOOLS'
  // Special types.
  // | 'ATTR_TYPE_UNSPECIFIED'
  | 'AT_SF_TABLE_COL'
  | 'AT_PARTY';

// export const ColSelectionParameter = 'AT_SF_TABLE_COL';

export type ParameterNode = {
  // Indicates the ancestors of a node,
  // e.g. `[name_a, name_b, name_c]` means the path prefixes of current
  // Attribute is `name_a/name_b/name_c/`.
  // Only `^[a-zA-Z0-9_.-]*$` is allowed.
  // `input` and `output` are reserved.
  prefixes?: string[];
  // Must be unique in the same level just like Linux file systems.
  // Only `^[a-zA-Z0-9_.-]*$` is allowed.
  // `input` and `output` are reserved.
  name: string;
  desc: string;
  custom_protobuf_cls?: string;
} & (
  | AtomicParameterNode
  | UnionParameterNode
  | StructParameterNode
  | CustomParameterNode
);

type OneOf<T, P extends keyof T = keyof T> = {
  [K in P]-?: Required<Pick<T, K>> & Partial<Record<Exclude<P, K>, never>>;
}[P];

export type ValueOf<T> = T[keyof T];

export type AtomicParameterSingle = {
  s: string;
  i64: number | string;
  f: number;
  b: boolean;
};
export type AtomicParameterList = {
  ss: string[];
  i64s: number[];
  fs: number[];
  bs: boolean[];
};

export type AtomicParameter = AtomicParameterSingle & AtomicParameterList;

// The value of an attribute
export type Attribute = OneOf<AtomicParameter> & {
  is_na?: boolean;
  custom_protobuf_cls?: string;
};

export type AtomicParameterDef = {
  // If True, when Atomic Attr is not provided or is_na, default_value would
  // be used. Else, Atomic Attr must be provided.
  is_optional?: boolean;

  // A reasonable default for this attribute if the user does not supply a
  // value
  default_value?: Attribute;

  // Only valid when type is `AT_FLOAT \| AT_INT \| AT_STRING \| AT_FLOATS \|
  // AT_INTS \| AT_STRINGS`.
  // Please use list fields of AtomicParameter, i.e. `ss`, `i64s`, `fs`.
  // If the attribute is a list, allowed_values is applied to each element.
  allowed_values?: OneOf<AtomicParameterList>;

  // Only valid when type is `AT_FLOATS \| AT_INTS \| AT_STRINGS \| AT_BOOLS`.
  list_min_length_inclusive?: number;
  list_max_length_inclusive?: number;

  // Only valid when type is `AT_FLOAT \| AT_INT \| AT_FLOATS \| AT_INTS `.
  // If the attribute is a list, lower_bound is applied to each element.
  lower_bound_enabled?: boolean;
  upper_bound_enabled?: boolean;
  upper_bound_inclusive?: boolean;
  lower_bound_inclusive?: boolean;
  lower_bound?: Attribute;
  upper_bound?: Attribute;
};

export type AtomicParameterNode = {
  type: AtomicParameterType;
  atomic: AtomicParameterDef;
};

export type UnionParameterNode = {
  type: 'AT_UNION_GROUP';
  union: ParameterUnionDef;
};

export type StructParameterNode = {
  type: 'AT_STRUCT_GROUP';
};

export type CustomParameterNode = {
  type: 'AT_CUSTOM_PROTOBUF';
  custom_protobuf_cls: string;
};

// Define an input/output for component.
export type IoDef = {
  // should be unique among all IOs of the component.
  name: string;
  desc: string;

  // Must be one of DistData.type in data.proto
  types: string[];

  attrs?: TableAttrDef[];
};

type TableAttrDef = {
  name: string;
  desc: string;

  // Accepted col data types.
  // Please check DistData.VerticalTable in data.proto.
  types?: string[];
  col_max_cnt_inclusive?: number;
  col_min_cnt_inclusive?: number;

  extra_attrs?: ParameterNode[];
};

type ParameterUnionDef = {
  default_selection: string;
};

export type Component = {
  name: string;
  domain: string;
  desc: string;
  version: string;
  attrs: ParameterNode[];
  inputs: IoDef[];
  outputs: IoDef[];
};

export type ComponentList = {
  name: string;
  desc: string;
  version: string;
  comps: Component[];
};

export type ComponentTreeItem = {
  isLeaf: boolean;
  key: string;
  title: { val: string };
  children?: ComponentTreeItem[];
  docString: string;
  category: string;
};

export enum ComputeModeEnum {
  MPC = 'MPC',
  TEE = 'TEE',
}

export type ComputeMode = keyof typeof ComputeModeEnum;
