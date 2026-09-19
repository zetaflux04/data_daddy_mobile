import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const DropdownHostContext = createContext(null);
const FIELD_FALLBACK_HEIGHT = 44;
const MENU_GAP = 4;

export function DropdownHost({ children, style, insideModal = false }) {
  let colors = null;
  let isDark = false;
  try {
    const theme = useTheme();
    colors = theme.colors;
    isDark = theme.isDark;
  } catch {
    // fallback
  }

  const pathname = usePathname();
  const parentHost = useContext(DropdownHostContext);
  const isInsideModal = Boolean(insideModal || parentHost);
  const sessionRef = useRef(null);
  const [session, setSession] = useState(null);

  const close = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return;
    sessionRef.current = null;
    setSession(null);
    current.onClose?.();
  }, []);

  const placeMenu = useCallback((payload) => {
    const trigger = payload?.triggerRef?.current;
    if (!trigger) return;

    trigger.measureInWindow((x, y, width, height) => {
      if (!sessionRef.current) return;
      if (typeof x !== 'number' || typeof y !== 'number') return;

      const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

      // In React Native with statusBarTranslucent={true} on the Modal, coordinates from
      // trigger.measureInWindow(x, y, ...) are already aligned to the translucent Modal's (0, 0)
      // coordinate space. Adding StatusBar.currentHeight caused an artificial vertical gap in built APKs.
      const fieldHeight = height > 12 ? height : FIELD_FALLBACK_HEIGHT;

      const fieldTopOnScreen = y;
      const fieldBottomOnScreen = fieldTopOnScreen + fieldHeight;

      // Available vertical space (leave 20dp margin at screen edges)
      const spaceBelow = screenHeight - fieldBottomOnScreen - 20;
      const spaceAbove = fieldTopOnScreen - 20;

      // Estimate needed menu height based on item count
      const itemCount = payload?.itemCount || sessionRef.current?.itemCount || 4;
      const neededHeight = Math.min(260, Math.max(90, itemCount * 46 + 10));

      let menuY;
      let calculatedMaxHeight = 260;

      // If space below is not enough for the items, and there is more space above:
      // Open upward directly above / over the select box!
      if (spaceBelow < neededHeight && spaceAbove > spaceBelow) {
        calculatedMaxHeight = Math.min(neededHeight, Math.max(90, spaceAbove - MENU_GAP));
        menuY = fieldTopOnScreen - calculatedMaxHeight - MENU_GAP;
      } else {
        // Standard case: open directly below the select box
        calculatedMaxHeight = Math.min(260, Math.max(90, spaceBelow));
        menuY = fieldBottomOnScreen + MENU_GAP;
      }

      const menuWidth = Math.min(Math.max(width, 140), screenWidth - 24);
      const menuX = Math.max(12, Math.min(x, screenWidth - menuWidth - 12));

      const nextAnchor = {
        x: menuX,
        y: Math.max(8, menuY),
        width: menuWidth,
        maxHeight: calculatedMaxHeight,
      };

      setSession((prev) => {
        if (!prev) return prev;
        const next = { ...prev, anchor: nextAnchor };
        sessionRef.current = next;
        return next;
      });
    });
  }, [isInsideModal]);

  const updateRender = useCallback((render) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, render };
      sessionRef.current = next;
      return next;
    });
  }, []);

  const open = useCallback((payload) => {
    const previous = sessionRef.current;
    if (previous) previous.onClose?.();

    Keyboard.dismiss();
    const next = {
      render: payload.render,
      onClose: payload.onClose,
      triggerRef: payload.triggerRef,
      itemCount: payload.itemCount,
      anchor: null,
    };
    sessionRef.current = next;
    setSession(next);
    setTimeout(() => placeMenu(payload), 16);
    setTimeout(() => placeMenu(payload), 100);
  }, [placeMenu]);

  useEffect(() => {
    if (!session) return undefined;
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, close);
    return () => sub.remove();
  }, [session, close]);

  useEffect(() => {
    if (!session) return undefined;
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subHide = Keyboard.addListener(hideEvent, () => {
      if (sessionRef.current?.triggerRef) {
        placeMenu(sessionRef.current);
      }
    });
    return () => subHide.remove();
  }, [session, placeMenu]);

  const pathRef = useRef(pathname);
  useEffect(() => {
    if (pathRef.current !== pathname) {
      pathRef.current = pathname;
      close();
    }
  }, [pathname, close]);

  const value = useMemo(
    () => ({ open, close, updateRender, isOpen: !!session }),
    [open, close, updateRender, session]
  );

  return (
    <DropdownHostContext.Provider value={value}>
      <View collapsable={false} style={[styles.host, style]}>
        {children}
        <Modal
          visible={!!session}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={close}
        >
          <Pressable style={styles.overlayRoot} onPress={close}>
            {session?.anchor ? (
              <Pressable
                style={[
                  styles.menu,
                  {
                    backgroundColor: colors?.cardElevated || (isDark ? '#202C33' : '#FFFFFF'),
                    borderColor: colors?.border || (isDark ? '#202C33' : '#CBD5E1'),
                    left: session.anchor.x,
                    top: session.anchor.y,
                    width: session.anchor.width,
                    ...(session.anchor.maxHeight ? { maxHeight: session.anchor.maxHeight } : {}),
                  },
                ]}
                onPress={(e) => e.stopPropagation?.()}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  style={[
                    styles.menuScroll,
                    session.anchor.maxHeight ? { maxHeight: session.anchor.maxHeight } : null,
                  ]}
                  bounces={false}
                >
                  {session.render(close)}
                </ScrollView>
              </Pressable>
            ) : null}
          </Pressable>
        </Modal>
      </View>
    </DropdownHostContext.Provider>
  );
}

export function useDropdownHost() {
  return useContext(DropdownHostContext);
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  overlayRoot: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.01)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    maxHeight: 260,
  },
  menuScroll: {
    maxHeight: 260,
  },
});

