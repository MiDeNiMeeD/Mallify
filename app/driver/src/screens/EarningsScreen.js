import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  fonts,
} from "../theme";
import { mockEarnings } from "../data/mock";

const { width } = Dimensions.get("window");

const EarningsScreen = () => {
  console.log("💰 EarningsScreen rendered");
  console.log("💵 Earnings data:", mockEarnings);

  const [selectedPeriod, setSelectedPeriod] = useState("week"); // today, week, month

  const periods = [
    { id: "today", label: "Today", icon: "today" },
    { id: "week", label: "Week", icon: "calendar" },
    { id: "month", label: "Month", icon: "calendar-outline" },
  ];

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case "today":
        return mockEarnings.today;
      case "week":
        return mockEarnings.week;
      case "month":
        return mockEarnings.month;
      default:
        return mockEarnings.week;
    }
  };

  const getChartData = () => {
    switch (selectedPeriod) {
      case "today":
        return mockEarnings.hourlyData;
      case "week":
        return mockEarnings.weeklyData;
      case "month":
        return mockEarnings.monthlyData;
      default:
        return mockEarnings.weeklyData;
    }
  };

  const periodData = getPeriodData();
  const chartData = getChartData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Earnings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Period Filter Tabs */}
        <View style={styles.filterContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.filterTab,
                selectedPeriod === period.id && styles.filterTabActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={period.icon}
                size={18}
                color={
                  selectedPeriod === period.id
                    ? "#70B2B2"
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedPeriod === period.id && styles.filterTabTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardHeader}>
            <View style={styles.totalIconContainer}>
              <Ionicons name="cash" size={32} color="#70B2B2" />
            </View>
          </View>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>
            ${periodData.amount.toFixed(2)}
          </Text>
          <View style={styles.totalStatsRow}>
            <View style={styles.totalStat}>
              <Ionicons name="cube" size={16} color="#9ECFD4" />
              <Text style={styles.totalStatText}>
                {periodData.deliveries} deliveries
              </Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStat}>
              <Ionicons name="time" size={16} color="#9ECFD4" />
              <Text style={styles.totalStatText}>{periodData.hours}h</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up" size={24} color="#70B2B2" />
            </View>
            <Text style={styles.statValue}>
              ${(periodData.amount / periodData.deliveries).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Avg per Delivery</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flash" size={24} color="#9ECFD4" />
            </View>
            <Text style={styles.statValue}>
              ${(periodData.amount / periodData.hours).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Per Hour</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="speedometer" size={24} color="#E5E9C5" />
            </View>
            <Text style={styles.statValue}>
              {(periodData.deliveries / periodData.hours).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Deliveries/Hour</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star" size={24} color="#FFB800" />
            </View>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Line Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="analytics" size={20} color="#70B2B2" />
            <Text style={styles.chartTitle}>Earnings Trend</Text>
          </View>
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  data: chartData.data,
                },
              ],
            }}
            width={width - spacing.lg * 4}
            height={200}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(112, 178, 178, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#70B2B2",
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Bar Chart - Comparison */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={20} color="#9ECFD4" />
            <Text style={styles.chartTitle}>Performance Overview</Text>
          </View>
          <BarChart
            data={{
              labels: ["Earnings", "Deliveries", "Hours", "Avg/Del"],
              datasets: [
                {
                  data: [
                    periodData.amount / 10, // Scale down for visualization
                    periodData.deliveries,
                    periodData.hours * 2, // Scale up for visualization
                    (periodData.amount / periodData.deliveries) * 5, // Scale up
                  ],
                },
              ],
            }}
            width={width - spacing.lg * 4}
            height={200}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(158, 207, 212, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color="#70B2B2" />
            <Text style={styles.sectionTitle}>Recent Payouts</Text>
          </View>

          <View style={styles.transactionCard}>
            <View style={styles.transactionIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>Weekly Payout</Text>
              <Text style={styles.transactionDate}>Oct 10, 2025</Text>
            </View>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>+$645.75</Text>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          </View>

          <View style={styles.transactionCard}>
            <View style={styles.transactionIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>Weekly Payout</Text>
              <Text style={styles.transactionDate}>Oct 3, 2025</Text>
            </View>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>+$589.25</Text>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          </View>

          <View style={styles.transactionCard}>
            <View style={styles.transactionIconContainer}>
              <Ionicons name="gift-outline" size={24} color="#FFB800" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>Bonus Reward</Text>
              <Text style={styles.transactionDate}>Sep 30, 2025</Text>
            </View>
            <View style={styles.transactionAmountContainer}>
              <Text style={styles.transactionAmount}>+$50.00</Text>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    marginTop: StatusBar.currentHeight || 0,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    lineHeight: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
    gap: spacing.xs,
  },
  filterTabActive: {
    borderColor: "#70B2B2",
    backgroundColor: "#70B2B220",
  },
  filterTabText: {
    fontFamily: fonts.poppinsMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    fontFamily: fonts.poppinsSemiBold,
    color: "#70B2B2",
  },
  // Total Card
  totalCard: {
    backgroundColor: "#70B2B2",
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  totalCardHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  totalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.xs,
    opacity: 0.9,
  },
  totalAmount: {
    fontFamily: fonts.poppinsBold,
    fontSize: 48,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  totalStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  totalStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  totalStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  totalStatText: {
    fontFamily: fonts.poppinsMedium,
    fontSize: 13,
    color: colors.white,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.medium,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F9F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    fontFamily: fonts.poppinsBold,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Charts
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  // Transactions Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F9F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmountContainer: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  transactionAmount: {
    fontFamily: fonts.poppinsBold,
    fontSize: 16,
    color: "#4CAF50",
  },
});

export default EarningsScreen;
