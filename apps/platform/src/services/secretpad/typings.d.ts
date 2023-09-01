/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AddInstToProjectRequest {
    /** Project id */
    projectId?: string;
    /** Institution id */
    instId?: string;
  }

  interface AddNodeToProjectRequest {
    /** Project id */
    projectId?: string;
    /** Node id */
    nodeId?: string;
  }

  interface AddProjectDatatableRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Node id, it can not be blank */
    nodeId?: string;
    /** Datatable id, it can not be blank */
    datatableId?: string;
    /** Datatable column config list */
    configs?: Array<TableColumnConfigParam>;
  }

  type AuthErrorCode =
    | 202011601
    | 'USER_NOT_FOUND'
    | 202011602
    | 'WRONG_PASSWORD'
    | 202011603
    | 'AUTH_FAILED';

  interface AuthProjectVO {
    /** Project id */
    projectId?: string;
    /** Project name */
    name?: string;
    /** Association key list */
    associateKeys?: Array<string>;
    /** Group key list */
    groupKeys?: Array<string>;
    /** Label key list */
    labelKeys?: Array<string>;
    /** Authorized time */
    gmtCreate?: string;
  }

  interface CompListVO {
    /** Component name */
    name?: string;
    /** Component description */
    desc?: string;
    /** Component version */
    version?: string;
    /** Component summaryDef list */
    comps?: Array<ComponentSummaryDef>;
  }

  interface ComponentSummaryDef {
    /** Namespace of the component */
    domain?: string;
    /** Component name */
    name?: string;
    /** Component description */
    desc?: string;
    /** Component version */
    version?: string;
  }

  interface CreateDataByDataSourceRequest {
    /** 节点Id */
    nodeId?: string;
    /** 表名称 */
    name?: string;
    /** 数据路径 */
    tablePath?: string;
    /** 数据源id */
    datasourceId?: string;
    /** 表描述 */
    description?: string;
    /** 表schema */
    datatableSchema?: Array<DatatableSchema>;
  }

  interface CreateDataRequest {
    /** Node id */
    nodeId?: string;
    /** The data file name, it must be the same as that of the source file */
    name?: string;
    /** The real name of the file, passed only to the back end, is the field that the user needs to
manipulate, derived from the value returned by the back end in the uplink mouth */
    realName?: string;
    /** Specific table name, user manually filled */
    tableName?: string;
    /** Datatable description */
    description?: string;
    /** Datatable schema */
    datatableSchema?: Array<DatatableSchema>;
  }

  interface CreateGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph name, it can not be blank */
    name?: string;
    /** Template id */
    templateId?: string;
    /** Graph node list */
    nodes?: Array<GraphNode>;
    /** Graph edge list */
    edges?: Array<GraphEdge>;
  }

  interface CreateGraphVO {
    /** Graph id */
    graphId?: string;
  }

  interface CreateNodeRequest {
    /** Node name, the value cannot be empty and can be the same */
    name?: string;
  }

  interface CreateNodeRouterRequest {
    /** 本方节点id */
    srcNodeId?: string;
    /** 合作方节点id */
    dstNodeId?: string;
    /** 本方通讯地址 */
    srcNetAddress?: string;
    /** 合作方通讯地址 */
    dstNetAddress?: string;
    /** 访问模式： 双向:FullDuplex 单向:HalfDuplex */
    routeType?: string;
  }

  interface CreateProjectRequest {
    /** Project name */
    name?: string;
    /** Project description */
    description?: string;
    /** 计算模式 pipeline:管道模式 ,hub:枢纽模式 */
    computeMode?: string;
  }

  interface CreateProjectVO {
    /** Project id */
    projectId?: string;
  }

  type DataErrorCode =
    | 202011801
    | 'FILE_NAME_EMPTY'
    | 202011802
    | 'FILE_TYPE_NOT_SUPPORT'
    | 202011803
    | 'FILE_EXISTS_ERROR'
    | 202011804
    | 'FILE_NOT_EXISTS_ERROR'
    | 202011805
    | 'ILLEGAL_PARAMS_ERROR'
    | 202011806
    | 'NAME_DUPLICATION_ERROR';

  interface DataSourceVO {
    /** 数据源名称 */
    name?: string;
    /** 数据源路径 */
    path?: string;
  }

  type DatatableErrorCode =
    | 202011301
    | 'DATATABLE_NOT_EXISTS'
    | 202011302
    | 'UNSUPPORTED_DATATABLE_TYPE'
    | 202011303
    | 'QUERY_DATATABLE_FAILED'
    | 202011304
    | 'DELETE_DATATABLE_FAILED'
    | 202011305
    | 'DATATABLE_DUPLICATED_AUTHORIZED';

  interface DatatableListVO {
    /** Datatable view object list */
    datatableVOList?: Array<DatatableVO>;
    /** The total count of datatable */
    totalDatatableNums?: number;
  }

  interface DatatableSchema {
    /** Feature name */
    featureName?: string;
    /** Feature type */
    featureType?: string;
    /** Feature description */
    featureDescription?: string;
  }

  interface DatatableVO {
    /** Datatable id */
    datatableId?: string;
    /** Datatable name */
    datatableName?: string;
    /** Datatable status Status：Available，Unavailable */
    status?: string;
    /** The data source id which it belongs to */
    datasourceId?: string;
    /** Relative uri */
    relativeUri?: string;
    /** Datatable type */
    type?: string;
    /** Datatable description */
    description?: string;
    /** Datatable table column view object list */
    schema?: Array<TableColumnVO>;
    /** Authorized project list */
    authProjects?: Array<AuthProjectVO>;
  }

  interface DeleteDatatableRequest {
    /** Node id */
    nodeId?: string;
    /** Datatable id */
    datatableId?: string;
  }

  interface DeleteGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
  }

  interface DeleteProjectDatatableRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Node id, it can not be blank */
    nodeId?: string;
    /** Datatable id, it can not be blank */
    datatableId?: string;
  }

  interface DownloadDataRequest {
    /** Node id */
    nodeId?: string;
    /** Domain data id */
    domainDataId?: string;
  }

  type FileMeta = Record<string, any>;

  interface FullUpdateGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node information list */
    nodes?: Array<GraphNodeInfo>;
    /** Graph edge list */
    edges?: Array<GraphEdge>;
  }

  interface GetComponentRequest {
    /** Namespace of the component, it can not be blank */
    domain?: string;
    /** Component name, it can not be blank */
    name?: string;
  }

  interface GetDatatableRequest {
    /** Node id */
    nodeId?: string;
    /** Datatable id */
    datatableId?: string;
  }

  interface GetGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
  }

  interface GetNodeResultDetailRequest {
    /** Node id */
    nodeId?: string;
    /** Domain data id */
    domainDataId?: string;
    /** Rules for filtering by data type, not filled when listing all outputs */
    dataType?: string;
    /** Rules for producer filtering by data vendor, not filled when listing all outputs */
    dataVendor?: string;
  }

  interface GetProjectDatatableRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Node id, it can not be blank */
    nodeId?: string;
    /** Datatable id, it can not be blank */
    datatableId?: string;
  }

  interface GetProjectJobRequest {
    /** Project id */
    projectId?: string;
    /** Job id */
    jobId?: string;
  }

  interface GetProjectJobTaskLogRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Job id, it can not be blank */
    jobId?: string;
    /** Task id, it can not be blank */
    taskId?: string;
  }

  interface GetProjectJobTaskOutputRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Job id, it can not be blank */
    jobId?: string;
    /** Task id, it can not be blank */
    taskId?: string;
    /** Output id, it can not be blank */
    outputId?: string;
  }

  interface GetProjectRequest {
    /** Project id, it can not be blank */
    projectId?: string;
  }

  interface GraphDetailVO {
    /** Project id */
    projectId?: string;
    /** Graph id */
    graphId?: string;
    /** Graph name */
    name?: string;
    /** Graph node detail list */
    nodes?: Array<GraphNodeDetail>;
    /** Graph edge list */
    edges?: Array<GraphEdge>;
  }

  interface GraphEdge {
    /** Edge id */
    edgeId?: string;
    /** Graph edge source attribute */
    source?: string;
    /** Graph edge sourceAnchor attribute */
    sourceAnchor?: string;
    /** Graph edge target attribute */
    target?: string;
    /** Graph edge targetAnchor attribute */
    targetAnchor?: string;
  }

  type GraphErrorCode =
    | 202011701
    | 'COMPONENT_NOT_EXISTS'
    | 202011702
    | 'GRAPH_NOT_EXISTS'
    | 202011703
    | 'GRAPH_EXISTS'
    | 202011704
    | 'GRAPH_NODE_NOT_EXISTS'
    | 202011705
    | 'GRAPH_DATATABLE_EMPTY'
    | 202011706
    | 'COMPONENT_18N_ERROR'
    | 202011707
    | 'GRAPH_JOB_INVALID'
    | 202011708
    | 'GRAPH_NODE_OUTPUT_NOT_EXISTS'
    | 202011709
    | 'RESULT_TYPE_NOT_SUPPORTED'
    | 202011710
    | 'GRAPH_DEPENDENT_NODE_NOT_RUN'
    | 202011711
    | 'GRAPH_NODE_ROUTE_NOT_EXISTS';

  type GraphJobStatus = 'RUNNING' | 'STOPPED' | 'SUCCEED' | 'FAILED';

  interface GraphMetaVO {
    /** Project id */
    projectId?: string;
    /** Graph id */
    graphId?: string;
    /** Graph name */
    name?: string;
  }

  interface GraphNode {
    /** Graph code name */
    codeName?: string;
    /** Graph node id */
    graphNodeId?: string;
    /** Label column */
    label?: string;
    /** X value */
    x?: number;
    /** Y value */
    y?: number;
    /** Graph node task status */
    status?: GraphNodeTaskStatus;
  }

  interface GraphNodeDetail {
    /** Graph code name */
    codeName?: string;
    /** Graph node id */
    graphNodeId?: string;
    /** Label column */
    label?: string;
    /** X value */
    x?: number;
    /** Y value */
    y?: number;
    /** Project graph input list */
    inputs?: Array<string>;
    /** Project graph output list */
    outputs?: Array<string>;
    /** Project graph nodeDef metadata model */
    nodeDef?: Record<string, any>;
    /** Graph node task status */
    status?: GraphNodeTaskStatus;
    /** JobId，the Job associated with this GraphNode is empty if it is not associated */
    jobId?: string;
    /** TaskId，the Task associated with this GraphNode is empty if it is not associated */
    taskId?: string;
    /** Project result base view object list */
    results?: Array<ProjectResultBaseVO>;
  }

  interface GraphNodeInfo {
    /** Graph code name */
    codeName?: string;
    /** Graph node id */
    graphNodeId?: string;
    /** Label column */
    label?: string;
    /** X value */
    x?: number;
    /** Y value */
    y?: number;
    /** Project graph input list */
    inputs?: Array<string>;
    /** Project graph output list */
    outputs?: Array<string>;
    /** Project graph nodeDef metadata model */
    nodeDef?: Record<string, any>;
  }

  interface GraphNodeLogsRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node id, it can not be blank */
    graphNodeId?: string;
  }

  interface GraphNodeOutputRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node id, it can not be blank */
    graphNodeId?: string;
    /** Graph node output id, it can not be blank */
    outputId?: string;
  }

  interface GraphNodeOutputVO {
    /** Graph result type */
    type?: string;
    /** Graph code name */
    codeName?: string;
    /** Graph node output tabs */
    tabs?: Record<string, any>;
    /** Graph node output file meta */
    meta?: GraphNodeOutputVOFileMeta;
    /** Graph start time */
    gmtCreate?: string;
    /** Graph update time */
    gmtModified?: string;
  }

  type GraphNodeOutputVOFileMeta = Record<string, any>;

  interface GraphNodeStatusVO {
    /** Graph node id */
    graphNodeId?: string;
    /** Graph node task id */
    taskId?: string;
    /** Graph node task status */
    status?: GraphNodeTaskStatus;
  }

  interface GraphNodeTaskLogsVO {
    /** Graph node task status */
    status?: GraphNodeTaskStatus;
    /** Task logs */
    logs?: Array<string>;
  }

  type GraphNodeTaskStatus =
    | 'STAGING'
    | 'INITIALIZED'
    | 'RUNNING'
    | 'STOPPED'
    | 'SUCCEED'
    | 'FAILED';

  interface GraphStatus {
    /** Check if the graph is finished */
    finished?: boolean;
    /** Graph node status view object list */
    nodes?: Array<GraphNodeStatusVO>;
  }

  type HttpServletRequest = Record<string, any>;

  type HttpServletResponse = Record<string, any>;

  type InstErrorCode = 202011200 | 'INST_NOT_EXISTS';

  type JobErrorCode =
    | 202011901
    | 'PROJECT_JOB_NOT_EXISTS'
    | 202011902
    | 'PROJECT_JOB_CREATE_ERROR'
    | 202011903
    | 'PROJECT_JOB_TASK_NOT_EXISTS'
    | 202011904
    | 'PROJECT_JOB_DELETE_ERROR';

  type KusciaGrpcErrorCode = 202011101 | 'RPC_ERROR';

  interface ListDatatableRequest {
    /** How many pieces of data are in each page */
    pageSize?: number;
    /** What page is currently requested? Note that starting at 1 represents the first page */
    pageNumber?: number;
    /** Filter the list by status Available：Datatables that filter available status
Unavailable：Datatables that filter unavailable status Other values or null：All datatables */
    statusFilter?: string;
    /** Fuzzy search by table name */
    datatableNameFilter?: string;
    /** Node Id */
    nodeId?: string;
  }

  interface ListGraphNodeStatusRequest {
    /** Project id */
    projectId?: string;
    /** Graph id */
    graphId?: string;
  }

  interface ListGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
  }

  interface ListNodeResultRequest {
    /** Node id */
    nodeId?: string;
    /** How many pieces of data are in each page */
    pageSize?: number;
    /** What page is currently requested? Note that starting at 1 represents the first page */
    pageNumber?: number;
    /** Rules for filtering by kind, not filled when listing all outputs */
    kindFilters?: Array<string>;
    /** Rules for producer filtering by data vendor, not filled when listing all outputs */
    dataVendorFilter?: string;
    /** Filter by any name, such as table name, project, training stream and so on Note: Because the
current version (20230630) does not use name, the front end is required to fill in domain data
id here Filter by ID */
    nameFilter?: string;
    /** The rules are sorted by time 1. Ascending：ascending 2. Descending：descending */
    timeSortingRule?: string;
  }

  interface ListProjectJobRequest {
    /** What page is currently requested? Note that starting at 1 represents the first page */
    pageNum?: number;
    /** How many pieces of data are in each page */
    pageSize?: number;
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id */
    graphId?: string;
  }

  interface LoginRequest {
    /** User name */
    name?: string;
    /** User password */
    passwordHash?: string;
  }

  interface LogoutRequest {
    /** User name */
    name?: string;
  }

  interface NodeDatatableVO {
    /** Datatable id */
    datatableId?: string;
    /** Datatable name */
    datatableName?: string;
  }

  type NodeErrorCode =
    | 202011401
    | 'NODE_ALREADY_EXIST_ERROR'
    | 202011402
    | 'NODE_CREATE_ERROR'
    | 202011403
    | 'NODE_NOT_EXIST_ERROR'
    | 202011404
    | 'NODE_DELETE_ERROR'
    | 202011405
    | 'DOMAIN_DATA_NOT_EXISTS'
    | 202011406
    | 'NODE_UPDATE_ERROR'
    | 202011407
    | 'NODE_TOKEN_ERROR'
    | 202011408
    | 'NODE_TOKEN_IS_EMPTY_ERROR';

  interface NodeIdRequest {
    /** nodeId */
    nodeId?: string;
  }

  interface NodeInstanceDTO {
    /** 节点名称 */
    name?: string;
    /** 节点状态 可用 Ready, 不可用 NotReady */
    status?: string;
    /** 节点Agent版本 */
    version?: string;
    /** 最后心跳时间，RFC3339格式（e.g. 2006-01-02T15:04:05Z） */
    lastHeartbeatTime?: string;
    /** 最后更新时间，RFC3339格式（e.g. 2006-01-02T15:04:05Z） */
    lastTransitionTime?: string;
  }

  interface NodeResultDetailVO {
    /** Node result list view object */
    nodeResultsVO?: NodeResultsVO;
    /** Graph detail view object */
    graphDetailVO?: GraphDetailVO;
    /** Table column view object list */
    tableColumnVOList?: Array<TableColumnVO>;
    /** Graph node output view object */
    output?: GraphNodeOutputVO;
    datasource?: string;
  }

  interface NodeResultsListVO {
    /** Node results view object */
    nodeResultsVOList?: Array<NodeResultsVO>;
    /** The count of node results */
    totalResultNums?: number;
  }

  interface NodeResultsVO {
    /** Domain data id */
    domainDataId?: string;
    /** Node result name */
    productName?: string;
    /** Node result datatable type */
    datatableType?: string;
    /** Node result source projectId */
    sourceProjectId?: string;
    /** Node result source project name */
    sourceProjectName?: string;
    /** Relative uri */
    relativeUri?: string;
    /** Job id */
    jobId?: string;
    /** The training flow the node result belongs to */
    trainFlow?: string;
    /** Start time of the node result */
    gmtCreate?: string;
  }

  type NodeRouteErrorCode =
    | 202011901
    | 'NODE_ROUTE_ALREADY_EXISTS'
    | 202011902
    | 'NODE_ROUTE_CREATE_ERROR'
    | 202011903
    | 'NODE_ROUTE_NOT_EXIST_ERROR'
    | 202011904
    | 'NODE_ROUTE_DELETE_ERROR'
    | 202011905
    | 'NODE_ROUTE_UPDATE_ERROR';

  interface NodeRouteVO {
    /** The node id of source */
    routeId?: number;
    /** srcNodeId */
    srcNodeId?: string;
    /** dstNodeId */
    dstNodeId?: string;
    /** srcNetAddress */
    srcNetAddress?: string;
    /** dstNetAddress */
    dstNetAddress?: string;
    /** route status Pending, Succeeded, Failed, Unknown */
    status?: string;
  }

  interface NodeRouterVO {
    /** id */
    routeId?: string;
    /** 本方节点id */
    srcNodeId?: string;
    /** 合作方节点id */
    dstNodeId?: string;
    /** 本方节点信息 */
    srcNode?: NodeVO;
    /** 合作方节点 信息 */
    dstNode?: NodeVO;
    /** 本方通讯地址 */
    srcNetAddress?: string;
    /** 合作方通讯地址 */
    dstNetAddress?: string;
    /** 状态 创建中.. Pending, 可用 Succeeded, 不可用 Failed, 未知 Unknown */
    status?: string;
    /** 创建时间 */
    gmtCreate?: string;
    /** 修改时间 */
    gmtModified?: string;
    /** 访问模式： 双向:FullDuplex 单向:HalfDuplex */
    routeType?: string;
  }

  interface NodeTokenRequest {
    /** nodeId */
    nodeId?: string;
  }

  interface NodeTokenVO {
    /** token */
    token?: string;
    /** token 状态 */
    tokenStatus?: string;
    /** 上次过渡时间 */
    lastTransitionTime?: string;
  }

  interface NodeVO {
    /** id */
    nodeId?: string;
    /** nodeName */
    nodeName?: string;
    /** controlNodeId */
    controlNodeId?: string;
    /** description */
    description?: string;
    /** netAddress */
    netAddress?: string;
    /** cert */
    cert?: string;
    /** token */
    token?: string;
    /** tokenStatus used、unused */
    tokenStatus?: string;
    /** nodeRole */
    nodeRole?: string;
    /** nodeStatus Pending, Ready, NotReady, Unknown */
    nodeStatus?: string;
    /** node type embedded */
    type?: string;
    /** gmtCreate */
    gmtCreate?: string;
    /** gmtModified */
    gmtModified?: string;
    /** instance list */
    nodeInstances?: Array<NodeInstanceDTO>;
    /** datatables */
    datatables?: Array<NodeDatatableVO>;
    /** nodeRoutes */
    nodeRoutes?: Array<NodeRouteVO>;
    /** The count of node results. The detailed result information needs to be obtained through the
result management list interface */
    resultCount?: number;
  }

  type OneApiResult_object_ = Record<string, any>;

  type OneApiResult_string_ = Record<string, any>;

  interface PageNodeRequest {
    /** 第几页，从1开始，默认为第1页 */
    page?: number;
    /** 每一页的大小，默认为10 */
    size?: number;
    /** 排序相关的信息，以property,property(,ASC|DESC)的方式组织 "createdDate,desc" */
    sort?: Record<string, any>;
    /** name,nodeId,netAddress search */
    search?: string;
  }

  interface PageNodeRouteRequest {
    /** 第几页，从1开始，默认为第1页 */
    page?: number;
    /** 每一页的大小，默认为10 */
    size?: number;
    /** 排序相关的信息，以property,property(,ASC|DESC)的方式组织 "createdDate,desc" */
    sort?: Record<string, any>;
    /** 节点名称,节点Id,通讯地址 查询 */
    search?: string;
    /** 节点Id */
    nodeId?: string;
  }

  interface PageRequest {
    /** What page is currently requested? Note that starting at 1 represents the first page */
    pageNum?: number;
    /** How many pieces of data are in each page */
    pageSize?: number;
  }

  interface PageResponse {
    /** The total count of page */
    pageTotal?: number;
    /** How many pieces of data are in each page */
    pageSize?: number;
    /** Page data list */
    data?: Array<Record<string, any>>;
  }

  interface PageResponse_ProjectJobSummaryVO_ {
    /** The total count of page */
    pageTotal?: number;
    /** How many pieces of data are in each page */
    pageSize?: number;
    /** Page data list */
    data?: Array<ProjectJobSummaryVO>;
  }

  interface ProjectDatatableBaseVO {
    /** Datatable id */
    datatableId?: string;
    /** Datatable name */
    datatableName?: string;
  }

  type ProjectErrorCode =
    | 202011501
    | 'PROJECT_NOT_EXISTS'
    | 202011502
    | 'PROJECT_INST_NOT_EXISTS'
    | 202011503
    | 'PROJECT_NODE_NOT_EXISTS'
    | 202011504
    | 'PROJECT_DATATABLE_NOT_EXISTS'
    | 202011505
    | 'PROJECT_RESULT_NOT_FOUND'
    | 202011506
    | 'PROJECT_GRAPH_NOT_EMPTY';

  interface ProjectJobBaseVO {
    /** Job id */
    jobId?: string;
    /** Job status */
    status?: GraphJobStatus;
    /** Job error message */
    errMsg?: string;
    /** Job start time */
    gmtCreate?: string;
    /** Job update time */
    gmtModified?: string;
    /** Job finish time */
    gmtFinished?: string;
  }

  interface ProjectJobSummaryVO {
    /** Job id */
    jobId?: string;
    /** Job status */
    status?: GraphJobStatus;
    /** Job error message */
    errMsg?: string;
    /** Job start time */
    gmtCreate?: string;
    /** Job update time */
    gmtModified?: string;
    /** Finish time */
    gmtFinished?: string;
    /** The count of datatable */
    tableCount?: number;
    /** The count of model */
    modelCount?: number;
    /** The count of rule */
    ruleCount?: number;
    /** The count of report */
    reportCount?: number;
    /** The count of completed subtasks */
    finishedTaskCount?: number;
    /** The count of total subtasks */
    taskCount?: number;
  }

  interface ProjectJobVO {
    /** Job id */
    jobId?: string;
    /** Job status */
    status?: GraphJobStatus;
    /** Job error message */
    errMsg?: string;
    /** Job start time */
    gmtCreate?: string;
    /** Job update time */
    gmtModified?: string;
    /** Job finish time */
    gmtFinished?: string;
    /** Check if the job is finished */
    finished?: boolean;
    /** Graph view object */
    graph?: GraphDetailVO;
  }

  interface ProjectNodeVO {
    /** Node id */
    nodeId?: string;
    /** Node name */
    nodeName?: string;
    /** Datatable list of the node, it is empty for list requests */
    datatables?: Array<ProjectDatatableBaseVO>;
  }

  interface ProjectResultBaseVO {
    /** Result kind enum */
    kind?: ResultKind;
    /** Ref id, domain data id in ApiLite */
    refId?: string;
  }

  interface ProjectVO {
    /** Project id */
    projectId?: string;
    /** Project name */
    projectName?: string;
    /** Project description */
    description?: string;
    /** List of added nodes */
    nodes?: Array<ProjectNodeVO>;
    /** The count of graph */
    graphCount?: number;
    /** The count of job */
    jobCount?: number;
    /** Start time of the project */
    gmtCreate?: string;
    /** computeMode pipeline: ,hub: */
    computeMode?: string;
  }

  type ResultKind = 'FedTable' | 'Model' | 'Rule' | 'Report';

  interface RouterIdRequest {
    /** 路由Id */
    routerId?: string;
  }

  interface SecretPadPageRequest {
    /** 第几页，从1开始，默认为第1页 */
    page?: number;
    /** 每一页的大小，默认为10 */
    size?: number;
    /** 排序相关的信息，以property,property(,ASC|DESC)的方式组织 "createdDate,desc" */
    sort?: Record<string, any>;
  }

  interface SecretPadPageResponse {
    /** 列表数据 */
    list?: Array<Record<string, any>>;
    /** 总记录数 */
    total?: number;
  }

  interface SecretPadPageResponse_NodeRouterVO_ {
    /** 列表数据 */
    list?: Array<NodeRouterVO>;
    /** 总记录数 */
    total?: number;
  }

  interface SecretPadPageResponse_NodeVO_ {
    /** 列表数据 */
    list?: Array<NodeVO>;
    /** 总记录数 */
    total?: number;
  }

  interface SecretPadResponse {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Record<string, any>;
  }

  type SecretPadResponseSecretPadResponseStatus = Record<string, any>;

  type SecretPadResponseStatus = Record<string, any>;

  interface SecretPadResponse_CompListVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: CompListVO;
  }

  interface SecretPadResponse_CreateGraphVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: CreateGraphVO;
  }

  interface SecretPadResponse_CreateProjectVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: CreateProjectVO;
  }

  interface SecretPadResponse_DatatableListVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: DatatableListVO;
  }

  interface SecretPadResponse_DatatableVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: DatatableVO;
  }

  interface SecretPadResponse_GraphDetailVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: GraphDetailVO;
  }

  interface SecretPadResponse_GraphNodeOutputVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: GraphNodeOutputVO;
  }

  interface SecretPadResponse_GraphNodeTaskLogsVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: GraphNodeTaskLogsVO;
  }

  interface SecretPadResponse_GraphStatus_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: GraphStatus;
  }

  interface SecretPadResponse_List_DataSourceVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Array<DataSourceVO>;
  }

  interface SecretPadResponse_List_GraphMetaVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Array<GraphMetaVO>;
  }

  interface SecretPadResponse_List_NodeVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Array<NodeVO>;
  }

  interface SecretPadResponse_List_ProjectVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Array<ProjectVO>;
  }

  interface SecretPadResponse_NodeResultDetailVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: NodeResultDetailVO;
  }

  interface SecretPadResponse_NodeResultsListVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: NodeResultsListVO;
  }

  interface SecretPadResponse_NodeRouterVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: NodeRouterVO;
  }

  interface SecretPadResponse_NodeTokenVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: NodeTokenVO;
  }

  interface SecretPadResponse_NodeVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: NodeVO;
  }

  interface SecretPadResponse_Object_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Record<string, any>;
  }

  interface SecretPadResponse_PageResponse_ProjectJobSummaryVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: PageResponse_ProjectJobSummaryVO_;
  }

  interface SecretPadResponse_ProjectJobVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: ProjectJobVO;
  }

  interface SecretPadResponse_ProjectVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: ProjectVO;
  }

  interface SecretPadResponse_SecretPadPageResponse_NodeRouterVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: SecretPadPageResponse_NodeRouterVO_;
  }

  interface SecretPadResponse_SecretPadPageResponse_NodeVO__ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: SecretPadPageResponse_NodeVO_;
  }

  interface SecretPadResponse_StartGraphVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: StartGraphVO;
  }

  interface SecretPadResponse_String_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: string;
  }

  interface SecretPadResponse_UploadDataResultVO_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: UploadDataResultVO;
  }

  interface SecretPadResponse_Void_ {
    status?: SecretPadResponseSecretPadResponseStatus;
    data?: Record<string, any>;
  }

  interface StartGraphRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node id list, it can not be empty */
    nodes?: Array<string>;
  }

  interface StartGraphVO {
    /** Graph job id */
    jobId?: string;
  }

  interface StopGraphNodeRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node id */
    graphNodeId?: string;
  }

  interface StopProjectJobTaskRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Job id, it can not be blank */
    jobId?: string;
  }

  type SystemErrorCode =
    | 202011100
    | 'VALIDATION_ERROR'
    | 202011101
    | 'UNKNOWN_ERROR'
    | 202011102
    | 'OUT_OF_RANGE_ERROR'
    | 202011199
    | 'TODO_ERROR'
    | 202011103
    | 'HTTP_4XX_ERROR'
    | 202011104
    | 'HTTP_404_ERROR'
    | 202011105
    | 'HTTP_5XX_ERROR';

  interface TableColumnConfigParam {
    /** Column name, it can not be blank */
    colName?: string;
    /** Association key or not. False by default */
    isAssociateKey?: boolean;
    /** Group key or not. False by default */
    isGroupKey?: boolean;
    /** Label key or not. False by default */
    isLabelKey?: boolean;
  }

  interface TableColumnVO {
    /** Column name */
    colName?: string;
    /** Column type */
    colType?: string;
    /** Column comment */
    colComment?: string;
  }

  interface UpdateGraphMetaRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** The name of the graph to change */
    name?: string;
  }

  interface UpdateGraphNodeRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Graph id, it can not be blank */
    graphId?: string;
    /** Graph node information, it can not be null */
    node: GraphNodeInfo;
  }

  interface UpdateNodeRequest {
    netAddress?: string;
    nodeId?: string;
  }

  interface UpdateNodeRouterRequest {
    /** 路由id */
    routerId?: string;
    /** 本方通讯地址 */
    srcNetAddress?: string;
    /** 合作方通讯地址 */
    dstNetAddress?: string;
  }

  interface UpdateProjectRequest {
    /** Project id, it can not be blank */
    projectId?: string;
    /** Project name */
    name?: string;
    /** Project description */
    description?: string;
  }

  interface UploadDataResultVO {
    /** File name */
    name?: string;
    /** The real path to store the data, the change value should be returned to the back end during the
create operation */
    realName?: string;
    /** Owning data source */
    datasource?: string;
    /** Data source type */
    datasourceType?: string;
  }
}
