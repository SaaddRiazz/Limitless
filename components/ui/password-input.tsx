import { Eye, EyeOff } from "lucide-react-native"; // Don't forget imports!
import React, { forwardRef, useState } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../styles/style"; // Using your shared styles

interface PasswordInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  ({ style, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <View style={auth.inputContainer}>
        <TextInput
          {...props}
          ref={ref}
          style={auth.input}
          placeholderTextColor="#999"
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={{ padding: 5 }}
          activeOpacity={0.7}
        >
          {isPasswordVisible ? (
            <Eye color="#fff" size={20} />
          ) : (
            <EyeOff color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

export default PasswordInput;
