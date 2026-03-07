// app/(tabs)/home.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>💰</Text>
            </View>
            <Text style={styles.logoText}>SmartSpend</Text>
          </View>
          <Ionicons name="log-out-outline" size={22} color="#6b7280" />
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Welcome back, there! 👋</Text>
          <Text style={styles.heroSubtitle}>
            Here’s your spending overview for March 2026
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.labelRow}>
            <Feather name="dollar-sign" size={18} color="#6b7280" />
            <Text style={styles.cardLabel}>Total Spent</Text>
          </View>
          <Text style={styles.cardValue}>$0.00</Text>
          <Text style={styles.cardSubtext}>This month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.labelRow}>
            <Feather name="arrow-up-right" size={18} color="#16a34a" />
            <Text style={styles.cardLabel}>Remaining Budget</Text>
          </View>
          <Text style={[styles.cardValue, { color: '#16a34a' }]}>$1850.00</Text>
          <Text style={styles.cardSubtext}>Left to spend</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.labelRow}>
            <Feather name="activity" size={18} color="#6b7280" />
            <Text style={styles.cardLabel}>Budget Usage</Text>
          </View>
          <Text style={styles.cardValue}>0%</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
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
  statCard: {
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
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  cardSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  progressTrack: {
    marginTop: 10,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '0%',
    height: '100%',
    backgroundColor: '#a100ff',
  },
});
