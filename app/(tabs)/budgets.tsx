import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Category = {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  percent: string;
  spent: number;
};

const initialCategories: Category[] = [
  { name: 'Groceries', icon: 'cart-outline', percent: '20', spent: 220 },
  { name: 'Dining', icon: 'food-outline', percent: '10', spent: 160 },
  { name: 'Transportation', icon: 'car-outline', percent: '10', spent: 90 },
  { name: 'Shopping', icon: 'shopping-outline', percent: '15', spent: 140 },
  {
    name: 'Entertainment',
    icon: 'movie-open-outline',
    percent: '10',
    spent: 75,
  },
  { name: 'Travel', icon: 'airplane', percent: '10', spent: 40 },
  { name: 'Utilities', icon: 'flash-outline', percent: '15', spent: 180 },
  { name: 'Other', icon: 'apps', percent: '10', spent: 60 },
];

export default function BudgetScreen() {
  // actual budget that the app uses
  const [totalBudget, setTotalBudget] = useState('2000');
  const [savedCategories, setSavedCategories] =
    useState<Category[]>(initialCategories);

  const [modalVisible, setModalVisible] = useState(false);

  //   draft state budget that user edits inside the "edit" button
  const [draftBudget, setDraftBudget] = useState(totalBudget);
  const [draftCategories, setDraftCategories] =
    useState<Category[]>(savedCategories);

  const parsedTotalBudget = parseFloat(totalBudget) || 0;

  //  spent
  const totalSpent = useMemo(() => {
    return savedCategories.reduce((sum, cat) => sum + cat.spent, 0);
  }, [savedCategories]);

  const totalAllocated = parsedTotalBudget;

  //   remaining
  const totalRemaining = Math.max(totalAllocated - totalSpent, 0);
  const overallPercent =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // copy real budget into the draft
  // copy real categories into draft categories
  // show the modal so that budget editing popup appears
  const openManageModal = () => {
    setDraftBudget(totalBudget);
    setDraftCategories(savedCategories.map((cat) => ({ ...cat })));
    setModalVisible(true);
  };

  //   when user enters a percantage input it updates draft categories
  const updateDraftPercent = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const updated = [...draftCategories];
    updated[index].percent = cleaned;
    setDraftCategories(updated);
  };

  // calculates total % allocated to ensure that it does not exceed 100%
  const draftTotalPercent = useMemo(() => {
    return draftCategories.reduce(
      (sum, cat) => sum + (parseFloat(cat.percent) || 0),
      0,
    );
  }, [draftCategories]);

  const draftBudgetNumber = parseFloat(draftBudget) || 0;

  const getAllocatedAmount = (percent: string, budget: number) => {
    return ((parseFloat(percent) || 0) / 100) * budget;
  };

  //   avoids invalid budgets
  const canSave = draftBudgetNumber > 0 && draftTotalPercent <= 100;

  const handleSave = () => {
    if (!canSave) return;
    setTotalBudget(draftBudget);
    setSavedCategories(draftCategories);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Budget</Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={openManageModal}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Monthly Budget</Text>
          <Text style={styles.heroAmount}>${parsedTotalBudget.toFixed(0)}</Text>

          <View style={styles.heroProgressTrack}>
            <View
              style={[
                styles.heroProgressFill,
                { width: `${Math.min(overallPercent, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.heroStatsRow}>
            <View>
              <Text style={styles.heroStatLabel}>Spent</Text>
              <Text style={styles.heroStatValue}>${totalSpent.toFixed(0)}</Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Remaining</Text>
              <Text style={styles.heroStatValue}>
                ${totalRemaining.toFixed(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Used</Text>
              <Text style={styles.heroStatValue}>{overallPercent}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>

          {savedCategories.map((cat) => {
            const allocated = getAllocatedAmount(
              cat.percent,
              parsedTotalBudget,
            );
            const remaining = allocated - cat.spent;
            const percentUsed =
              allocated > 0 ? Math.round((cat.spent / allocated) * 100) : 0;
            const overBudget = cat.spent > allocated;

            return (
              <View key={cat.name} style={styles.categoryCard}>
                <View style={styles.categoryTopRow}>
                  <View style={styles.categoryLeft}>
                    <View style={styles.categoryIcon}>
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={18}
                        color="#8b5cf6"
                      />
                    </View>
                    <View>
                      <Text style={styles.categoryTitle}>{cat.name}</Text>
                      <Text style={styles.categorySubtitle}>
                        {cat.percent}% of total budget
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.categoryPercent}>{percentUsed}%</Text>
                </View>

                <View style={styles.categoryProgressTrack}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${Math.min(percentUsed, 100)}%`,
                        backgroundColor: overBudget ? '#ef4444' : '#8b5cf6',
                      },
                    ]}
                  />
                </View>

                <View style={styles.categoryBottomRow}>
                  <Text style={styles.categoryMeta}>
                    ${cat.spent.toFixed(0)} / ${allocated.toFixed(0)}
                  </Text>
                  <Text
                    style={[
                      styles.categoryMeta,
                      overBudget ? styles.overBudgetText : styles.remainingText,
                    ]}
                  >
                    {overBudget
                      ? `Over by $${Math.abs(remaining).toFixed(0)}`
                      : `$${remaining.toFixed(0)} left`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manage Budget</Text>

            <Text style={styles.inputLabel}>Total Monthly Budget</Text>
            <TextInput
              value={draftBudget}
              onChangeText={(text) =>
                setDraftBudget(text.replace(/[^0-9.]/g, ''))
              }
              keyboardType="numeric"
              placeholder="Enter total budget"
              placeholderTextColor="#9ca3af"
              style={styles.mainInput}
            />

            <Text style={styles.inputLabel}>Category Allocation</Text>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {draftCategories.map((cat, index) => {
                const allocated = getAllocatedAmount(
                  cat.percent,
                  draftBudgetNumber,
                );

                return (
                  <View key={cat.name} style={styles.inputRow}>
                    <View style={styles.inputRowLeft}>
                      <View style={styles.categoryIcon}>
                        <MaterialCommunityIcons
                          name={cat.icon}
                          size={18}
                          color="#8b5cf6"
                        />
                      </View>
                      <View>
                        <Text style={styles.modalCategoryTitle}>
                          {cat.name}
                        </Text>
                        <Text style={styles.modalCategoryAmount}>
                          ${allocated.toFixed(0)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.percentInputWrap}>
                      <TextInput
                        value={cat.percent}
                        onChangeText={(value) =>
                          updateDraftPercent(index, value)
                        }
                        keyboardType="numeric"
                        style={styles.percentInput}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.percentSign}>%</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                Allocated: {draftTotalPercent.toFixed(0)}%
              </Text>
              {draftTotalPercent < 100 && (
                <Text style={styles.remainingText}>
                  {`${(100 - draftTotalPercent).toFixed(0)}% remaining`}
                </Text>
              )}
              {draftTotalPercent > 100 && (
                <Text style={styles.overBudgetText}>
                  {`Over by ${(draftTotalPercent - 100).toFixed(0)}%`}
                </Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, !canSave && styles.disabledButton]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const BG = '#f8fafc';
const CARD = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const MUTED = '#6b7280';
const PURPLE = '#8b5cf6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: TEXT,
  },
  manageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  manageButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: TEXT,
    marginTop: 6,
    marginBottom: 14,
  },
  heroProgressTrack: {
    height: 12,
    backgroundColor: '#ede9fe',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 999,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
  },
  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
  },
  categoryCard: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },
  categorySubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: MUTED,
  },
  categoryPercent: {
    fontSize: 15,
    fontWeight: '800',
    color: PURPLE,
    marginLeft: 10,
  },
  categoryProgressTrack: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 12,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  categoryBottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryMeta: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '600',
  },
  remainingText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  overBudgetText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  mainInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT,
    marginBottom: 18,
  },
  modalScroll: {
    maxHeight: 360,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalCategoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },
  modalCategoryAmount: {
    marginTop: 2,
    fontSize: 13,
    color: MUTED,
  },
  percentInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  percentInput: {
    minWidth: 40,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  percentSign: {
    fontSize: 16,
    fontWeight: '700',
    color: MUTED,
    marginLeft: 4,
  },
  summaryBox: {
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
