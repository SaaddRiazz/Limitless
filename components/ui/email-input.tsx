import React, { forwardRef } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { auth } from "../../styles/style";

interface EmailInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const EmailInput = forwardRef<TextInput, EmailInputProps>(
  ({ value, onChangeText, ...props }, ref) => {
    return (
      <View style={auth.inputContainer}>
        <TextInput
          ref={ref}
          style={auth.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    );
  },
);

export default EmailInput;
