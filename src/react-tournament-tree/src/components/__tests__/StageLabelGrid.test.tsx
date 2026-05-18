import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StageLabelGrid } from '../Bracket/stage-labels/StageLabelGrid';
import { renderWithAppearance } from './testUtils';

describe('StageLabelGrid', () => {
  it('renders all stage labels', () => {
    renderWithAppearance(
      <StageLabelGrid labels={['Round of 16', 'Quarterfinals', 'Semifinals']} isDarkMode={false} />
    );
    expect(screen.getByText('Round of 16')).toBeInTheDocument();
    expect(screen.getByText('Quarterfinals')).toBeInTheDocument();
    expect(screen.getByText('Semifinals')).toBeInTheDocument();
  });

  it('renders nothing visible when labels is empty', () => {
    renderWithAppearance(<StageLabelGrid labels={[]} isDarkMode={false} />);
    // Grid container exists but has no child cells
    expect(screen.queryAllByTestId('stage-label-cell')).toHaveLength(0);
  });

  it('renders a single label correctly', () => {
    renderWithAppearance(<StageLabelGrid labels={['Final']} isDarkMode={false} />);
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('works in dark mode without crashing', () => {
    renderWithAppearance(<StageLabelGrid labels={['QF', 'SF']} isDarkMode />);
    expect(screen.getByText('QF')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument();
  });
});
