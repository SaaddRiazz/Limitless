import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { main } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles(username, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatarPlaceholder}>
          <MaterialCommunityIcons name="account" size={24} color="#666" />
        </View>
        <Text style={styles.username}>{item.profiles?.username || "User"}</Text>
      </View>
      <Text style={styles.postText}>{item.content}</Text>
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.interactionBtn}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={20}
            color={colors.red}
          />
          <Text style={styles.interactionText}>{item.likes_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={main.container}>
      <Text style={[main.headerTitle, { marginBottom: 30, marginTop: 20 }]}>
        COMMUNITY
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#111",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatarPlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  username: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  postText: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  postFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 10,
  },
  interactionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  interactionText: { color: "#666", fontSize: 12 },
});
