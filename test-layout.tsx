import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutStateProvider, useLayout } from './components/LayoutStateProvider';
import { LayoutState, HighlightStyle } from './types';

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => null);
  Storage.prototype.setItem = jest.fn(() => null);
});

beforeEach(() => {
  (localStorage.getItem as jest.Mock).mockReturnValue(null);
  (localStorage.setItem as jest.Mock).mockClear();
});

// Test component to access layout context
const TestComponent = () => {
  const { 
    dividerPosition, 
    maximizedPane, 
    minimizedPanes, 
    highlightStyle, 
    theme,
    setDividerPosition,
    maximizePane,
    minimizePane,
    restorePane,
    setHighlightStyle,
    toggleTheme
  } = useLayout();

  return (
    <div>
      <div data-testid="divider-position">{dividerPosition}</div>
      <div data-testid="maximized-pane">{maximizedPane}</div>
      <div data-testid="minimized-panes">{minimizedPanes.join(',')}</div>
      <div data-testid="highlight-style-color">{highlightStyle.color}</div>
      <div data-testid="highlight-style-opacity">{highlightStyle.opacity}</div>
      <div data-testid="highlight-style-thickness">{highlightStyle.thickness}</div>
      <div data-testid="theme">{theme}</div>
      <button 
        data-testid="set-divider" 
        onClick={() => setDividerPosition(0.7)}
      >
        Set Divider
      </button>
      <button 
        data-testid="maximize-top" 
        onClick={() => maximizePane('top')}
      >
        Maximize Top
      </button>
      <button 
        data-testid="minimize-right" 
        onClick={() => minimizePane('right')}
      >
        Minimize Right
      </button>
      <button 
        data-testid="restore-right" 
        onClick={() => restorePane('right')}
      >
        Restore Right
      </button>
      <button 
        data-testid="set-highlight-style" 
        onClick={() => setHighlightStyle({ color: '#00ff00', opacity: 0.9 })}
      >
        Set Highlight Style
      </button>
      <button 
        data-testid="toggle-theme" 
        onClick={() => toggleTheme()}
      >
        Toggle Theme
      </button>
    </div>
  );
};

describe('LayoutStateProvider', () => {
  it('should initialize with default state', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    expect(screen.getByTestId('divider-position')).toHaveTextContent('0.5');
    expect(screen.getByTestId('maximized-pane')).toHaveTextContent('none');
    expect(screen.getByTestId('minimized-panes')).toHaveTextContent('');
    expect(screen.getByTestId('highlight-style-color')).toHaveTextContent('#ff0000');
    expect(screen.getByTestId('highlight-style-opacity')).toHaveTextContent('0.7');
    expect(screen.getByTestId('highlight-style-thickness')).toHaveTextContent('2');
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should update divider position', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    fireEvent.click(screen.getByTestId('set-divider'));
    expect(screen.getByTestId('divider-position')).toHaveTextContent('0.7');
  });

  it('should maximize pane', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    fireEvent.click(screen.getByTestId('maximize-top'));
    expect(screen.getByTestId('maximized-pane')).toHaveTextContent('top');
  });

  it('should minimize and restore pane', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    fireEvent.click(screen.getByTestId('minimize-right'));
    expect(screen.getByTestId('minimized-panes')).toHaveTextContent('right');

    fireEvent.click(screen.getByTestId('restore-right'));
    expect(screen.getByTestId('minimized-panes')).toHaveTextContent('');
  });

  it('should set highlight style', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    fireEvent.click(screen.getByTestId('set-highlight-style'));
    expect(screen.getByTestId('highlight-style-color')).toHaveTextContent('#00ff00');
    expect(screen.getByTestId('highlight-style-opacity')).toHaveTextContent('0.9');
    // Thickness should remain unchanged
    expect(screen.getByTestId('highlight-style-thickness')).toHaveTextContent('2');
  });

  it('should toggle theme', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('should persist state to localStorage', () => {
    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    // Perform actions that change state
    fireEvent.click(screen.getByTestId('toggle-theme'));
    fireEvent.click(screen.getByTestId('set-divider'));

    // Check if localStorage.setItem was called with the correct key and data
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'archGraphLayoutState',
      JSON.stringify(expect.objectContaining({
        theme: 'dark',
        dividerPosition: 0.7
      }))
    );
  });

  it('should load state from localStorage', () => {
    // Mock a saved state in localStorage
    const savedState: LayoutState = {
      dividerPosition: 0.3,
      maximizedPane: 'bottom',
      minimizedPanes: ['top'],
      highlightStyle: { color: '#0000ff', opacity: 0.5, thickness: 3 },
      theme: 'dark'
    };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(savedState));

    render(
      <LayoutStateProvider>
        <TestComponent />
      </LayoutStateProvider>
    );

    // Check if the state was loaded from localStorage
    expect(screen.getByTestId('divider-position')).toHaveTextContent('0.3');
    expect(screen.getByTestId('maximized-pane')).toHaveTextContent('bottom');
    expect(screen.getByTestId('minimized-panes')).toHaveTextContent('top');
    expect(screen.getByTestId('highlight-style-color')).toHaveTextContent('#0000ff');
    expect(screen.getByTestId('highlight-style-opacity')).toHaveTextContent('0.5');
    expect(screen.getByTestId('highlight-style-thickness')).toHaveTextContent('3');
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});