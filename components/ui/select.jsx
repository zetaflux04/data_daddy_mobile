import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const SelectContext = createContext(null);

function parseTailwindWidth(className) {
  if (!className || typeof className !== 'string') return null;
  const matchFixed = className.match(/w-\[(\d+)px\]/);
  if (matchFixed) {
    return parseInt(matchFixed[1], 10);
  }
  if (className.includes('w-full')) return '100%';
  if (className.includes('w-1/2')) return '50%';
  if (className.includes('w-1/3')) return '33.33%';
  return null;
}

export function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  onOpenChange,
  disabled = false,
  children,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || null);
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef(null);
  const [triggerLayout, setTriggerLayout] = useState(null);

  const isControlledValue = valueProp !== undefined;
  const selectedValue = isControlledValue ? valueProp : internalValue;

  const isControlledOpen = openProp !== undefined;
  const isOpen = isControlledOpen ? openProp : internalOpen;

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (!isControlledOpen) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlledOpen, onOpenChange]
  );

  const handleValueChange = useCallback(
    (nextVal) => {
      if (!isControlledValue) setInternalValue(nextVal);
      onValueChange?.(nextVal);
    },
    [isControlledValue, onValueChange]
  );

  const measureTrigger = useCallback((callback) => {
    const node = triggerRef.current;
    if (!node) return;
    if (typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => {
        if (typeof x === 'number' && typeof y === 'number') {
          const layout = { x, y, width, height };
          setTriggerLayout(layout);
          callback?.(layout);
        }
      });
    }
  }, []);

  const ctx = useMemo(
    () => ({
      value: selectedValue,
      setValue: handleValueChange,
      open: isOpen,
      setOpen: handleOpenChange,
      triggerRef,
      triggerLayout,
      measureTrigger,
      disabled,
    }),
    [selectedValue, handleValueChange, isOpen, handleOpenChange, triggerLayout, measureTrigger, disabled]
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
}

export const SelectTrigger = React.forwardRef(function SelectTrigger(
  { className, style, children, disabled: triggerDisabled, ...props },
  forwardedRef
) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('SelectTrigger must be used within a Select');

  const { open, setOpen, triggerRef, measureTrigger, disabled: rootDisabled } = ctx;
  const isDisabled = triggerDisabled || rootDisabled;

  useImperativeHandle(forwardedRef, () => ({
    open: () => {
      measureTrigger(() => setOpen(true));
    },
    close: () => setOpen(false),
  }));

  const handlePress = () => {
    if (isDisabled) return;
    if (!open) {
      measureTrigger(() => setOpen(true));
    } else {
      setOpen(false);
    }
  };

  const parsedWidth = parseTailwindWidth(className);

  return (
    <Pressable
      ref={triggerRef}
      collapsable={false}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.trigger,
        parsedWidth ? { width: parsedWidth } : null,
        isDisabled && styles.triggerDisabled,
        style,
      ]}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: open, disabled: isDisabled }}
      {...props}
    >
      <View style={styles.triggerContent}>{children}</View>
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={18}
        color="#64748B"
        style={styles.chevronIcon}
      />
    </Pressable>
  );
});

export function SelectValue({ placeholder = 'Select an option', style, className }) {
  const ctx = useContext(SelectContext);
  const value = ctx?.value;

  const display =
    typeof value === 'object' && value !== null
      ? value.label || value.value || ''
      : value || '';

  const hasValue = Boolean(display);

  return (
    <Text
      numberOfLines={1}
      style={[
        styles.valueText,
        !hasValue && styles.placeholderText,
        style,
      ]}
    >
      {hasValue ? display : placeholder}
    </Text>
  );
}

export function SelectContent({
  insets,
  className,
  style,
  children,
  sideOffset = 4,
}) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('SelectContent must be used within a Select');

  const { open, setOpen, triggerLayout, measureTrigger } = ctx;
  const [layout, setLayout] = useState(triggerLayout);

  useEffect(() => {
    if (open) {
      measureTrigger((m) => setLayout(m));
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setOpen(false);
        return true;
      });
      return () => sub.remove();
    }
  }, [open, measureTrigger, setOpen]);

  if (!open) return null;

  const screen = Dimensions.get('screen');
  const screenWidth = screen.width;
  const screenHeight = screen.height;

  const effectiveLayout = layout || triggerLayout || { x: 16, y: 100, width: 180, height: 44 };
  const parsedWidth = parseTailwindWidth(className);
  const contentWidth = parsedWidth || Math.max(effectiveLayout.width, 160);

  // Position calculation with zero status-bar gap
  const topInset = insets?.top || 0;
  const bottomInset = insets?.bottom || 0;

  const spaceBelow = screenHeight - (effectiveLayout.y + effectiveLayout.height) - bottomInset - 16;
  const spaceAbove = effectiveLayout.y - topInset - 16;

  const maxHeight = 280;
  const openUpward = spaceBelow < 120 && spaceAbove > spaceBelow;

  const menuY = openUpward
    ? Math.max(topInset + 8, effectiveLayout.y - maxHeight - sideOffset)
    : effectiveLayout.y + effectiveLayout.height + sideOffset;

  const menuX = Math.max(
    12,
    Math.min(effectiveLayout.x, screenWidth - (typeof contentWidth === 'number' ? contentWidth : 180) - 12)
  );

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      visible={open}
      onRequestClose={() => setOpen(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
        <Pressable
          style={[
            styles.content,
            {
              top: menuY,
              left: menuX,
              width: contentWidth,
              maxHeight,
            },
            style,
          ]}
          onPress={(e) => e.stopPropagation?.()}
        >
          <ScrollView
            bounces={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SelectGroup({ children, style }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

export function SelectLabel({ children, style }) {
  return <Text style={[styles.groupLabel, style]}>{children}</Text>;
}

export function SelectItem({
  value: itemValue,
  label,
  children,
  disabled = false,
  style,
}) {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('SelectItem must be used within a Select');

  const { value, setValue, setOpen } = ctx;

  const itemDisplay = label || (typeof children === 'string' ? children : String(itemValue));

  const isSelected =
    typeof value === 'object' && value !== null
      ? value.value === itemValue
      : value === itemValue;

  const handleSelect = () => {
    if (disabled) return;
    setValue({ value: itemValue, label: itemDisplay });
    setOpen(false);
  };

  return (
    <Pressable
      onPress={handleSelect}
      disabled={disabled}
      style={({ pressed }) => [
        styles.item,
        isSelected && styles.itemSelected,
        pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        style,
      ]}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
        {children || itemDisplay}
      </Text>
      {isSelected ? (
        <Ionicons name="checkmark" size={18} color={Colors.primary || '#2563EB'} />
      ) : null}
    </Pressable>
  );
}

export function SelectSeparator({ style }) {
  return <View style={[styles.separator, style]} />;
}

// Optional preview export matching the user's snippet
export function SelectPreview() {
  const fruits = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Grapes', value: 'grapes' },
    { label: 'Pineapple', value: 'pineapple' },
  ];

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent className="w-[180px]">
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {fruits.map((fruit) => (
            <SelectItem key={fruit.value} label={fruit.label} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 140,
  },
  triggerDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  triggerContent: {
    flex: 1,
    paddingRight: 6,
  },
  valueText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  content: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 16,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  group: {
    paddingVertical: 2,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemSelected: {
    backgroundColor: '#EFF6FF',
  },
  itemPressed: {
    backgroundColor: '#F1F5F9',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  itemTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
});

export default Select;
