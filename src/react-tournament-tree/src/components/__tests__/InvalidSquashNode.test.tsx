import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InvalidSquashNode } from '../SquashNode/InvalidSquashNode';

describe('InvalidSquashNode — SVG mode', () => {
  const svgModes = [
    SquashNodeRenderMode.Svg,
    SquashNodeRenderMode.Export,
    SquashNodeRenderMode.Server,
  ] as const;

  for (const mode of svgModes) {
    it(`renders SVG elements in renderMode=${mode}`, () => {
      render(
        <svg>
          <InvalidSquashNode width={280} height={100} renderMode={mode} nodeId="test-node-id" />
        </svg>
      );
      // Should have a <rect> and two <text> elements
      expect(screen.getByTestId('invalid-node-svg-rect')).toBeInTheDocument();
      expect(screen.getByText('Invalid match data')).toBeInTheDocument();
      expect(screen.getByText('test-node-id')).toBeInTheDocument();
    });

    it(`shows "Invalid match data" text in SVG mode=${mode}`, () => {
      render(
        <svg>
          <InvalidSquashNode width={280} height={100} renderMode={mode} nodeId="test-node" />
        </svg>
      );
      expect(screen.getByText('Invalid match data')).toBeInTheDocument();
    });

    it(`shows truncated nodeId in SVG mode=${mode}`, () => {
      render(
        <svg>
          <InvalidSquashNode width={280} height={100} renderMode={mode} nodeId="short-id" />
        </svg>
      );
      expect(screen.getByText('short-id')).toBeInTheDocument();
    });
  }
});

describe('InvalidSquashNode — HTML mode', () => {
  it('renders a foreignObject in Html mode', () => {
    render(
      <svg>
        <InvalidSquashNode
          width={280}
          height={100}
          renderMode={SquashNodeRenderMode.Html}
          nodeId="html-node"
        />
      </svg>
    );
    expect(screen.getByTestId('invalid-node-html')).toBeInTheDocument();
  });

  it('shows "Invalid match data" in Html mode', () => {
    render(
      <svg>
        <InvalidSquashNode
          width={280}
          height={100}
          renderMode={SquashNodeRenderMode.Html}
          nodeId="html-node"
        />
      </svg>
    );
    expect(screen.getByText('Invalid match data')).toBeInTheDocument();
  });

  it('shows truncated nodeId in Html mode', () => {
    render(
      <svg>
        <InvalidSquashNode
          width={280}
          height={100}
          renderMode={SquashNodeRenderMode.Html}
          nodeId="my-node-id"
        />
      </svg>
    );
    expect(screen.getByText('my-node-id')).toBeInTheDocument();
  });
});
