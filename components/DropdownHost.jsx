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

const DropdownHostContext = createContext(null);
const FIELD_FALLBACK_HEIGHT = 44;
const MENU_GAP = 4;

export function DropdownHost({ children, style }) {
  const pathname = usePathname();
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

      // On Android, Modal with statusBarTranslucent starts at y = 0 of the physical screen.
      // However, trigger.measureInWindow() measures relative to the Activity window (below the status bar).
      // We must add StatusBar.currentHeight to align window coordinates to the translucent Modal.
      const statusBarOffset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
      const fieldHeight = height > 12 ? height : FIELD_FALLBACK_HEIGHT;

      const fieldTopOnScreen = y + statusBarOffset;
      const fieldBottomOnScreen = fieldTopOnScreen + fieldHeight;

      // Available vertical space
      const spaceBelow = screenHeight - fieldBottomOnScreen - 16;
      const spaceAbove = fieldTopOnScreen - 16;

      let menuY;
      let calculatedMaxHeight = 260;

      // If severely cramped below (< 160dp) but significantly more space above, open upward
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        calculatedMaxHeight = Math.min(260, Math.max(100, spaceAbove - MENU_GAP));
        menuY = fieldTopOnScreen - calculatedMaxHeight - MENU_GAP;
      } else {
        // Standard behavior: open directly below the select box
        calculatedMaxHeight = Math.min(260, Math.max(100, spaceBelow));
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
  }, []);

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
                    top: session.anchor.y,
                    left: session.anchor.x,
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

