import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { auth, main } from "../../styles/style";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/styles/colors";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
);

const SYSTEM_INSTRUCTION =
  "You are 'Limitless AI,' a professional and motivating fitness trainer. Your goal is to provide concise, science-based advice on workouts, nutrition, and recovery. Keep responses encouraging but direct. Use formatting like bullet points for clarity. If asked about non-fitness topics, gently redirect the user back to their fitness goals.";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Limitless AI, your fitness trainer. How can I help you crush your goals today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");
    setIsLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API Key is missing in .env file");

      let model;
      try {
        model = genAI.getGenerativeModel({
          model: "gemini-3.1-flash-lite-preview",
        });
        const prompt = `${SYSTEM_INSTRUCTION}\n\nUser: ${inputText}`;
        const result = await model.generateContent(prompt);
        var response = await result.response;
      } catch (e: any) {
        console.warn("Falling back to gemini-pro due to error:", e.message);
        model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const prompt = `${SYSTEM_INSTRUCTION}\n\nUser: ${inputText}`;
        const result = await model.generateContent(prompt);
        var response = await result.response;
      }

      const text = response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [aiMessage, ...prev]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {isUser ? (
          <Text style={styles.messageText}>{item.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        )}
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View>
        <Text style={[auth.title, { marginBottom: 15 }]}>TRAINER AI</Text>
      </View>
      <View style={styles.fullLine} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 25}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#2196F3" />
            <Text style={styles.typingText}>Limitless AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainerOverride}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={isLoading || !inputText.trim()}
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && { opacity: 0.5 },
              ]}
            >
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    lineHeight: 22,
  },
  bullet_list: {
    marginVertical: 10,
  },
  list_item: {
    marginVertical: 2,
  },
  strong: {
    fontWeight: "900",
    color: "#FFF",
    fontSize: 16,
    lineHeight: 24,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  fullLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
  },
  chatList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderColor: "rgba(0, 122, 255, 0.3)",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 6,
    fontWeight: "600",
  },
  inputWrapper: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  inputContainerOverride: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  typingText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginLeft: 8,
    fontStyle: "italic",
    fontWeight: "600",
  },
});
