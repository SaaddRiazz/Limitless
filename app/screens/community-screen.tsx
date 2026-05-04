import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth, main } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
  liked: boolean;
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Compose modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState("");
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (data?.is_admin) setIsAdmin(true);
    }
    await fetchPosts(session?.user?.id ?? null);
  };

  const fetchPosts = async (uid: string | null) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles(username, avatar_url)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch which posts current user has liked
      let likedIds: Set<string> = new Set();
      if (uid) {
        const { data: likes } = await supabase
          .from("community_post_likes")
          .select("post_id")
          .eq("user_id", uid);
        likedIds = new Set((likes || []).map((l: any) => l.post_id));
      }

      setPosts(
        (data || []).map((p: any) => ({ ...p, liked: likedIds.has(p.id) })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const submitPost = async () => {
    if (!postText.trim()) {
      Alert.alert("Error", "Please write something before posting.");
      return;
    }
    if (!userId) return;

    setIsPosting(true);
    try {
      let imageUrl: string | null = pickedImage;

      // Only upload if pickedImage is a local file URI
      if (pickedImage && !pickedImage.startsWith("http")) {
        // Convert to blob and upload
        const response = await fetch(pickedImage);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();
        const fileName = `${userId}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("community_photos")
          .upload(fileName, arrayBuffer, { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("community_photos")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      if (editingPostId) {
        const { error } = await supabase
          .from("community_posts")
          .update({
            content: postText.trim(),
            image_url: imageUrl,
          })
          .eq("id", editingPostId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_posts").insert([
          {
            user_id: userId,
            content: postText.trim(),
            image_url: imageUrl,
            likes_count: 0,
          },
        ]);
        if (error) throw error;
      }

      closeModal();
      fetchPosts(userId);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save post.");
    } finally {
      setIsPosting(false);
    }
  };

  const closeModal = () => {
    setPostText("");
    setPickedImage(null);
    setEditingPostId(null);
    setModalVisible(false);
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post.id);
    setPostText(post.content);
    setPickedImage(post.image_url);
    setModalVisible(true);
  };

  const deletePost = async (id: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("community_posts").delete().eq("id", id);
            if (error) throw error;
            fetchPosts(userId);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Could not delete post.");
          }
        },
      },
    ]);
  };

  const toggleLike = async (post: Post) => {
    if (!userId) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked: !p.liked,
              likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p,
      ),
    );

    if (post.liked) {
      // Unlike
      await supabase
        .from("community_post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);
      await supabase
        .from("community_posts")
        .update({ likes_count: Math.max(0, post.likes_count - 1) })
        .eq("id", post.id);
    } else {
      // Like
      await supabase
        .from("community_post_likes")
        .insert([{ post_id: post.id, user_id: userId }]);
      await supabase
        .from("community_posts")
        .update({ likes_count: post.likes_count + 1 })
        .eq("id", post.id);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {item.profiles?.avatar_url ? (
            <Image
              source={{ uri: item.profiles.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={24} color="#666" />
            </View>
          )}
          <View>
            <Text style={styles.username}>
              {item.profiles?.username || "User"}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(item.user_id === userId || isAdmin) && (
            <TouchableOpacity onPress={() => startEdit(item)}>
              <MaterialCommunityIcons name="pencil" size={20} color="#888" />
            </TouchableOpacity>
          )}
          {(item.user_id === userId || isAdmin) && (
            <TouchableOpacity onPress={() => deletePost(item.id)}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.red} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.postText}>{item.content}</Text>

      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => toggleLike(item)}
        >
          <MaterialCommunityIcons
            name={item.liked ? "heart" : "heart-outline"}
            size={20}
            color={item.liked ? colors.red : colors.red}
          />
          <Text
            style={[
              styles.interactionText,
              item.liked && { color: colors.red },
            ]}
          >
            {item.likes_count || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={main.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          marginTop: 10,
        }}
      >
        <Text style={[main.headerTitle, { marginBottom: 0 }]}>COMMUNITY</Text>
        <TouchableOpacity
          style={styles.composeBtn}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                marginTop: 50,
              }}
            >
              No posts yet. Be the first to share!
            </Text>
          }
        />
      )}

      {/* Compose Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPostId ? "Edit Post" : "New Post"}</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Share your progress, tips or motivation..."
              placeholderTextColor="#444"
              value={postText}
              onChangeText={setPostText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            {pickedImage ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: pickedImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setPickedImage(null)}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.attachImageBtn}
                onPress={pickImage}
              >
                <MaterialCommunityIcons
                  name="image-plus"
                  size={20}
                  color={colors.blue}
                />
                <Text style={{ color: colors.blue, marginLeft: 8 }}>
                  Attach Image
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                auth.filledBtn,
                { marginTop: 15 },
                isPosting && { opacity: 0.6 },
              ]}
              onPress={submitPost}
              disabled={isPosting}
            >
              {isPosting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={auth.filledBtnText}>POST</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  composeBtn: {
    backgroundColor: colors.blue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    backgroundColor: "#111",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  username: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  timestamp: { color: "#555", fontSize: 11, marginTop: 1 },
  postText: { color: "#ccc", fontSize: 14, lineHeight: 20, marginBottom: 10 },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postFooter: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 10,
  },
  interactionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  interactionText: { color: "#666", fontSize: 13 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#222",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  textArea: {
    backgroundColor: "#111",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222",
    padding: 15,
    color: "#fff",
    fontSize: 15,
    minHeight: 120,
    marginBottom: 15,
  },
  attachImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${colors.blue}60`,
    borderRadius: 10,
    padding: 12,
    backgroundColor: `${colors.blue}10`,
    marginBottom: 5,
  },
  previewContainer: { position: "relative", marginBottom: 10 },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 11,
  },
});
