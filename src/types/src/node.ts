export type NodeId = string;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * Tree-shakeable alternative available as `NodeSizingModeValues`/`NodeSizingModeValue`.
 * Prefer those for new code — plain string literals are assignable to `NodeSizingModeValue`.
 */
export enum NodeSizingMode {
  Fixed = 'fixed',
  Label = 'label',
  Measured = 'measured',
}

export const NodeSizingModeValues = {
  Fixed: 'fixed',
  Label: 'label',
  Measured: 'measured',
} as const;
export type NodeSizingModeValue = (typeof NodeSizingModeValues)[keyof typeof NodeSizingModeValues];

export interface NodeMeasurementHints {
  readonly label?: string | undefined;
  readonly paddingX?: number | undefined;
  readonly paddingY?: number | undefined;
  readonly estimatedCharWidth?: number | undefined;
  readonly lineHeight?: number | undefined;
}

export interface NodeData<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> {
  readonly id: NodeId;
  readonly label?: TLabel | undefined;
  readonly position?: Point | undefined;
  readonly size?: Size | undefined;
  readonly measuredSize?: Size | undefined;
  readonly sizeMode?: NodeSizingMode | undefined;
  readonly measurementHints?: NodeMeasurementHints | undefined;
  readonly data?: TData | undefined;
  readonly meta?: TMeta | undefined;
}

export interface PositionedNode<
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
> extends NodeData<TData, TMeta, TLabel> {
  readonly position: Point;
}

/**
 * Type-safe factory that merges a `NodeData` with an explicit `position`,
 * producing a `PositionedNode` without unsafe `as` casts.
 */
export const makePositionedNode = <
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
>(
  node: NodeData<TData, TMeta, TLabel>,
  position: Point
): PositionedNode<TData, TMeta, TLabel> => ({ ...node, position });

/** Type guard: returns true when the node's `position` field is already set. */
export const isPositionedNode = <
  TData = unknown,
  TMeta extends object = Record<string, unknown>,
  TLabel = unknown,
>(
  node: NodeData<TData, TMeta, TLabel>
): node is PositionedNode<TData, TMeta, TLabel> => node.position !== undefined;
