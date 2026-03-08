import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
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

type BudgetComparisonCategory = {
  category: string;
  percent: number;
  allocated_amount: number;
  spent: number;
  remaining: number;
};

type BudgetComparisonResponse = {
  id: number;
  month: string;
  total_budget: number;
  total_spent: number;
  categories: BudgetComparisonCategory[];
};

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://127.0.0.1:8000';
const BASE_URL = `${API_BASE}/api`;

const CATEGORY_ICONS: Record<
  string,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  Groceries: 'cart-outline',
  Dining: 'food-outline',
  Transportation: 'car-outline',
  Shopping: 'shopping-outline',
  Entertainment: 'movie-open-outline',
  Travel: 'airplane',
  Utilities: 'flash-outline',
  Other: 'apps',
};

const EMPTY_CATEGORIES: Category[] = [
  { name: 'Groceries', icon: 'cart-outline', percent: '0', spent: 0 },
  { name: 'Dining', icon: 'food-outline', percent: '0', spent: 0 },
  { name: 'Transportation', icon: 'car-outline', percent: '0', spent: 0 },
  { name: 'Shopping', icon: 'shopping-outline', percent: '0', spent: 0 },
  {
    name: 'Entertainment',
    icon: 'movie-open-outline',
    percent: '0',
    spent: 0,
  },
  { name: 'Travel', icon: 'airplane', percent: '0', spent: 0 },
  { name: 'Utilities', icon: 'flash-outline', percent: '0', spent: 0 },
  { name: 'Other', icon: 'apps', percent: '0', spent: 0 },
];

const normalizeCategory = (value: string) => value.trim().toLowerCase();
export default function BudgetScreen() {
  const [budgetId, setBudgetId] = useState<number | null>(null);
  const [totalBudget, setTotalBudget] = useState('0');
  const [savedCategories, setSavedCategories] =
    useState<Category[]>(EMPTY_CATEGORIES);

  const [modalVisible, setModalVisible] = useState(false);
  const [draftBudget, setDraftBudget] = useState('0');
  const [draftCategories, setDraftCategories] =
    useState<Category[]>(EMPTY_CATEGORIES);

  const [loading, setLoading] = useState(false);

  // Your backend routes are using `date`, so pass full YYYY-MM-01
  const currentMonth = '2026-03-01';

  const parsedTotalBudget = parseFloat(totalBudget) || 0;

  const totalSpent = useMemo(() => {
    return savedCategories.reduce((sum, cat) => sum + cat.spent, 0);
  }, [savedCategories]);

  const totalAllocated = parsedTotalBudget;
  const totalRemaining = Math.max(totalAllocated - totalSpent, 0);
  const overallPercent =
    totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const draftTotalPercent = useMemo(() => {
    return draftCategories.reduce(
      (sum, cat) => sum + (parseFloat(cat.percent) || 0),
      0,
    );
  }, [draftCategories]);

  const draftBudgetNumber = parseFloat(draftBudget) || 0;

  const canSave = draftBudgetNumber > 0 && draftTotalPercent <= 100;

  const getAllocatedAmount = (percent: string, budget: number) => {
    return ((parseFloat(percent) || 0) / 100) * budget;
  };

  const loadBudgetData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/budgets/comparison/${currentMonth}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch budget comparison');
      }

      const data: BudgetComparisonResponse = await response.json();

      setBudgetId(data.id);
      setTotalBudget(String(data.total_budget));

      const mappedCategories: Category[] = EMPTY_CATEGORIES.map((baseCat) => {
        const backendCat = data.categories.find(
          (cat) =>
            normalizeCategory(cat.category) === normalizeCategory(baseCat.name),
        );

        return {
          name: baseCat.name,
          icon: CATEGORY_ICONS[baseCat.name] ?? 'apps',
          percent: backendCat ? String(backendCat.percent) : '0',
          spent: backendCat ? backendCat.spent : 0,
        };
      });

      setSavedCategories(mappedCategories);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load budget data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

  const openManageModal = () => {
    setDraftBudget(totalBudget);
    setDraftCategories(savedCategories.map((cat) => ({ ...cat })));
    setModalVisible(true);
  };

  const updateDraftPercent = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const updated = [...draftCategories];
    updated[index] = { ...updated[index], percent: cleaned };
    setDraftCategories(updated);
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      const payload = {
        month: currentMonth,
        total_budget: draftBudgetNumber,
        categories: draftCategories.map((cat) => ({
          category: cat.name,
          percent: parseFloat(cat.percent) || 0,
        })),
      };

      const url =
        budgetId === null
          ? `${BASE_URL}/budgets/`
          : `${BASE_URL}/budgets/${budgetId}`;

      const method = budgetId === null ? 'POST' : 'PUT';

      console.log('Saving budget...');
      console.log('budgetId =', budgetId);
      console.log('method =', method);
      console.log('url =', url);
      console.log('payload =', payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('status = ', response.status);
      console.log('response text =', text);

      if (!response.ok) {
        throw new Error(text || 'Failed to update budget');
      }

      setModalVisible(false);
      await loadBudgetData();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save budget changes.');
    }
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
          <Text style={styles.heroAmount}>
            {loading ? 'Loading...' : `$${parsedTotalBudget.toFixed(0)}`}
          </Text>

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
const PRIMARY = '#8b5cf6';
const PRIMARY_SOFT = '#f3e8ff';
const TEXT = '#0f172a';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const SUCCESS = '#16a34a';
const DANGER = '#ef4444';

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: TEXT,
  },
  manageButton: {
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  manageButtonText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  heroLabel: {
    color: MUTED,
    fontSize: 14,
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 16,
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
    backgroundColor: PRIMARY,
    borderRadius: 999,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatLabel: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 14,
  },
  categoryCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },
  categorySubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  categoryPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  categoryProgressTrack: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  categoryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryMeta: {
    fontSize: 12,
    color: MUTED,
    fontWeight: '600',
  },
  remainingText: {
    color: SUCCESS,
  },
  overBudgetText: {
    color: DANGER,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '82%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
    marginBottom: 8,
  },
  mainInput: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  inputRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  modalCategoryAmount: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  percentInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 10,
    minWidth: 72,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  percentInput: {
    minWidth: 32,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    color: TEXT,
  },
  percentSign: {
    fontSize: 14,
    fontWeight: '700',
    color: MUTED,
    marginLeft: 2,
  },
  summaryBox: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
