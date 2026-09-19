import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';

/**
 * Material outlined TextField (React Native Paper).
 * Corresponds to: <TextField variant="outlined" label="..." />
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
  maxRows,
  style,
  inputStyle,
  required,
  dense = true,
  outlineColor,
  activeOutlineColor,
  outlineStyle,
  ...rest
}, ref) => {
  let isDark = false;
  let colors = null;
  try {
    const theme = useTheme();
    isDark = theme.isDark;
    colors = theme.colors;
  } catch {
    // fallback if outside ThemeProvider
  }

  const displayLabel = label
    ? `${label}${required ? ' *' : ''}`
    : undefined;
  const lines = maxRows || (multiline ? Math.max(numberOfLines, 3) : numberOfLines);

  const defaultOutlineColor = isDark ? '#2A3942' : '#CBD5E1';
  const defaultActiveOutline = isDark ? '#60A5FA' : Colors.primary;
  const inputBgColor = isDark ? '#202C33' : '#FFFFFF';
  const textColor = isDark ? '#E9EDEF' : '#0F172A';
  const placeholderColor = isDark ? '#8696A0' : '#94A3B8';

  const left =
    startAdornment == null
      ? undefined
      : typeof startAdornment === 'string'
        ? (
          <TextInput.Affix
            text={startAdornment}
            textStyle={[styles.affixText, isDark && { color: '#8696A0' }]}
          />
        )
        : startAdornment;

  const right =
    endAdornment == null
      ? undefined
      : typeof endAdornment === 'string'
        ? <TextInput.Affix text={endAdornment} textStyle={isDark ? { color: '#8696A0' } : undefined} />
        : endAdornment;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={ref}
        mode="outlined"
        dense={dense}
        label={displayLabel}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        textColor={textColor}
        multiline={multiline}
        numberOfLines={multiline ? lines : 1}
        error={!!error}
        outlineColor={outlineColor || defaultOutlineColor}
        activeOutlineColor={error ? undefined : (activeOutlineColor || defaultActiveOutline)}
        cursorColor={isDark ? '#60A5FA' : Colors.primary}
        selectionColor={isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.25)'}
        left={left}
        right={right}
        style={[
          styles.input,
          { backgroundColor: inputBgColor },
          multiline && { minHeight: 76 },
        ]}
        contentStyle={[
          multiline ? styles.multilineContent : undefined,
          { color: textColor },
          inputStyle,
        ]}
        outlineStyle={[
          styles.outline,
          !error && { borderColor: outlineColor || defaultOutlineColor },
          outlineStyle,
        ]}
        theme={{
          colors: {
            onSurfaceVariant: isDark ? '#8696A0' : '#64748B',
            text: textColor,
            background: inputBgColor,
            primary: isDark ? '#60A5FA' : Colors.primary,
          },
        }}
        {...rest}
      />
      {error && typeof error === 'string' ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
});

OutlinedTextInput.displayName = 'OutlinedTextInput';

export const MaterialTextField = OutlinedTextInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  outline: {
    borderRadius: 8,
    overflow: 'visible',
    borderWidth: 1,
  },
  affixText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  multilineContent: {
    paddingTop: 12,
  },
});

export default OutlinedTextInput;
