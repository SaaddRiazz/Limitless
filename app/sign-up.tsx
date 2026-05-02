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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const signUpWithEmail = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Move to OTP verification step
      setShowOtp(true);
      Alert.alert("Verify Email", "A 6-digit code has been sent to your email.");
    }
    setLoading(false);
  };

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
      // If verification is successful, your AuthProvider will detect the session
      // and redirect automatically, but we can force it here just in case.
      router.replace("/App");
    }
    setLoading(false);
  };

  return (
    <View style={auth.innerContainer}>
      <Text style={auth.logo}>LIMITLESS</Text>
      <Text style={auth.welcomeText}>
        {showOtp ? "Enter the code sent to your email." : (
          <>
            Never <Text style={{ color: "#fff" }}>Done. </Text>
            Only <Text style={{ color: "#fff" }}>Next.</Text>
          </>
        )}
      </Text>

      <View style={{ gap: 15 }}>
        {/* If showing OTP, hide the other fields and only show OTP input */}
        {!showOtp ? (
          <>
            <EmailInput
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

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
          </>
        ) : (
          <View style={auth.inputContainer}>
            <TextInput
              placeholder="6-Digit OTP Code"
              placeholderTextColor="#999"
              style={auth.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[auth.loginButton, loading && { opacity: 0.5 }]}
        onPress={showOtp ? verifyOtp : signUpWithEmail}
        disabled={loading}
      >
        <Text style={auth.loginText}>
          {loading
            ? (showOtp ? "VERIFYING..." : "SIGNING UP...")
            : (showOtp ? "VERIFY CODE" : "SIGN UP")}
        </Text>
      </TouchableOpacity>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>
          {showOtp ? "Didn't get a code?" : "Already have an account?"}
        </Text>
        <TouchableOpacity
          onPress={() => showOtp ? setShowOtp(false) : router.back()}
        >
          <Text style={auth.linkText}>
            {showOtp ? " Go back." : " Sign in."}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}