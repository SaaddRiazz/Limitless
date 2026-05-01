import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { auth } from "@/styles/style";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

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
      </View>

      <TouchableOpacity
        style={auth.loginButton}
        onPress={() => router.push("/App")}
      >
        <Text style={auth.loginText}>SIGN UP</Text>
      </TouchableOpacity>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={auth.linkText}>Sign in.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
