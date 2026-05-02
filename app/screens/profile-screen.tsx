import { supabase } from "@/lib/supabase";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { auth, main } from "../../styles/style";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={main.container}>
      <Text style={main.headerTitle}>PROFILE</Text>

      <TouchableOpacity
        style={[auth.loginButton, { backgroundColor: "#f44336", marginTop: 40 }]}
        onPress={handleLogout}
      >
        <Text style={auth.loginText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
