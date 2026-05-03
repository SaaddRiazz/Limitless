import { supabase } from "./supabase";

export const XP_VALUES = {
  WATER_LOG: 10,
  WEIGHT_LOG: 20,
  MEAL_LOG: 15,
  WORKOUT_COMPLETE: 100,
};

const XP_PER_LEVEL = 2000;

export async function addXP(amount: number) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // Fetch current XP and Level
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    let newXP = (profile?.xp || 0) + amount;
    let newLevel = profile?.level || 1;

    // Calculate level increase
    while (newXP >= XP_PER_LEVEL) {
      newXP -= XP_PER_LEVEL;
      newLevel += 1;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level: newLevel
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return { newXP, newLevel };
  } catch (error) {
    console.error("Error adding XP:", error);
    return null;
  }
}
