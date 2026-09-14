import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Colors } from '../constants/Colors';

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
  outlineColor = '#CBD5E1',
  activeOutlineColor,
  outlineStyle,
  ...rest
}, ref) => {
  const displayLabel = label
    ? `${label}${required ? ' *' : ''}`
    : undefined;
  const lines = maxRows || (multiline ? Math.max(numberOfLines, 3) : numberOfLines);

  const left =
    startAdornment == null
      ? undefined
      : typeof startAdornment === 'string'
        ? (
          <TextInput.Affix
            text={startAdornment}
            textStyle={styles.affixText}
          />
        )
        : startAdornment;

  const right =
    endAdornment == null
      ? undefined
      : typeof endAdornment === 'string'
        ? <TextInput.Affix text={endAdornment} />
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
        multiline={multiline}
        numberOfLines={multiline ? lines : 1}
        error={!!error}
        outlineColor={outlineColor}
        activeOutlineColor={error ? undefined : (activeOutlineColor || '#64748B')}
        cursorColor={Colors.primary}
        selectionColor="rgba(37, 99, 235, 0.25)"
        left={left}
        right={right}
        style={[
          styles.input,
          multiline && { minHeight: 76 },
        ]}
        contentStyle={[
          multiline ? styles.multilineContent : undefined,
          inputStyle,
        ]}
        outlineStyle={[
          styles.outline,
          !error && styles.outlineNormal,
          outlineStyle,
        ]}
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
    borderRadius: 4,
    overflow: 'visible',
  },
  outlineNormal: {
    borderColor: '#CBD5E1',
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
