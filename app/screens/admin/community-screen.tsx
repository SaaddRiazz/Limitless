import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminCommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const deletePost = (id: string) => {
    Alert.alert("Moderate Post", "Remove this post from community?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("community_posts").delete().eq("id", id);
          fetchPosts();
        },
      },
    ]);
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.username}>@{item.profiles?.username || "anonymous"}</Text>
        <TouchableOpacity onPress={() => deletePost(item.id)}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={22}
            color={colors.red}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.postText}>{item.content}</Text>
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.red} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15, textShadowColor: "rgba(255, 59, 48, 0.6)" }]}>
          MODERATION
        </Text>
      </View>
      <View style={styles.fullLine} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.red} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No community posts to moderate.</Text>
            </View>
          }
        />
      )}
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: "rgba(255, 59, 48, 0.03)",
    borderColor: "rgba(255, 59, 48, 0.12)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
  },
  username: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  postText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    fontWeight: "600",
  },
});
