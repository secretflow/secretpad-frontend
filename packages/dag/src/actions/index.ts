import { AddEdgeAction } from './add-edge';
import { AddNodeAction } from './add-node';
import { CenterNodeAction } from './center-node';
import { ChangeStatusAction } from './change-status';
import { ChangeStylesAction } from './change-style';
import { ClearStatusAction } from './clear-status';
import { CopyAction, copyActionHotKey } from './copy';
import { DragNodeAction } from './drag-node';
import { MoveNodeAction } from './move-node';
import { PasteAction, pasteActionHotKey } from './paste';
import type { DAGProtocol } from './protocol';
import type { ActionFactory } from './protocol';
import { QueryStatusAction } from './query-status';
import { RemoveCellAction, removeCellActionHotKey } from './remove-cell';
import { RenderAction } from './render';
import { RunAllAction } from './run-all';
import { RunDownAction, runDownActionHotKey } from './run-down';
import { RunSingleAction, runSingleActionHotKey } from './run-single';
import { RunUpAction, runUpActionHotKey } from './run-up';
import { SelectNodeAction } from './select-node';
import { ShowResultAction } from './show-result';
import { StopAllAction } from './stop-all';
import { StopRunAction } from './stop-run';
import { ContinueRunAction } from './continue-run';
import { TidyLayoutAction, tidyLayoutActionHotKey } from './tidy-layout';
import { ToggleSelectionAction, toggleSelectionActionHotKey } from './toggle-selection';
import { ChangeNodeDataAction } from './update-node-data';
import { ZoomInAction, zoomInActionHotKey } from './zoom-in';
import { ZoomOutAction, zoomOutActionHotKey } from './zoom-out';
import { ZoomToAction } from './zoom-to';
import { ZoomToFitAction, zoomToFitActionHotKey } from './zoom-to-fit';
import { ZoomToOriginAction, zoomToOriginActionHotKey } from './zoom-to-origin';

export * from './protocol';

export const Actions = [
  AddEdgeAction,
  AddNodeAction,
  ClearStatusAction,
  CopyAction,
  DragNodeAction,
  MoveNodeAction,
  PasteAction,
  QueryStatusAction,
  RemoveCellAction,
  RenderAction,
  RunAllAction,
  RunDownAction,
  RunSingleAction,
  RunUpAction,
  StopRunAction,
  ContinueRunAction,
  ZoomInAction,
  ZoomOutAction,
  SelectNodeAction,
  ZoomToFitAction,
  ZoomToOriginAction,
  CenterNodeAction,
  ToggleSelectionAction,
  ZoomToAction,
  ShowResultAction,
  ChangeStylesAction,
  StopAllAction,
  TidyLayoutAction,
  ChangeNodeDataAction,
  ChangeStatusAction,
];

export const HotKeys = {
  copyActionHotKey,
  pasteActionHotKey,
  removeCellActionHotKey,
  runDownActionHotKey,
  runSingleActionHotKey,
  runUpActionHotKey,
  toggleSelectionActionHotKey,
  zoomInActionHotKey,
  zoomOutActionHotKey,
  zoomToFitActionHotKey,
  zoomToOriginActionHotKey,
  tidyLayoutActionHotKey,
};

export function createAction(action: ActionFactory, context: DAGProtocol) {
  return new action(context);
}
