import { VerticalStagePosition } from '@graph-render/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StageNavigationControls } from '../Bracket/StageNavigationControls';

const baseProps = {
  isDarkMode: false,
  activeStageIndex: 1,
  stageCount: 3,
  verticalStagePosition: VerticalStagePosition.Center,
  canPagePlayersVertically: false,
  onPreviousStage: vi.fn(),
  onNextStage: vi.fn(),
  onPagePlayersUp: vi.fn(),
  onPagePlayersDown: vi.fn(),
};

describe('StageNavigationControls', () => {
  it('returns null when stageCount is 1', () => {
    const { container } = render(<StageNavigationControls {...baseProps} stageCount={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when stageCount is 0', () => {
    const { container } = render(<StageNavigationControls {...baseProps} stageCount={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders left and right navigation buttons when stageCount > 1', () => {
    render(<StageNavigationControls {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Go to previous stage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to next stage' })).toBeInTheDocument();
  });

  it('disables the previous button at first stage', () => {
    render(<StageNavigationControls {...baseProps} activeStageIndex={0} />);
    expect(screen.getByRole('button', { name: 'Go to previous stage' })).toBeDisabled();
  });

  it('disables the next button at last stage', () => {
    render(<StageNavigationControls {...baseProps} activeStageIndex={2} />);
    expect(screen.getByRole('button', { name: 'Go to next stage' })).toBeDisabled();
  });

  it('calls onPreviousStage when left button clicked', () => {
    const onPrev = vi.fn();
    render(<StageNavigationControls {...baseProps} onPreviousStage={onPrev} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to previous stage' }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNextStage when right button clicked', () => {
    const onNext = vi.fn();
    render(<StageNavigationControls {...baseProps} onNextStage={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to next stage' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('shows vertical navigation buttons when canPagePlayersVertically is true', () => {
    render(<StageNavigationControls {...baseProps} canPagePlayersVertically />);
    expect(screen.getByRole('button', { name: 'Show upper players' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show lower players' })).toBeInTheDocument();
  });

  it('does not show vertical navigation buttons when canPagePlayersVertically is false', () => {
    render(<StageNavigationControls {...baseProps} canPagePlayersVertically={false} />);
    expect(screen.queryByRole('button', { name: 'Show upper players' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show lower players' })).not.toBeInTheDocument();
  });

  it('enables page-up when verticalStagePosition is Bottom', () => {
    render(
      <StageNavigationControls
        {...baseProps}
        canPagePlayersVertically
        verticalStagePosition={VerticalStagePosition.Bottom}
      />
    );
    expect(screen.getByRole('button', { name: 'Show upper players' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Show lower players' })).toBeDisabled();
  });

  it('enables page-down when verticalStagePosition is Top', () => {
    render(
      <StageNavigationControls
        {...baseProps}
        canPagePlayersVertically
        verticalStagePosition={VerticalStagePosition.Top}
      />
    );
    expect(screen.getByRole('button', { name: 'Show lower players' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Show upper players' })).toBeDisabled();
  });
});
