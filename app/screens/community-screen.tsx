import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { auth } from "@/styles/style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
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
      )
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
    <LinearGradient
      colors={["rgba(255, 255, 255, 0.05)", "rgba(0, 0, 0, 0.4)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.postCard}
    >
      <View style={styles.postHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {item.profiles?.avatar_url ? (
            <Image
              source={{ uri: item.profiles.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={22} color={colors.blue} />
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
        <View style={{ flexDirection: "row", gap: 15 }}>
          {(item.user_id === userId || isAdmin) && (
            <TouchableOpacity onPress={() => startEdit(item)}>
              <MaterialCommunityIcons name="pencil" size={20} color="rgba(255, 255, 255, 0.4)" />
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
            color={item.liked ? colors.red : "rgba(255, 255, 255, 0.4)"}
            style={item.liked ? {
              textShadowColor: "rgba(255, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            } : undefined}
          />
          <Text
            style={[
              styles.interactionText,
              item.liked && {
                color: colors.red,
                textShadowColor: "rgba(255, 0, 0, 0.5)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 6,
              },
            ]}
          >
            {item.likes_count || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
          paddingRight: 20,
        }}
      >
        <Text style={[auth.title, { marginBottom: 0 }]}>COMMUNITY</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.composeBtnWrapper}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={["#2196F3", "#005bb5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.composeBtn}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.fullLine} />

      {loading ? (
        <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
            </View>
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
          <LinearGradient
            colors={["#0c0c1e", "#020205"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingPostId ? "EDIT POST" : "NEW POST"}</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textArea}
              placeholder="Share your progress, tips or motivation..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
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
                activeOpacity={0.8}
                style={styles.attachImageBtnWrapper}
                onPress={pickImage}
              >
                <LinearGradient
                  colors={["rgba(33, 150, 243, 0.15)", "rgba(33, 150, 243, 0.02)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.attachImageBtn}
                >
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={20}
                    color={colors.blue}
                  />
                  <Text style={{ color: colors.blue, marginLeft: 8, fontWeight: "900", letterSpacing: 0.5 }}>
                    ATTACH IMAGE
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.postSubmitBtnWrapper,
                isPosting && { opacity: 0.6 },
              ]}
              onPress={submitPost}
              disabled={isPosting}
            >
              <LinearGradient
                colors={["#2196F3", "#005bb5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postSubmitBtn}
              >
                {isPosting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.postSubmitBtnText}>POST</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
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
  composeBtnWrapper: {
    borderRadius: 20,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  composeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  postCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(33, 150, 243, 0.6)",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0d0d1a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(33, 150, 243, 0.4)",
  },
  username: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },
  postText: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14, lineHeight: 22, marginBottom: 15 },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  postFooter: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 12,
  },
  interactionBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  interactionText: { color: "rgba(255, 255, 255, 0.5)", fontSize: 13, fontWeight: "700" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
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
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
    fontStyle: "italic",
  },
  textArea: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 15,
    color: "#fff",
    fontSize: 15,
    minHeight: 120,
    marginBottom: 15,
  },
  attachImageBtnWrapper: {
    borderRadius: 15,
    marginBottom: 12,
    overflow: "hidden",
  },
  attachImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)",
    borderRadius: 15,
    padding: 14,
  },
  previewContainer: { position: "relative", marginBottom: 10 },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 15,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 11,
  },
  postSubmitBtnWrapper: {
    marginTop: 10,
    borderRadius: 15,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  postSubmitBtn: {
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  postSubmitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.03)",
    borderStyle: "dashed",
    marginTop: 20,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 14,
    fontWeight: "600",
  },
});
