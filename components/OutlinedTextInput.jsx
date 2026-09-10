import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Material UI Outlined TextField clone for React Native
 * Corresponds to: <TextField id="..." label="..." variant="outlined" />
 */
export const OutlinedTextInput = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  startAdornment,
  endAdornment,
  error,
  multiline,
  numberOfLines = 1,
  style,
  inputStyle,
  onFocus,
  onBlur,
  required,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          multiline && { minHeight: 76, alignItems: 'flex-start' },
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {startAdornment && (
          <View style={[styles.adornmentStart, multiline && { marginTop: 10 }]}>
            {typeof startAdornment === 'string' ? (
              <Text style={styles.adornmentText}>{startAdornment}</Text>
            ) : (
              startAdornment
            )}
          </View>
        )}

        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...rest}
        />

        {endAdornment && (
          <View style={[styles.adornmentEnd, multiline && { marginTop: 10 }]}>
            {typeof endAdornment === 'string' ? (
              <Text style={styles.adornmentText}>{endAdornment}</Text>
            ) : (
              endAdornment
            )}
          </View>
        )}
      </View>

      {error && typeof error === 'string' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

OutlinedTextInput.displayName = 'OutlinedTextInput';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1', // Outlined border
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary || '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 10,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 10,
  },
  adornmentStart: {
    marginRight: 8,
    justifyContent: 'center',
  },
  adornmentEnd: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  adornmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default OutlinedTextInput;
