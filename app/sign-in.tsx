import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { auth } from "@/styles/style";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordRef = useRef<TextInput>(null);

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
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity style={auth.forgotButton}>
        <Text style={auth.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={auth.loginButton}>
        <Text style={auth.loginText}>SIGN IN</Text>
      </TouchableOpacity>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={auth.linkText} onPress={() => router.push("/sign-up")}>
            Register here.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
