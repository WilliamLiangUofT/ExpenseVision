// app/(tabs)/analytics.tsx
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  const categoryData = [
    { name: 'Food', amount: '$420.00', percent: 42, color: '#a100ff' },
    { name: 'Transport', amount: '$180.00', percent: 18, color: '#ec4899' },
    { name: 'Shopping', amount: '$250.00', percent: 25, color: '#8b5cf6' },
    { name: 'Bills', amount: '$150.00', percent: 15, color: '#c084fc' },
  ];

  const weeklyData = [
    { label: 'W1', value: 45 },
    { label: 'W2', value: 70 },
    { label: 'W3', value: 55 },
    { label: 'W4', value: 85 },
  ];

  const maxBar = Math.max(...weeklyData.map((item) => item.value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* header and the calender label */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>💰</Text>
            </View>
            <Text style={styles.logoText}>ExpenseVision</Text>
          </View>
          <Ionicons name="calendar-outline" size={22} color="#6b7280" />
        </View>

        {/* spending insights box */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Spending Insights 📊</Text>
          <Text style={styles.heroSubtitle}>
            Track your spending trends and category breakdown for March 2026
          </Text>
        </View>

        {/* row for top category and daily avg */}
        <View style={styles.statRow}>
          <View style={[styles.miniStatCard, styles.miniCardSpacing]}>
            <View style={styles.labelRow}>
              <Feather name="trending-up" size={18} color="#6b7280" />
              <Text style={styles.cardLabel}>Top Category</Text>
            </View>
            <Text style={styles.miniValue}>Food</Text>
            <Text style={styles.cardSubtext}>$420.00 spent</Text>
          </View>

          <View style={styles.miniStatCard}>
            <View style={styles.labelRow}>
              <Feather name="calendar" size={18} color="#6b7280" />
              <Text style={styles.cardLabel}>Daily Avg</Text>
            </View>
            <Text style={styles.miniValue}>$33.33</Text>
            <Text style={styles.cardSubtext}>Per day</Text>
          </View>
        </View>

        {/* monthly trend */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={18}
              color="#6b7280"
            />
            <Text style={styles.cardLabel}>Monthly Trend</Text>
          </View>

          <View style={styles.chartContainer}>
            {weeklyData.map((item) => (
              <View key={item.label} style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(item.value / maxBar) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* category breakdown  */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Feather name="pie-chart" size={18} color="#6b7280" />
            <Text style={styles.cardLabel}>Category Breakdown</Text>
          </View>

          {categoryData.map((item) => (
            <View key={item.name} style={styles.categoryItem}>
              <View style={styles.categoryTopRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName}>{item.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>{item.amount}</Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.percentText}>
                {item.percent}% of spending
              </Text>
            </View>
          ))}
        </View>

        {/* short summary on the spending data */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Feather name="zap" size={18} color="#6b7280" />
            <Text style={styles.cardLabel}>Smart Insights</Text>
          </View>

          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={styles.insightText}>
              Food is your highest spending category this month.
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={styles.insightText}>
              Your spending increased in Week 4 compared to earlier weeks.
            </Text>
          </View>

          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={styles.insightText}>
              You are still within a healthy budget pace overall.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1f5',
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
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#a100ff',
  },
  heroTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  miniCardSpacing: {
    marginRight: 12,
  },
  miniValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  card: {
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
    marginBottom: 18,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    marginTop: 8,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 32,
    height: 140,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 10,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#a100ff',
    borderRadius: 999,
  },
  barLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  percentText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightBullet: {
    fontSize: 18,
    color: '#a100ff',
    marginRight: 10,
    lineHeight: 22,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
});
