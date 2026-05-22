import { buildEdgePath } from '@graph-render/core';
import { EdgeType } from '@graph-render/types';
import type { EdgePathProps } from '@graph-render/types/react';
import React, { useCallback, useState } from 'react';

// Memoised so that unchanged edges are skipped during re-renders of the parent
// Graph component (e.g. when hover/selection state changes for a different edge).
// The caller is responsible for keeping callback props (onHoverChange, onClick)
// referentially stable via useCallback to benefit fully from the bailout.
export const EdgePath = React.memo(function EdgePath({
  edge,
  color,
  width,
  curveEdges,
  curveStrength,
  markerEnd,
  isHovered,
  isSelected,
  hoverColor,
  selectionColor,
  labelColor,
  selectionMarker,
  hoverMarker,
  hoverEnabled,
  selectionEnabled,
  hoverStrokeWidth,
  selectedStrokeWidth,
  hitStrokeWidth,
  onHoverChange,
  onClick,
}: EdgePathProps) {
  const [isFocused, setIsFocused] = useState(false);
  const handleMouseEnter = useCallback(() => {
    if (hoverEnabled) onHoverChange?.(true);
  }, [hoverEnabled, onHoverChange]);
  const handleMouseLeave = useCallback(() => {
    if (hoverEnabled) onHoverChange?.(false);
  }, [hoverEnabled, onHoverChange]);
  const d = buildEdgePath(edge, curveEdges, curveStrength);
  if (!d) return null;

  const strokeColor = isHovered ? hoverColor : isSelected ? (selectionColor ?? hoverColor) : color;
  const strokeWidth = isHovered
    ? (hoverStrokeWidth ?? width)
    : isSelected
      ? (selectedStrokeWidth ?? width + 1)
      : width;
  const resolvedMarker = isHovered
    ? (hoverMarker ?? selectionMarker ?? markerEnd)
    : isSelected
      ? (selectionMarker ?? markerEnd)
      : markerEnd;
  const label = edge.label != null && edge.labelPosition ? String(edge.label) : null;

  return (
    <>
      <path
        d={d}
        stroke="transparent"
        strokeWidth={hitStrokeWidth ?? width + 8}
        fill="none"
        pointerEvents="stroke"
        data-graph-edge-interactive={onClick ? 'true' : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={
          onClick ? (edge.label != null ? `Edge: ${String(edge.label)}` : 'Graph edge') : undefined
        }
        aria-pressed={onClick && selectionEnabled ? isSelected : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      />
      {isFocused ? (
        <path
          d={d}
          stroke={selectionColor ?? hoverColor}
          strokeWidth={strokeWidth + 5}
          strokeOpacity={0.35}
          fill="none"
          pointerEvents="none"
        />
      ) : null}
      <path
        d={d}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        markerEnd={edge.type === EdgeType.Directed ? resolvedMarker : undefined}
        pointerEvents="none"
      />
      {label && edge.labelPosition ? (
        <text
          x={edge.labelPosition.x}
          y={edge.labelPosition.y - 6}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={labelColor ?? '#334155'}
          pointerEvents="none"
        >
          {label}
        </text>
      ) : null}
    </>
  );
});
