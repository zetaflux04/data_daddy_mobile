import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
 * Material outlined Select.
 * Corresponds to MUI FormControl + InputLabel + Select + MenuItem.
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
  variant = 'modal',
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const triggerRef = useRef(null);
  const overlayRootRef = useRef(null);
  const normalized = normalizeOptions(options);
  const selected = normalized.find((o) => o.value === value);
  const display = displayValue != null ? displayValue : (selected?.label || '');
  const displayLabel = label ? `${label}${required ? ' *' : ''}` : undefined;
  const isInline = variant === 'dropdown';

  const placeDropdown = () => {
    const overlayNode = overlayRootRef.current;
    const triggerNode = triggerRef.current;
    if (!overlayNode || !triggerNode) return;
    overlayNode.measureInWindow((ox, oy) => {
      triggerNode.measureInWindow((x, y, width, height) => {
        setAnchor({
          x: x - ox,
          y: y - oy + height,
          width: Math.max(width, 120),
        });
      });
    });
  };

  const renderOptions = (itemStyle) =>
    normalized.map((opt) => {
      const isSelected = opt.value === value;
      return (
        <Pressable
          key={String(opt.value)}
          style={[itemStyle, isSelected && styles.menuItemSelected]}
          onPress={() => {
            onChange(opt.value, opt);
            setOpen(false);
            setAnchor(null);
          }}
        >
          <View style={styles.menuItemTextWrap}>
            <Text style={[styles.menuItemText, isSelected && styles.menuItemTextSelected]}>
              {opt.label}
            </Text>
            {opt.subtitle ? (
              <Text style={styles.menuItemSub}>{opt.subtitle}</Text>
            ) : null}
          </View>
          {isSelected ? (
            <MaterialCommunityIcons name="check" size={20} color={Colors.primary} />
          ) : null}
        </Pressable>
      );
    });

  return (
    <View style={[styles.container, style]} ref={triggerRef} collapsable={false}>
      <Pressable
        disabled={disabled}
        onPress={() => {
          if (isInline) {
            if (open) {
              setOpen(false);
              setAnchor(null);
              return;
            }
            setAnchor(null);
            setOpen(true);
            return;
          }
          setOpen(true);
        }}
      >
        <View style={styles.pointerNone}>
          <TextInput
            mode="outlined"
            dense
            label={displayLabel}
            value={display}
            placeholder={placeholder}
            editable={false}
            error={!!error}
            right={<TextInput.Icon icon={open && isInline ? 'menu-up' : 'menu-down'} />}
            style={[styles.input, inputStyle]}
            outlineStyle={styles.outline}
          />
        </View>
      </Pressable>
      {error && typeof error === 'string' ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {isInline ? (
        <Modal
          visible={open}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => {
            setOpen(false);
            setAnchor(null);
          }}
        >
          <View
            ref={overlayRootRef}
            collapsable={false}
            style={styles.dropdownLayer}
            onLayout={() => {
              requestAnimationFrame(placeDropdown);
            }}
          >
            <Pressable
              style={styles.dropdownDismiss}
              onPress={() => {
                setOpen(false);
                setAnchor(null);
              }}
            />
            {anchor ? (
              <View
                style={[
                  styles.anchoredMenu,
                  {
                    top: anchor.y,
                    left: anchor.x,
                    width: anchor.width,
                  },
                ]}
              >
                {renderOptions(styles.inlineMenuItem)}
              </View>
            ) : null}
          </View>
        </Modal>
      ) : null}

      {!isInline ? (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <Pressable style={styles.menuCard} onPress={(e) => e.stopPropagation?.()}>
              {label ? <Text style={styles.menuTitle}>{label}</Text> : null}
              <ScrollView
                style={{ maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP }}
                keyboardShouldPersistTaps="handled"
              >
                {renderOptions(styles.menuItem)}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  dropdownLayer: {
    flex: 1,
  },
  dropdownDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  anchoredMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  inlineMenuItem: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  menuItem: {
    minHeight: ITEM_HEIGHT,
    paddingHorizontal: 16,
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
});

export default MaterialSelect;
