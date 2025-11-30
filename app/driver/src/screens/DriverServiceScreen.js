import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../theme";

const DriverServiceScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello, good morning",
      time: "09:41",
      isUser: false,
    },
    {
      id: 2,
      text: "I am a Driver Service, is there anything I can help you with? 😊",
      time: "09:41",
      isUser: false,
    },
    {
      id: 3,
      text: "Hi, I'm having problems with my order & payment.",
      time: "09:41",
      isUser: true,
    },
    {
      id: 4,
      text: "Can you help me?",
      time: "09:41",
      isUser: true,
    },
    {
      id: 5,
      text: "Of course",
      time: "09:41",
      isUser: false,
    },
    {
      id: 6,
      text: "Can you tell me the problem you are having? so I can help solve it 😊",
      time: "09:02",
      isUser: false,
    },
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver Service</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="call-outline"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Divider */}
        <View style={styles.dateDivider}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>Today</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.isUser
                  ? styles.userMessageWrapper
                  : styles.botMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.isUser ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              <Text
                style={[
                  styles.messageTime,
                  msg.isUser ? styles.userMessageTime : styles.botMessageTime,
                ]}
              >
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Message..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons
                name="image-outline"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons name="arrow-up" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dateDivider: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  dateBadge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  botMessageWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginBottom: spacing.xs / 2,
  },
  userMessage: {
    backgroundColor: "#016B61",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  userMessageTime: {
    textAlign: "right",
  },
  botMessageTime: {
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary,
    backgroundColor: colors.white,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  attachButton: {
    padding: spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#016B61",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DriverServiceScreen;
