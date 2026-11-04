import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

type Props = {
  children: ReactNode;
  label: string;
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[${this.props.label}]`, error.message, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.box}>
        <Text style={styles.title}>{this.props.label} hit an error</Text>
        <Text style={styles.body}>{this.state.error.message}</Text>
        <Pressable onPress={() => this.setState({ error: null })} style={styles.retry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: colors.listBg },
  title: { color: colors.ink, fontWeight: '700', fontSize: type.body, marginBottom: 8 },
  body: { color: colors.muted, fontSize: type.small },
  retry: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.ink, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: colors.card, fontWeight: '700' },
});
