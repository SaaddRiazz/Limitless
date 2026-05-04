import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { main } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

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
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.username}>{item.profiles?.username}</Text>
        <TouchableOpacity onPress={() => deletePost(item.id)}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color={colors.red}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.postText}>{item.content}</Text>
    </View>
  );

  return (
    <View style={main.container}>
      <BackButton color={colors.red} />
      <Text style={[main.headerTitle, { color: colors.red, fontSize: 20 }]}>
        MODERATION MODE
      </Text>
      {loading ? (
        <ActivityIndicator color={colors.red} />
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
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
  },
  username: { color: "#fff", fontWeight: "bold" },
  postText: { color: "#888", marginTop: 5 },
});
