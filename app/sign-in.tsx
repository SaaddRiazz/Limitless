import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { supabase } from "@/lib/supabase";
import { auth } from "@/styles/style";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const signInWithEmail = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      // Explicitly redirect to the dashboard
      router.replace("/App");
    }
    setLoading(false);
  };

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

      <TouchableOpacity
        style={[auth.loginButton, loading && { opacity: 0.5 }]}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={auth.loginText}>{loading ? "SIGNING IN..." : "SIGN IN"}</Text>
      </TouchableOpacity>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={auth.linkText}>Register here.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
