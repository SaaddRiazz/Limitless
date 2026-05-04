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
        // User's specific model choice
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
    <View style={main.container}>
      <Text style={[main.headerTitle, { marginBottom: 30, marginTop: 20 }]}>
        TRAINER AI
      </Text>

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
            <Text style={styles.typingText}>Limitless AI is typing...</Text>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <View style={[auth.inputContainer, styles.inputContainerOverride]}>
            <TextInput
              style={auth.input}
              placeholder="Ask me anything..."
              placeholderTextColor="#808080"
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
              <MaterialCommunityIcons name="send" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 22,
  },
  bullet_list: {
    marginVertical: 10,
  },
  list_item: {
    marginVertical: 2,
  },
  strong: {
    fontWeight: "bold",
    color: "#FFF",
    fontSize: 18, // Increased from the body's 16
    lineHeight: 24, // Adjusted slightly to maintain vertical rhythm
  },
});

const styles = StyleSheet.create({
  chatList: {
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2196F3",
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: "#FFF",
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputWrapper: {
    paddingVertical: 10,
    backgroundColor: "#00000a",
  },
  inputContainerOverride: {
    height: "auto",
    minHeight: 55,
    paddingVertical: 5,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  typingText: {
    color: "#808080",
    fontSize: 12,
    marginLeft: 8,
    fontStyle: "italic",
  },
});
