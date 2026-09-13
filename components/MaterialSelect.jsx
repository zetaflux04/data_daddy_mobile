import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import { useDropdownHost } from './DropdownHost';

function normalizeOptions(options) {
  return (options || []).map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? { value: opt, label: String(opt) }
      : opt
  );
}

/**
 * Material outlined Select — attached dropdown under the field.
 */
export function MaterialSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  required,
  error,
  disabled,
  style,
  inputStyle,
  displayValue,
}) {
  const host = useDropdownHost();
  const triggerRef = useRef(null);
  const openRef = useRef(false);
  const ignoreUntilRef = useRef(0);
  const [open, setOpen] = useState(false);
  const normalized = normalizeOptions(options);
  const selected = normalized.find((o) => o.value === value);
  const display = displayValue != null ? displayValue : (selected?.label || '');
  const displayLabel = label ? `${label}${required ? ' *' : ''}` : undefined;

  const markClosed = () => {
    ignoreUntilRef.current = Date.now() + 500;
    openRef.current = false;
    setOpen(false);
  };

  const closeMenu = () => {
    host?.close();
    markClosed();
  };

  const renderMenu = (dismiss) =>
    normalized.map((opt) => {
      const isSelected = opt.value === value;
      return (
        <Pressable
          key={String(opt.value)}
          style={[styles.menuItem, isSelected && styles.menuItemSelected]}
          onPress={() => {
            onChange(opt.value, opt);
            dismiss();
          }}
        >
          <View style={styles.menuItemTextWrap}>
            <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
              {opt.label}
            </Text>
            {opt.subtitle ? <Text style={styles.menuItemSub}>{opt.subtitle}</Text> : null}
          </View>
          {isSelected ? (
            <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
          ) : null}
        </Pressable>
      );
    });

  const toggle = () => {
    if (disabled) return;
    if (Date.now() < ignoreUntilRef.current) return;
    if (openRef.current) {
      closeMenu();
      return;
    }
    if (!host) return;
    openRef.current = true;
    setOpen(true);
    host.open({
      triggerRef,
      itemCount: normalized.length,
      onClose: markClosed,
      render: renderMenu,
    });
  };

  return (
    <View ref={triggerRef} collapsable={false} style={[styles.container, style]}>
      <Pressable disabled={disabled} onPress={toggle}>
        <View style={styles.pointerNone}>
          <TextInput
            mode="outlined"
            dense
            label={displayLabel}
            value={display}
            placeholder={placeholder}
            editable={false}
            error={!!error}
            right={<TextInput.Icon icon={open ? 'menu-up' : 'menu-down'} />}
            style={[styles.input, inputStyle]}
            outlineStyle={styles.outline}
          />
        </View>
      </Pressable>
      {error && typeof error === 'string' ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  pointerNone: {
    pointerEvents: 'none',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  outline: {
    borderRadius: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  menuItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  menuItemTextWrap: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: '#0F172A',
  },
  menuItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  menuItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default MaterialSelect;
