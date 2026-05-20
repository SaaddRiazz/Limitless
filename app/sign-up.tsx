import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const signUpWithEmail = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else if (user) {
        // Set username in profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            username: username.trim(),
            xp: 0,
            level: 1,
            streak: 0
          });

        if (profileError) {
          console.error("Profile creation error:", profileError.message);
        }

        Alert.alert(
          "Success",
          "Account created successfully!",
          [{ text: "OK", onPress: () => router.replace("/App") }]
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#050511", "#000000"]} style={auth.innerContainer}>
      <View style={{ alignItems: "center", marginBottom: 40, marginTop: 30 }}>
        <Text style={[auth.logo]}>LIMITLESS</Text>
        <View style={localStyles.underline} />
        <Text style={localStyles.tagline}>NO EXCUSES. NO BOUNDARIES.</Text>
      </View>

      <View style={localStyles.inputsWrapper}>
        <View style={{ gap: 15 }}>
          <EmailInput
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            onSubmitEditing={() => usernameRef.current?.focus()}
            blurOnSubmit={false}
          />

          <View style={auth.inputContainer}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#999"
              style={auth.input}
              value={username}
              onChangeText={setUsername}
              ref={usernameRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              autoCapitalize="none"
            />
          </View>

          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            ref={passwordRef}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            ref={confirmPasswordRef}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          style={[localStyles.gradientBtnContainer, loading && { opacity: 0.5 }]}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.blue, "#005bb5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.gradientBtn}
          >
            <Text style={auth.filledBtnText}>
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={localStyles.separatorContainer}>
        <View style={localStyles.separatorLine} />
        <Text style={localStyles.separatorText}>OR</Text>
        <View style={localStyles.separatorLine} />
      </View>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={auth.linkText}> Sign in.</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  underline: {
    height: 2,
    width: 200,
    backgroundColor: colors.blue,
    marginTop: 10,
    borderRadius: 1,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  tagline: {
    color: "#666",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 5,
    marginTop: 20,
    textTransform: "uppercase",
  },
  inputsWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  gradientBtnContainer: {
    marginTop: 25,
    borderRadius: 10,
    elevation: 4,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: "hidden",
  },
  gradientBtn: {
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  separatorText: {
    color: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 15,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
