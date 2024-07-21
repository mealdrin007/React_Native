import React, { Ref } from 'react';
import { TextInput, View, TextInputProps, KeyboardTypeOptions, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';

interface AuthTextInputProps extends TextInputProps {
  placeholder?: string,
  value?: string,
  kType?: KeyboardTypeOptions;
  boolSecureTextEntry?: boolean;
  onChange?: (text: any) => void;
  errorMessage?: string;
  errorStatus?: boolean;
  textInputWidth?: number | string | null;
  refs?: Ref<TextInput>;
  returnKey?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmit?: () => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void | undefined;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  height?: number;
  width?: number | string;
  maxLength?: number;
  onEndEditing?: () => void;
  placeholderTextColor?: string;
  justifyContent?: string
  defaultValue?: string
}


const AuthTextInput: React.FC<AuthTextInputProps> = ({
  placeholder,
  value,
  keyboardType,
  secureTextEntry,
  onChange,
  refs,
  returnKey,
  onSubmit,
  onBlur,
  onChangeText,
  autoFocus,
  numberOfLines,
  multiline,
  textAlignVertical,
  editable,
  maxLength,
  onEndEditing,
  style,
  placeholderTextColor,
  defaultValue
}) => (
  <View>
    <TextInput
      placeholder={placeholder}
      ref={refs}
      value={value}
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      autoCapitalize="none"
      keyboardType={keyboardType}
      style={style}
      returnKeyType={returnKey}
      onSubmitEditing={onSubmit}
      autoFocus={autoFocus}
      numberOfLines={numberOfLines}
      multiline={multiline}
      textAlignVertical={textAlignVertical}
      onEndEditing={onEndEditing}
      editable={editable}
      maxLength={maxLength}
      placeholderTextColor={placeholderTextColor}
      defaultValue={defaultValue}
    />
  </View>
);

export default AuthTextInput;
