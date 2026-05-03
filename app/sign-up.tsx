import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { supabase } from "@/lib/supabase";
import { auth } from "@/styles/style";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  // const [showOtp, setShowOtp] = useState(false);

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

  /*
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: "signup",
    });

    if (error) {
      Alert.alert("Verification Failed", error.message);
    } else {
      router.replace("/App");
    }
    setLoading(false);
  };
  */

  return (
    <View style={auth.innerContainer}>
      <Text style={auth.logo}>LIMITLESS</Text>
      <Text style={auth.welcomeText}>
        Never <Text style={{ color: "#fff" }}>Done. </Text>
        Only <Text style={{ color: "#fff" }}>Next.</Text>
      </Text>

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

        {/* 
        <View style={auth.inputContainer}>
          <TextInput
            placeholder="6-Digit OTP Code"
            placeholderTextColor="#999"
            style={auth.input}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        */}
      </View>

      <TouchableOpacity
        style={[auth.filledBtn, loading && { opacity: 0.5 }]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={auth.filledBtnText}>
          {loading ? "SIGNING UP..." : "SIGN UP"}
        </Text>
      </TouchableOpacity>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={auth.linkText}> Sign in.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
