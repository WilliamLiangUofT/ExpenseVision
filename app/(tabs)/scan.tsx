// app/(tabs)/scan.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ScanScreen() {
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('03/07/2026');
  const [category, setCategory] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  const [tax, setTax] = useState('0.00');
  const [total, setTotal] = useState('0.00');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoEmoji}>💰</Text>
              </View>
              <Text style={styles.logoText}>ExpenseVision</Text>
            </View>
            <Ionicons name="arrow-forward" size={22} color="#6b7280" />
          </View>

          <Text style={styles.screenTitle}>Scan Receipt</Text>
          <Text style={styles.screenSubtitle}>
            Capture a photo, upload, or enter details manually.
          </Text>

          {/* Capture Receipt card */}
          <View style={styles.statCard}>
            <View style={styles.labelRow}>
              <Feather name="camera" size={18} color="#6b7280" />
              <Text style={styles.cardLabel}>Capture Receipt</Text>
            </View>

            <View style={styles.captureRow}>
              <Pressable
                style={({ pressed }) => [styles.captureOption, styles.captureOptionActive, pressed && styles.pressed]}
                onPress={() => {}}
              >
                <Feather name="camera" size={40} color="#a020f0" />
                <Text style={styles.captureTitle}>Take Photo</Text>
                <Text style={styles.captureSubtext}>Open camera to capture receipt</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.captureOption, pressed && styles.pressed]}
                onPress={() => {}}
              >
                <Feather name="upload" size={40} color="#9ca3af" />
                <Text style={styles.captureTitle}>Upload Photo</Text>
                <Text style={styles.captureSubtext}>Choose from your device</Text>
              </Pressable>
            </View>
          </View>

          {/* Manual Entry card – form with Add Receipt at the end */}
          <View style={[styles.statCard, styles.manualCard]}>
            <View style={styles.labelRow}>
              <View style={styles.manualIcon}>
                <Ionicons name="add" size={18} color="#6b7280" />
              </View>
              <Text style={styles.cardLabel}>Manual Entry</Text>
            </View>

            <Text style={styles.inputLabel}>Merchant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Starbucks"
              placeholderTextColor="#9ca3af"
              value={merchant}
              onChangeText={setMerchant}
            />

            <Text style={styles.inputLabel}>Date *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={date}
                onChangeText={setDate}
              />
              <Feather name="calendar" size={20} color="#6b7280" style={styles.inputIcon} />
            </View>

            <Text style={styles.inputLabel}>Category *</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Select category"
                placeholderTextColor="#9ca3af"
                value={category}
                onChangeText={setCategory}
              />
              <Feather name="chevron-down" size={20} color="#6b7280" style={styles.inputIcon} />
            </View>

            <View style={styles.twoColRow}>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>Subtotal</Text>
                <TextInput
                  style={styles.input}
                  value={subtotal}
                  onChangeText={setSubtotal}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.inputLabel}>Tax</Text>
                <TextInput
                  style={styles.input}
                  value={tax}
                  onChangeText={setTax}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Total Amount *</Text>
            <TextInput
              style={styles.input}
              value={total}
              onChangeText={setTotal}
              keyboardType="decimal-pad"
            />

            <Pressable
              style={({ pressed }) => [pressed && styles.pressed]}
              onPress={() => {}}
            >
              <LinearGradient
                colors={['#8b5cf6', '#ec4899', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Add Receipt</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  captureRow: {
    flexDirection: 'column',
    gap: 12,
  },
  captureOption: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  captureOptionActive: {
    borderColor: '#a020f0',
  },
  captureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  captureSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  manualCard: {
    marginBottom: 0,
  },
  manualIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    marginRight: 12,
  },
  inputIcon: {
    marginLeft: 8,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  addButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
  },
});
