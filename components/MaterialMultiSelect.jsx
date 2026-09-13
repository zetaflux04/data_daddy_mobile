import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { TextInput, Checkbox } from 'react-native-paper';
import { Colors } from '../constants/Colors';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

function normalizeOptions(options) {
  return (options || []).map((opt) =>
    typeof opt === 'string' || typeof opt === 'number'
      ? { value: opt, label: String(opt) }
      : opt
  );
}

/**
 * Material outlined multi-select with checkboxes.
 * Corresponds to MUI Select multiple + checkbox MenuItems.
 */
export function MaterialMultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder,
  required,
  error,
  disabled,
  style,
  inputStyle,
  renderValue,
}) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];
  const normalized = normalizeOptions(options);
  const selectedLabels = normalized
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label);
  const display =
    renderValue
      ? renderValue(selectedLabels)
      : selectedLabels.join(', ');
  const displayLabel = label ? `${label}${required ? ' *' : ''}` : undefined;

  const toggle = (optValue) => {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable disabled={disabled} onPress={() => setOpen(true)}>
        <View style={styles.pointerNone}>
          <TextInput
            mode="outlined"
            dense
            label={displayLabel}
            value={display}
            placeholder={placeholder}
            editable={false}
            error={!!error}
            right={<TextInput.Icon icon="menu-down" />}
            style={[styles.input, inputStyle]}
            outlineStyle={styles.outline}
          />
        </View>
      </Pressable>
      {error && typeof error === 'string' ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.menuCard} onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.menuHeader}>
              {label ? <Text style={styles.menuTitle}>{label}</Text> : <View />}
              {selected.length > 0 ? (
                <Pressable onPress={() => onChange([])}>
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
            <ScrollView
              style={{ maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP }}
              keyboardShouldPersistTaps="handled"
            >
              {normalized.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <Pressable
                    key={String(opt.value)}
                    style={[styles.menuItem, isSelected && styles.menuItemSelected]}
                    onPress={() => toggle(opt.value)}
                  >
                    <Checkbox
                      status={isSelected ? 'checked' : 'unchecked'}
                      color={Colors.primary}
                    />
                    <View style={styles.menuItemTextWrap}>
                      <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
                        {opt.label}
                      </Text>
                      {opt.subtitle ? (
                        <Text style={styles.menuItemSub}>{opt.subtitle}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable style={styles.doneBtn} onPress={() => setOpen(false)}>
              <Text style={styles.doneBtnText}>
                {selected.length === 0 ? 'Done' : `Done (${selected.length} selected)`}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  clearText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
  },
  menuItem: {
    minHeight: ITEM_HEIGHT,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
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
  doneBtn: {
    margin: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MaterialMultiSelect;
