import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.innerContainer}>
      <Text style={styles.logo}>LIMITLESS</Text>
      <Text style={styles.welcomeText}>
        Never <Text style={{ color: "#fff" }}>Done. </Text>
        Only <Text style={{ color: "#fff" }}>Next.</Text>
      </Text>

      <View style={{ gap: 15 }}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{ padding: 5 }}
          >
            {isPasswordVisible ? (
              <Eye color="#fff" size={20} />
            ) : (
              <EyeOff color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>LOG IN</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.linkText}>Register here.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    paddingHorizontal: 30,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000a",
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 4,
    fontStyle: "italic",
    textShadowColor: "rgba(255, 255, 255, 0.75)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    transform: [{ scaleX: 1.35 }],
  },
  welcomeText: {
    fontSize: 16,
    color: "#b3b3b3",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e2e2e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#808080",
    height: 55,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2196F3",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
    elevation: 4,
  },
  loginText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotButton: {
    marginTop: 2,
    alignItems: "flex-end",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#b3b3b3",
    fontSize: 14,
  },
  linkText: {
    color: "#2196F3",
    fontWeight: "600",
  },
});
