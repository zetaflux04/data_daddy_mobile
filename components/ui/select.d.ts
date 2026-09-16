import * as React from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';

export type TriggerRef = {
  open: () => void;
  close: () => void;
};

export interface SelectProps {
  value?: any;
  defaultValue?: any;
  onValueChange?: (value: any) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface SelectTriggerProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  style?: StyleProp<TextStyle>;
}

export interface SelectContentProps {
  insets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  sideOffset?: number;
}

export interface SelectGroupProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface SelectLabelProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export interface SelectItemProps {
  value: any;
  label?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface SelectSeparatorProps {
  style?: StyleProp<ViewStyle>;
}

export const Select: React.FC<SelectProps>;
export const SelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<TriggerRef>>;
export const SelectValue: React.FC<SelectValueProps>;
export const SelectContent: React.FC<SelectContentProps>;
export const SelectGroup: React.FC<SelectGroupProps>;
export const SelectLabel: React.FC<SelectLabelProps>;
export const SelectItem: React.FC<SelectItemProps>;
export const SelectSeparator: React.FC<SelectSeparatorProps>;
export const SelectPreview: React.FC;

export default Select;
