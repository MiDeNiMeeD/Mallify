import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, fonts } from "../theme";

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("Mohamed Mideni");
  const [nickname, setNickname] = useState("Med");
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1995, 11, 27)); // December 27, 1995
  const [email, setEmail] = useState("Mideni@gmail.com");
  const [city, setCity] = useState("Sousse");
  const [phoneNumber, setPhoneNumber] = useState("24 905 669");
  const [gender, setGender] = useState("Male");
  const [profileImage, setProfileImage] = useState(null);

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Data for pickers
  const cities = [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Médenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kebili",
  ];

  const genders = ["Male", "Female", "Prefer not to say"];

  // Helper function to format date
  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const [currentDisplayDate, setCurrentDisplayDate] = useState(
    new Date(dateOfBirth)
  );

  const handleDatePress = () => {
    setCurrentDisplayDate(new Date(dateOfBirth));
    setShowDatePicker(true);
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(
      currentDisplayDate.getFullYear(),
      currentDisplayDate.getMonth(),
      day
    );
    setDateOfBirth(newDate);
    setShowDatePicker(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDisplayDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDisplayDate(newDate);
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate years from 1950 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 1950; year <= currentYear; year++) {
    years.push(year);
  }

  const handleMonthHeaderPress = () => {
    setShowMonthPicker(true);
  };

  const handleYearHeaderPress = () => {
    setShowYearPicker(true);
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentDisplayDate);
    newDate.setMonth(monthIndex);
    setCurrentDisplayDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(currentDisplayDate);
    newDate.setFullYear(year);
    setCurrentDisplayDate(newDate);
    setShowYearPicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDisplayDate);
    const firstDay = getFirstDayOfMonth(currentDisplayDate);
    const selectedDay = dateOfBirth.getDate();
    const selectedMonth = dateOfBirth.getMonth();
    const selectedYear = dateOfBirth.getFullYear();
    const currentMonth = currentDisplayDate.getMonth();
    const currentYear = currentDisplayDate.getFullYear();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay}>
          <Text></Text>
        </View>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDay &&
        currentMonth === selectedMonth &&
        currentYear === selectedYear;
      days.push(
        <TouchableOpacity
          key={day}
          style={[styles.calendarDay, isSelected && styles.selectedDay]}
          onPress={() => handleDateSelect(day)}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.selectedDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const handleCityPress = () => {
    setShowCityPicker(true);
  };

  const handleGenderPress = () => {
    setShowGenderPicker(true);
  };

  const handleImagePicker = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to select an image."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdate = () => {
    // Validate inputs
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!nickname.trim()) {
      Alert.alert("Error", "Please enter your nickname");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    // Handle profile update logic here
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : {
                      uri: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-1/470468285_1609345313014084_246144399086604_n.jpg?stp=dst-jpg_p160x160_tt6&_nc_cat=105&ccb=1-7&_nc_sid=28885b&_nc_ohc=P-s65qfjS1YQ7kNvwHKDQb0&_nc_oc=Adnq0XHSqeAshpFqr54mCSPmtzkM7BbTMVQ2NMcKaDnq8OYk1Q7J-YbBTG3NvLJvCCg&_nc_zt=24&_nc_ht=scontent.ftun1-2.fna&_nc_gid=GZqvRY8aQmMvibK7QFEszA&oh=00_AffW23NsePHbTazVNdcD_yHrCLY6xJq52vVr63T7Oyy-Pg&oe=68F1B490",
                    }
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handleImagePicker}
            >
              <Ionicons name="pencil" size={12} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Nickname */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nickname</Text>
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="Enter your nickname"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={handleDatePress}
            >
              <Text style={styles.dateInputText}>
                {formatDate(dateOfBirth)}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.emailInputDisabled}>
              <Text style={styles.emailInputTextDisabled}>{email}</Text>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={handleCityPress}
            >
              <Text style={styles.dropdownInputText}>{city}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCodeContainer}>
                <Image
                  source={require("../../assets/tn.png")} // Replace with US flag icon
                  style={styles.flagIcon}
                />
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={handleGenderPress}
            >
              <Text style={styles.dropdownInputText}>{gender}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Calendar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>

            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => navigateMonth("prev")}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
              <View style={styles.calendarHeaderCenter}>
                <TouchableOpacity onPress={handleMonthHeaderPress}>
                  <Text style={styles.calendarHeaderText}>
                    {monthNames[currentDisplayDate.getMonth()]}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleYearHeaderPress}>
                  <Text style={styles.calendarHeaderText}>
                    {currentDisplayDate.getFullYear()}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigateMonth("next")}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={styles.dayNamesContainer}>
              {dayNames.map((dayName, index) => (
                <View key={index} style={styles.dayName}>
                  <Text style={styles.dayNameText}>{dayName}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>{renderCalendar()}</View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMonthPicker}
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView style={styles.optionsList}>
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    currentDisplayDate.getMonth() === index &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentDisplayDate.getMonth() === index &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {month}
                  </Text>
                  {currentDisplayDate.getMonth() === index && (
                    <Ionicons name="checkmark" size={20} color="#016B61" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showYearPicker}
        onRequestClose={() => setShowYearPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <ScrollView style={styles.optionsList}>
              {years.reverse().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionItem,
                    currentDisplayDate.getFullYear() === year &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      currentDisplayDate.getFullYear() === year &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {year}
                  </Text>
                  {currentDisplayDate.getFullYear() === year && (
                    <Ionicons name="checkmark" size={20} color="#016B61" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* City Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCityPicker}
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select City</Text>
            <ScrollView style={styles.optionsList}>
              {cities.map((cityOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    city === cityOption && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setCity(cityOption);
                    setShowCityPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      city === cityOption && styles.selectedOptionText,
                    ]}
                  >
                    {cityOption}
                  </Text>
                  {city === cityOption && (
                    <Ionicons name="checkmark" size={20} color="#016B61" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showGenderPicker}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <ScrollView style={styles.optionsList}>
              {genders.map((genderOption, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    gender === genderOption && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setGender(genderOption);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === genderOption && styles.selectedOptionText,
                    ]}
                  >
                    {genderOption}
                  </Text>
                  {gender === genderOption && (
                    <Ionicons name="checkmark" size={20} color="#016B61" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#016B61",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  formSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dateInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
  },
  emailInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emailInputText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownInputText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: spacing.sm,
  },
  flagIcon: {
    width: 34,
    height: 26,
    marginRight: spacing.xs,
    resizeMode: "cover",
    borderRadius: 4,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary,
  },
  updateButton: {
    backgroundColor: "#016B61",
    borderRadius: 25,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsBold,
    color: colors.white,
  },
  // Disabled email input styles
  emailInputDisabled: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    opacity: 0.6,
  },
  emailInputTextDisabled: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 25,
    backgroundColor: "#016B61",
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontFamily: fonts.poppinsMedium,
    color: colors.white,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  selectedOption: {
    backgroundColor: colors.backgroundSecondary,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: "#016B61",
    fontFamily: fonts.poppinsMedium,
  },
  // Calendar styles
  calendarModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 350,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  calendarHeaderCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
  dayNamesContainer: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  dayName: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  dayNameText: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  calendarDay: {
    width: "14.28%", // 100% / 7 days
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  selectedDay: {
    backgroundColor: "#016B61",
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
  },
  selectedDayText: {
    color: colors.white,
    fontFamily: fonts.poppinsBold,
  },
});

export default EditProfileScreen;
