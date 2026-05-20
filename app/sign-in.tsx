import EmailInput from "@/components/ui/email-input";
import PasswordInput from "@/components/ui/password-input";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

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
      // Note: persistence is handled globally by AsyncStorage in lib/supabase.ts
      router.replace("/App");
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={auth.innerContainer}>
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

        <View style={localStyles.actionsRow}>
          <TouchableOpacity
            onPress={() => setStayLoggedIn(!stayLoggedIn)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <MaterialCommunityIcons
              name={stayLoggedIn ? "checkbox-marked" : "checkbox-blank-outline"}
              size={22}
              color={stayLoggedIn ? colors.blue : "#b3b3b3"}
            />
            <Text style={{ color: "#b3b3b3", fontSize: 14 }}>Stay Logged in</Text>
          </TouchableOpacity>

          <TouchableOpacity style={auth.forgotButton}>
            <Text style={auth.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[localStyles.gradientBtnContainer, loading && { opacity: 0.5 }]}
          onPress={signInWithEmail}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.blue, "#005bb5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.gradientBtn}
          >
            <Text style={auth.filledBtnText}>{loading ? "SIGNING IN..." : "SIGN IN"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={localStyles.separatorContainer}>
        <View style={localStyles.separatorLine} />
        <Text style={localStyles.separatorText}>OR</Text>
        <View style={localStyles.separatorLine} />
      </View>

      <View style={auth.registerContainer}>
        <Text style={auth.registerText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={auth.linkText}>Register here.</Text>
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
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
