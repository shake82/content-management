import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface BoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface BoundaryState {
  error?: Error;
}

class RouteErrorBoundaryInner extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = {};

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { error: error instanceof Error ? error : new Error('Unexpected route error') };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route rendering failed', error, errorInfo);
  }

  componentDidUpdate(previousProps: BoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: undefined });
    }
  }

  retry = () => this.setState({ error: undefined });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Alert icon={<IconAlertTriangle size={18} />} color="red" title="Unable to display this page">
        <Text size="sm">{this.state.error.message || 'An unexpected error occurred.'}</Text>
        <Group mt="sm">
          <Button size="xs" variant="light" leftSection={<IconRefresh size={15} />} onClick={this.retry}>
            Try again
          </Button>
        </Group>
      </Alert>
    );
  }
}

export function RouteErrorBoundary({ children }: BoundaryProps) {
  const { pathname, search } = useLocation();
  return (
    <RouteErrorBoundaryInner resetKey={`${pathname}${search}`}>
      {children}
    </RouteErrorBoundaryInner>
  );
}
