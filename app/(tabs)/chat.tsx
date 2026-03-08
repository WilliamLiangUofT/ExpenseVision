// app/(tabs)/chat.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { chat as chatApi } from '../../lib/api';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'Tips for reducing subscriptions',
  'Budget advice',
  'How to save on groceries',
  'Best ways to track expenses',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your AI spending assistant. I can help you understand your spending habits, find ways to save money, and manage your budget better. What would you like to know?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput('');
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setLoading(true);
      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: formatTime() },
      ]);

      try {
        const { response } = await chatApi(trimmed);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: response } : m))
        );
      } catch (err: any) {
        const msg =
          err.response?.data?.detail ?? err.message ?? 'Failed to get response from AI.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `Sorry, an error occurred: ${msg}` } : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleSuggestion = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isUser = item.role === 'user';
      return (
        <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
          {!isUser && (
            <View style={styles.avatar}>
              <Feather name="cpu" size={18} color="white" />
            </View>
          )}
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
            {item.content ? (
              <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                {item.content}
              </Text>
            ) : loading && item.id.startsWith('a-') ? (
              <ActivityIndicator size="small" color="#a020f0" />
            ) : null}
            <Text style={[styles.timestamp, isUser && styles.timestampUser]}>{item.timestamp}</Text>
          </View>
        </View>
      );
    },
    [loading]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.topBar}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoEmoji}>💰</Text>
              </View>
              <Text style={styles.logoText}>ExpenseVision</Text>
            </View>
            <Ionicons name="open-outline" size={22} color="#6b7280" />
          </View>

          <View style={styles.chipRow}>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => handleSuggestion(prompt)}
                disabled={loading}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your spending"
            placeholderTextColor="#9ca3af"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!loading}
            onSubmitEditing={() => handleSend()}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              loading && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={loading}
          >
            <Ionicons name="send" size={20} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#f8f1f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#d946ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoEmoji: {
    fontSize: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#c026d3',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chipPressed: {
    opacity: 0.8,
    backgroundColor: '#f3e8ff',
    borderColor: '#c084fc',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a020f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: '#a020f0',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#111827',
  },
  bubbleTextUser: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 6,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 20,
    backgroundColor: '#f8f1f5',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#a020f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
