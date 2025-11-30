import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, borderRadius, shadows } from "../theme";
import { mockDeliveries } from "../data/mock";

const DeliveriesScreen = ({ navigation }) => {
  console.log("📦 DeliveriesScreen rendered");

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Today";
    }

    const options = { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearPicker(false);
  };

  // Generate year range (current year ± 50 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  // Date filter tabs
  const dateFilters = [
    { id: "today", label: "Today", icon: "today" },
    { id: "week", label: "This Week", icon: "calendar" },
    { id: "month", label: "This Month", icon: "calendar-outline" },
  ];

  // Status filter tabs
  const statusFilters = [
    {
      id: "all",
      label: "All Status",
      icon: "apps",
      count: mockDeliveries.length,
    },
    {
      id: "assigned",
      label: "Assigned",
      icon: "cube-outline",
      count: mockDeliveries.filter((d) => d.status === "assigned").length,
    },
    {
      id: "in-progress",
      label: "In Progress",
      icon: "bicycle",
      count: mockDeliveries.filter((d) => d.status === "in-progress").length,
    },
    {
      id: "delivered",
      label: "Completed",
      icon: "checkmark-circle",
      count: mockDeliveries.filter((d) => d.status === "delivered").length,
    },
  ];

  // Filter deliveries based on selected filter
  const filteredDeliveries =
    selectedFilter === "all"
      ? mockDeliveries
      : mockDeliveries.filter((d) => d.status === selectedFilter);

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "assigned":
        return {
          label: "Assigned",
          color: colors.primary,
          bgColor: "#E5F5F4",
          icon: "cube-outline",
        };
      case "in-progress":
        return {
          label: "In Progress",
          color: "#FF9800",
          bgColor: "#FFF4E5",
          icon: "bicycle",
        };
      case "delivered":
        return {
          label: "Delivered",
          color: "#4CAF50",
          bgColor: "#E8F5E9",
          icon: "checkmark-circle",
        };
      case "pending":
        return {
          label: "Pending",
          color: "#9E9E9E",
          bgColor: "#F5F5F5",
          icon: "time-outline",
        };
      case "picked_up":
        return {
          label: "Picked Up",
          color: "#2196F3",
          bgColor: "#E3F2FD",
          icon: "bag-check-outline",
        };
      default:
        return {
          label: status,
          color: "#757575",
          bgColor: "#F5F5F5",
          icon: "ellipsis-horizontal",
        };
    }
  };

  // Stats summary
  const stats = [
    {
      label: "Total Deliveries",
      value: mockDeliveries.length,
      icon: "cube-outline",
      color: "#70B2B2",
      lightColor: "#E5F5F4",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Assigned",
      value: mockDeliveries.filter((d) => d.status === "assigned").length,
      icon: "cube-outline",
      color: "#9C27B0",
      lightColor: "#F3E5F5",
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "In Progress",
      value: mockDeliveries.filter((d) => d.status === "in-progress").length,
      icon: "bicycle-outline",
      color: "#FF9800",
      lightColor: "#FFF4E5",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Picked Up",
      value: mockDeliveries.filter((d) => d.status === "picked_up").length,
      icon: "bag-check-outline",
      color: "#2196F3",
      lightColor: "#E3F2FD",
      trend: "+10%",
      trendUp: true,
    },
    {
      label: "Completed",
      value: mockDeliveries.filter((d) => d.status === "delivered").length,
      icon: "checkmark-done-circle-outline",
      color: "#4CAF50",
      lightColor: "#E8F5E9",
      trend: "+15%",
      trendUp: true,
    },
    {
      label: "Pending",
      value: mockDeliveries.filter((d) => d.status === "pending").length,
      icon: "time-outline",
      color: "#9E9E9E",
      lightColor: "#F5F5F5",
      trend: "-3%",
      trendUp: false,
    },
  ];

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
          <Text style={styles.headerTitle}>Deliveries</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.statCard, { backgroundColor: stat.lightColor }]}
                activeOpacity={0.85}
              >
                <View style={styles.statCardHeader}>
                  <View
                    style={[
                      styles.statIconCircle,
                      { backgroundColor: stat.color },
                    ]}
                  >
                    <Ionicons name={stat.icon} size={20} color="#FFFFFF" />
                  </View>
                  <View
                    style={[
                      styles.trendBadge,
                      {
                        backgroundColor: stat.trendUp ? "#E8F5E9" : "#FFEBEE",
                      },
                    ]}
                  >
                    <Ionicons
                      name={stat.trendUp ? "trending-up" : "trending-down"}
                      size={10}
                      color={stat.trendUp ? "#4CAF50" : "#F44336"}
                    />
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color: stat.trendUp ? "#4CAF50" : "#F44336",
                        },
                      ]}
                    >
                      {stat.trend}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>

                <View style={styles.statFooter}>
                  <View
                    style={[styles.statDot, { backgroundColor: stat.color }]}
                  />
                  <Text style={styles.statSubtext}>Today</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date Selector */}
        <View style={styles.dateFilterSection}>
          <Text style={styles.filterSectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowCalendar(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={20} color="#70B2B2" />
            <Text style={styles.datePickerText}>
              {formatDate(selectedDate)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Calendar Modal */}
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <TouchableOpacity
              style={styles.calendarContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => changeMonth(-1)}
                  style={styles.monthButton}
                >
                  <Ionicons name="chevron-back" size={24} color="#70B2B2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monthYearSelector}
                  onPress={() => {
                    setShowMonthPicker(true);
                    setShowYearPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calendarHeaderText}>
                    {monthNames[selectedDate.getMonth()]}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#70B2B2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.monthYearSelector}
                  onPress={() => {
                    setShowYearPicker(true);
                    setShowMonthPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calendarHeaderText}>
                    {selectedDate.getFullYear()}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#70B2B2" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => changeMonth(1)}
                  style={styles.monthButton}
                >
                  <Ionicons name="chevron-forward" size={24} color="#70B2B2" />
                </TouchableOpacity>
              </View>

              {/* Month Picker */}
              {showMonthPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll}>
                    {monthNames.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.pickerItem,
                          selectedDate.getMonth() === index &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => handleMonthSelect(index)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedDate.getMonth() === index &&
                              styles.pickerItemTextSelected,
                          ]}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Year Picker */}
              {showYearPicker && (
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.pickerScroll}>
                    {generateYears().map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.pickerItem,
                          selectedDate.getFullYear() === year &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => handleYearSelect(year)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedDate.getFullYear() === year &&
                              styles.pickerItemTextSelected,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Calendar Days - Only show when not picking month/year */}
              {!showMonthPicker && !showYearPicker && (
                <>
                  {/* Weekday Headers */}
                  <View style={styles.weekdayRow}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <View key={day} style={styles.weekdayCell}>
                          <Text style={styles.weekdayText}>{day}</Text>
                        </View>
                      )
                    )}
                  </View>

                  {/* Calendar Days */}
                  <View style={styles.calendarGrid}>
                    {generateCalendarDays().map((day, index) => {
                      const isToday =
                        day && day.toDateString() === new Date().toDateString();
                      const isSelected =
                        day &&
                        day.toDateString() === selectedDate.toDateString();

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayCell,
                            isSelected && styles.dayCellSelected,
                            isToday && !isSelected && styles.dayCellToday,
                          ]}
                          onPress={() => handleDateSelect(day)}
                          disabled={!day}
                          activeOpacity={0.7}
                        >
                          {day && (
                            <Text
                              style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                isToday && !isSelected && styles.dayTextToday,
                              ]}
                            >
                              {day.getDate()}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Quick Actions */}
              <View style={styles.calendarActions}>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => handleDateSelect(new Date())}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Status Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={
                    selectedFilter === filter.id ? "#FFF" : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id && styles.filterTabTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
                <View
                  style={[
                    styles.filterBadge,
                    selectedFilter === filter.id && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      selectedFilter === filter.id &&
                        styles.filterBadgeTextActive,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Deliveries List */}
        <View style={styles.deliveriesContainer}>
          {filteredDeliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cube-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>No deliveries</Text>
              <Text style={styles.emptyStateText}>
                No deliveries found for this filter
              </Text>
            </View>
          ) : (
            filteredDeliveries.map((delivery) => {
              const statusInfo = getStatusInfo(delivery.status);
              return (
                <TouchableOpacity
                  key={delivery.id}
                  style={styles.deliveryCard}
                  onPress={() =>
                    navigation.navigate("DeliveryDetails", { delivery })
                  }
                  activeOpacity={0.7}
                >
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bgColor },
                    ]}
                  >
                    <Ionicons
                      name={statusInfo.icon}
                      size={14}
                      color={statusInfo.color}
                    />
                    <Text
                      style={[styles.statusText, { color: statusInfo.color }]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>

                  {/* Delivery Info */}
                  <View style={styles.deliveryHeader}>
                    <View style={styles.deliveryIdContainer}>
                      <Ionicons
                        name="receipt-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.deliveryId}>{delivery.id}</Text>
                    </View>
                    <View style={styles.packageBadge}>
                      <Ionicons name="cube" size={14} color={colors.primary} />
                      <Text style={styles.packageCount}>
                        {delivery.packageCount}
                      </Text>
                    </View>
                  </View>

                  {/* Customer Name */}
                  <Text style={styles.customerName}>
                    {delivery.customerName}
                  </Text>

                  {/* Address */}
                  <View style={styles.addressContainer}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.addressText} numberOfLines={2}>
                      {delivery.address}
                    </Text>
                  </View>

                  {/* Notes (if available) */}
                  {delivery.notes && (
                    <View style={styles.notesContainer}>
                      <Ionicons
                        name="document-text-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.notesText} numberOfLines={1}>
                        {delivery.notes}
                      </Text>
                    </View>
                  )}

                  {/* Footer */}
                  <View style={styles.deliveryFooter}>
                    <View style={styles.timeContainer}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.timeText}>
                        {delivery.estimatedTime}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.viewButtonText}>View Details</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    paddingBottom: 100,
  },
  statsContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  statCard: {
    width: 130,
    borderRadius: 16,
    padding: 12,
    ...shadows.small,
    minHeight: 115,
    justifyContent: "space-between",
    marginVertical: spacing.sm,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.small,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  trendText: {
    fontSize: 9,
    fontFamily: fonts.poppinsBold,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.poppinsBold,
    lineHeight: 28,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statSubtext: {
    fontSize: 11,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  // Date Picker
  dateFilterSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.large,
    borderWidth: 1.5,
    borderColor: "#E8EEF1",
    ...shadows.small,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  // Calendar Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 400,
    ...shadows.medium,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  monthButton: {
    padding: spacing.sm,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
  },
  monthYearSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.medium,
    backgroundColor: "#F8FAFB",
  },
  pickerContainer: {
    maxHeight: 250,
    marginBottom: spacing.md,
    borderRadius: borderRadius.medium,
    backgroundColor: "#F8FAFB",
    borderWidth: 1,
    borderColor: "#E0E7EB",
  },
  pickerScroll: {
    padding: spacing.xs,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    marginBottom: 4,
  },
  pickerItemSelected: {
    backgroundColor: "#70B2B2",
  },
  pickerItemText: {
    fontSize: 15,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  pickerItemTextSelected: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  dayCellToday: {
    backgroundColor: "#F0F9F9",
    borderRadius: 20,
  },
  dayCellSelected: {
    backgroundColor: "#70B2B2",
    borderRadius: 20,
  },
  dayText: {
    fontSize: 15,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
  },
  dayTextToday: {
    color: "#70B2B2",
    fontFamily: fonts.poppinsBold,
  },
  dayTextSelected: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
  },
  calendarActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  todayButton: {
    flex: 1,
    backgroundColor: "#F0F9F9",
    paddingVertical: 12,
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  todayButtonText: {
    fontSize: 14,
    fontFamily: fonts.poppinsSemiBold,
    color: "#70B2B2",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#70B2B2",
    paddingVertical: 12,
    borderRadius: borderRadius.medium,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
  },
  // Status Filter Section
  filterSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  filterContainer: {
    paddingVertical: spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "#E8EEF1",
    gap: 8,
    ...shadows.small,
  },
  filterTabActive: {
    backgroundColor: "#70B2B2",
    borderColor: "#70B2B2",
    ...shadows.medium,
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: "#F0F4F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 26,
    alignItems: "center",
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: fonts.poppinsBold,
    color: colors.text,
  },
  filterBadgeTextActive: {
    color: colors.white,
  },
  deliveriesContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.poppinsSemiBold,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  deliveryIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  deliveryId: {
    fontSize: 13,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
  },
  packageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  packageCount: {
    fontSize: 12,
    fontFamily: fonts.poppinsBold,
    color: "#70B2B2",
  },
  customerName: {
    fontSize: 16,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: "#F8F9FA",
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FFF8E5",
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: "#D97706",
  },
  deliveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: spacing.sm,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.small,
  },
  timeText: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F9F9",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: fonts.poppinsSemiBold,
    color: "#70B2B2",
  },
});

export default DeliveriesScreen;
