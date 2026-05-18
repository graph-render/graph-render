import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StageLabelBar } from '../Bracket/StageLabelBar';
import { renderWithAppearance } from './testUtils';

const baseProps = {
  stageLabels: ['Round of 16', 'Quarterfinals', 'Semifinals'],
  isDarkMode: false,
  isNavigationMode: false,
  activeStageIndex: 1,
  canGoPrev: true,
  canGoNext: true,
  onPreviousStage: vi.fn(),
  onNextStage: vi.fn(),
};

describe('StageLabelBar', () => {
  it('returns null when stageLabels is empty', () => {
    const { container } = renderWithAppearance(<StageLabelBar {...baseProps} stageLabels={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all labels in grid mode (non-navigation)', () => {
    renderWithAppearance(<StageLabelBar {...baseProps} />);
    expect(screen.getByText('Round of 16')).toBeInTheDocument();
    expect(screen.getByText('Quarterfinals')).toBeInTheDocument();
    expect(screen.getByText('Semifinals')).toBeInTheDocument();
  });

  it('renders active label and counter in navigation mode', () => {
    renderWithAppearance(<StageLabelBar {...baseProps} isNavigationMode />);
    // Active stage label shown as a pill
    expect(screen.getByText('Quarterfinals')).toBeInTheDocument();
    // Counter: 2/3
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('renders Previous/Next buttons in navigation mode', () => {
    renderWithAppearance(<StageLabelBar {...baseProps} isNavigationMode />);
    expect(screen.getByRole('button', { name: 'Previous stage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeInTheDocument();
  });

  it('calls onPreviousStage when Previous button clicked', () => {
    const onPrev = vi.fn();
    renderWithAppearance(
      <StageLabelBar {...baseProps} isNavigationMode onPreviousStage={onPrev} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Previous stage' }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNextStage when Next button clicked', () => {
    const onNext = vi.fn();
    renderWithAppearance(<StageLabelBar {...baseProps} isNavigationMode onNextStage={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next stage' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables Previous button when canGoPrev is false', () => {
    renderWithAppearance(<StageLabelBar {...baseProps} isNavigationMode canGoPrev={false} />);
    expect(screen.getByRole('button', { name: 'Previous stage' })).toBeDisabled();
  });

  it('disables Next button when canGoNext is false', () => {
    renderWithAppearance(<StageLabelBar {...baseProps} isNavigationMode canGoNext={false} />);
    expect(screen.getByRole('button', { name: 'Next stage' })).toBeDisabled();
  });
});
