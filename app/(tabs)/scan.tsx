// app/(tabs)/scan.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { extractReceipt, saveReceipt, type ReceiptExtracted } from '../../lib/api';

export default function ScanScreen() {
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('03/07/2026');
  const [category, setCategory] = useState('');
  const [subtotal, setSubtotal] = useState('0.00');
  const [tax, setTax] = useState('0.00');
  const [total, setTotal] = useState('0.00');

  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [extracted, setExtracted] = useState<ReceiptExtracted | null>(null);

  const pickImageAndExtract = useCallback(async (useCamera: boolean) => {
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take a photo.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library access is required to upload.');
        return;
      }
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setExtracting(true);
    try {
      const data = await extractReceipt(uri, mimeType);
      setExtracted(data);
      setReviewModalVisible(true);
    } catch (err: any) {
      const message = err.response?.data?.detail ?? err.message ?? 'Extract failed';
      Alert.alert('Extract failed', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setExtracting(false);
    }
  }, []);

  const handleApprove = useCallback(async () => {
    if (!extracted) return;
    setSaving(true);
    try {
      await saveReceipt(extracted);
      setReviewModalVisible(false);
      setExtracted(null);
      Alert.alert('Saved', 'Receipt saved successfully.');
    } catch (err: any) {
      const message = err.response?.data?.detail ?? err.message ?? 'Save failed';
      Alert.alert('Save failed', typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSaving(false);
    }
  }, [extracted]);

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
                onPress={() => pickImageAndExtract(true)}
                disabled={extracting}
              >
                {extracting ? (
                  <ActivityIndicator size="large" color="#a020f0" style={styles.captureLoader} />
                ) : (
                  <Feather name="camera" size={40} color="#a020f0" />
                )}
                <Text style={styles.captureTitle}>Take Photo</Text>
                <Text style={styles.captureSubtext}>
                  {extracting ? 'Extracting…' : 'Open camera to capture receipt'}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.captureOption, pressed && styles.pressed]}
                onPress={() => pickImageAndExtract(false)}
                disabled={extracting}
              >
                <Feather name="upload" size={40} color="#9ca3af" />
                <Text style={styles.captureTitle}>Upload Photo</Text>
                <Text style={styles.captureSubtext}>Choose from your device</Text>
              </Pressable>
            </View>
          </View>

          {/* Review extracted receipt modal */}
          <Modal
            visible={reviewModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setReviewModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setReviewModalVisible(false)}>
              <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.modalTitle}>Review receipt</Text>
                <Text style={styles.modalSubtitle}>Confirm and save to database</Text>
                {extracted && (
                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Merchant</Text>
                      <Text style={styles.reviewValue}>{extracted.merchant ?? '—'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Date</Text>
                      <Text style={styles.reviewValue}>{extracted.date_of_transaction ?? '—'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Category</Text>
                      <Text style={styles.reviewValue}>{extracted.category ?? '—'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Subtotal</Text>
                      <Text style={styles.reviewValue}>{extracted.subtotal ?? '—'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Tax</Text>
                      <Text style={styles.reviewValue}>{extracted.tax ?? '—'}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>Total</Text>
                      <Text style={styles.reviewValue}>{extracted.total ?? '—'}</Text>
                    </View>
                    {extracted.items_purchased?.length > 0 && (
                      <View style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>Items</Text>
                        <Text style={styles.reviewValue}>
                          {extracted.items_purchased.map((i) => i.name).join(', ')}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setReviewModalVisible(false)}
                    disabled={saving}
                  >
                    <Text style={styles.modalButtonCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonApprove]}
                    onPress={handleApprove}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonApproveText}>Approve & Save</Text>
                    )}
                  </Pressable>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

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
  captureLoader: {
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 240,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 80,
  },
  reviewValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalButtonApprove: {
    backgroundColor: '#a020f0',
  },
  modalButtonApproveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
