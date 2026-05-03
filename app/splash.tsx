import { useAuth } from "@/context/auth";
import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const progress = useSharedValue(0);

  useEffect(() => {
    // 1. Trigger Animations
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
    progress.value = withDelay(400, withTiming(1, { duration: 2000 }));

    // 2. Navigation Timer
    const timeout = setTimeout(() => {
      // Only navigate once auth state is finished loading
      if (!isLoading) {
        if (session) {
          // If logged in, go to main App
          router.replace("/App");
        } else {
          // If not logged in, go to Sign In
          router.replace("/sign-in");
        }
      }
    }, 2800); // Slightly longer than the progress animation

    return () => clearTimeout(timeout);
  }, [isLoading, session]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { scaleX: 1.35 }, // Your strict logo style
    ],
  }));

  const loadingBarStyle = useAnimatedStyle(() => ({
    // Type-safe width for Reanimated
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, logoAnimatedStyle]}>
          LIMITLESS
        </Animated.Text>

        <Animated.View
          style={[
            styles.underline,
            useAnimatedStyle(() => ({
              transform: [{ scaleX: progress.value }],
              opacity: progress.value,
            })),
          ]}
        />

        <Animated.Text
          style={[
            styles.tagline,
            useAnimatedStyle(() => ({ opacity: logoOpacity.value })),
          ]}
        >
          NO EXCUSES. NO BOUNDARIES.
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.loadingBarContainer}>
          <Animated.View style={[styles.loadingBar, loadingBarStyle]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 4,
    fontStyle: "italic",
    textShadowColor: "rgba(33, 150, 243, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
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
    color: "#444",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 5,
    marginTop: 20,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    width: "40%",
  },
  loadingBarContainer: {
    height: 2,
    width: "100%",
    backgroundColor: "#111",
    borderRadius: 1,
    overflow: "hidden",
  },
  loadingBar: {
    height: "100%",
    backgroundColor: colors.blue,
  },
});
