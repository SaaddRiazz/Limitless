import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, logger, main } from "../../../styles/style";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const SPACING = 12;
const ITEM_SIZE = (width - 40 - (COLUMN_COUNT - 1) * SPACING) / COLUMN_COUNT;

interface ProgressPhoto {
  id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export default function PhotosLog() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("user_progress_photos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not select image");
    }
  }

  async function uploadPhoto(uri: string) {
    try {
      setUploading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      const arrayBuffer = decode(base64);

      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const storagePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("progress_photos")
        .upload(storagePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("progress_photos")
        .getPublicUrl(uploadData.path);

      const { error: dbError } = await supabase
        .from("user_progress_photos")
        .insert({
          user_id: session.user.id,
          image_url: publicUrl,
          storage_path: storagePath,
        });

      if (dbError) throw dbError;

      fetchPhotos();
      Alert.alert("Success", "Progress photo uploaded!");
    } catch (error: any) {
      console.error("Upload Error:", error.message);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: ProgressPhoto) {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to remove this progress photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.storage
                .from("progress_photos")
                .remove([photo.storage_path]);

              const { error } = await supabase
                .from("user_progress_photos")
                .delete()
                .eq("id", photo.id);

              if (error) throw error;
              fetchPhotos();
            } catch (error: any) {
              Alert.alert("Error", "Could not delete photo");
            }
          },
        },
      ],
    );
  }

  const renderPhoto = ({ item }: { item: ProgressPhoto }) => (
    <TouchableOpacity
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.8}
      style={styles.photoContainer}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.photo}
        key={item.id}
      />
    </TouchableOpacity>
  );

  const initialPhoto = photos[photos.length - 1];
  const currentPhoto = photos[0];

  return (
    <LinearGradient colors={["#020205", "#0a0a1a"]} style={styles.container}>
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <BackButton color={colors.purple} />
        <Text style={[auth.title, { paddingStart: 0, marginTop: 10, marginBottom: 15 }]}>
          GAINS GALLERY
        </Text>
      </View>
      <View style={styles.fullLine} />

      <View style={styles.headerSpacer} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#a29bfe" />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleAddPhoto}
              disabled={uploading}
              style={styles.addBtnWrapper}
            >
              <LinearGradient
                colors={["#a29bfe", "#6c5ce7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBtn}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera-plus" size={24} color="#fff" />
                    <Text style={styles.addBtnText}>ADD PROGRESS PHOTO</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No progress photos added yet.</Text>
            </View>
          }
        />
      )}

      {!loading && photos.length >= 2 && (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.compareBtnWrapper}
            onPress={() => setCompareModalVisible(true)}
          >
            <LinearGradient
              colors={["#a29bfe", "#6c5ce7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.compareBtn}
            >
              <Text style={styles.compareBtnText}>COMPARE PROGRESS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={compareModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TRANSFORMATION</Text>
              <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.compareContainer}>
              <View style={styles.compareItem}>
                <View style={styles.compareImageWrapper}>
                  <Image
                    source={{ uri: initialPhoto?.image_url }}
                    style={styles.compareImage}
                  />
                </View>
                <Text style={styles.compareLabel}>INITIAL</Text>
                <Text style={styles.dateLabel}>
                  {initialPhoto
                    ? new Date(initialPhoto.created_at).toLocaleDateString()
                    : ""}
                </Text>
              </View>

              <View style={styles.compareItem}>
                <View style={styles.compareImageWrapper}>
                  <Image
                    source={{ uri: currentPhoto?.image_url }}
                    style={styles.compareImage}
                  />
                </View>
                <Text style={styles.compareLabel}>CURRENT</Text>
                <Text style={styles.dateLabel}>
                  {currentPhoto
                    ? new Date(currentPhoto.created_at).toLocaleDateString()
                    : ""}
                </Text>
              </View>
            </View>
          </View>
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
  headerSpacer: {
    height: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  columnWrapper: {
    gap: SPACING,
    marginBottom: SPACING,
  },
  photoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  addBtnWrapper: {
    borderRadius: 15,
    shadowColor: "#a29bfe",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
    marginTop: 10,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    gap: 8,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#0a0a14",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
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
    fontStyle: "italic",
    letterSpacing: 1,
  },
  compareContainer: {
    flexDirection: "row",
    gap: 15,
  },
  compareItem: {
    flex: 1,
    alignItems: "center",
  },
  compareImageWrapper: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 15,
    backgroundColor: "#161622",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  compareImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  compareLabel: {
    color: "#a29bfe",
    fontWeight: "900",
    marginTop: 12,
    fontSize: 12,
    letterSpacing: 2,
    fontStyle: "italic",
  },
  dateLabel: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
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
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
  },
  compareBtnWrapper: {
    borderRadius: 15,
    shadowColor: "#a29bfe",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  compareBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  compareBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
