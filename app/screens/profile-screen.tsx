import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { getXPForLevel } from "@/lib/xp-service";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../styles/style";
import { useRouter } from "expo-router";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const nextLevelXP = getXPForLevel(level);
  const progressPercent = Math.min(Math.max((xp / nextLevelXP) * 100, 0), 100);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  useEffect(() => {
    if (!loading) {
      Animated.timing(animatedWidth, {
        toValue: progressPercent,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    }
  }, [progressPercent, loading]);

  async function getProfile() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url, xp, level`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching profile:", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);
      setMessage(null);

      const trimmedUsername = username.trim();
      if (trimmedUsername.length > 0 && trimmedUsername.length < 3) {
        throw new Error("Username must be at least 3 characters long.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Session expired. Please log in again.");

      const updates = {
        id: user.id,
        username: trimmedUsername || null,
        avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: "id" })
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "The update was accepted but no rows were changed. Check your RLS policies!",
        );
      }

      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Update Error:", error);
      if (error instanceof Error) {
        setMessage({ text: error.message, type: "error" });
        Alert.alert("Update Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error picking image", "An unexpected error occurred.");
    }
  }

  async function uploadAvatar(uri: string) {
    try {
      setUploading(true);
      setMessage(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("No user session found. Please log in again.");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      const arrayBuffer = decode(base64);

      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(path, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data.path);

      setAvatarUrl(publicUrl);
      await updateProfile({ username, avatar_url: publicUrl });
    } catch (error) {
      console.error("Upload Error:", error);
      if (error instanceof Error) {
        setMessage({ text: error.message, type: "error" });
        Alert.alert("Upload Failed", error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading && !username && !avatarUrl) {
    return (
      <LinearGradient colors={["#020205", "#0a0a1a"]} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2196F3" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          PROFILE
        </Text>
      </View>
      <View style={styles.fullLine} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploading} activeOpacity={0.9}>
            <View style={styles.avatarWrapper}>
              {uploading ? (
                <ActivityIndicator color="#2196F3" />
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <View style={styles.placeholderWrapper}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Upgraded Level/XP card */}
        <View style={styles.levelCard}>
          <LinearGradient
            colors={["rgba(33, 150, 243, 0.15)", "rgba(0, 0, 0, 0.8)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 25 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18, letterSpacing: 1 }}>LEVEL {level}</Text>
              <Text style={{ color: "#2196F3", fontWeight: "bold", fontSize: 14 }}>{xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</Text>
            </View>
            <View style={{ height: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 4, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
              <Animated.View
                style={[
                  { height: "100%", backgroundColor: "#2196F3", borderRadius: 4 },
                  {
                    width: animatedWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Username Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Set your username"
            placeholderTextColor="rgba(255,255,255,0.25)"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.saveBtnWrapper, (loading || uploading) && { opacity: 0.5 }]}
          onPress={() => updateProfile({ username, avatar_url: avatarUrl })}
          disabled={loading || uploading}
        >
          <LinearGradient
            colors={["#007AFF", "#003b82"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {loading && <ActivityIndicator color="#fff" size="small" />}
              <Text style={styles.btnText}>SAVE PROFILE</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Success/Error Message */}
        {message && (
          <View style={{ marginTop: 15, alignItems: "center" }}>
            <Text
              style={{
                color: message.type === "success" ? "#4CAF50" : "#F44336",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {message.text}
            </Text>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.logoutBtnWrapper}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={["#ff3b30", "#8e0a0a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutBtn}
          >
            <Text style={styles.btnText}>LOGOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#161622",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
    overflow: "hidden",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  placeholderWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  levelCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.25)",
    overflow: "hidden",
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#161622",
    color: "#fff",
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 10,
  },
  saveBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logoutBtnWrapper: {
    borderRadius: 15,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 10,
  },
  logoutBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});
