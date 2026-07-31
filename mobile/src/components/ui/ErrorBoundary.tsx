import type {ReactNode} from 'react';
import {Component} from 'react';
import {Text, View} from 'react-native';
import {Button} from './Button';

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {error: null};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  private handleReset = () => {
    this.setState({error: null});
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Text className="text-heading font-display text-text mb-2 text-center">
            {this.props.title ?? 'Something went wrong'}
          </Text>
          <Text className="text-body text-muted text-center leading-6 mb-6">
            {this.state.error.message || 'An unexpected error occurred.'}
          </Text>
          <Button label="Try again" variant="secondary" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}
