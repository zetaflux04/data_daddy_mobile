import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { usePathname } from 'expo-router';

const DropdownHostContext = createContext(null);
const FIELD_FALLBACK_HEIGHT = 56;
const MENU_GAP = 2;

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
      const fieldHeight = height > 12 ? height : FIELD_FALLBACK_HEIGHT;
      const nextAnchor = {
        x,
        y: y + fieldHeight + MENU_GAP,
        width: Math.max(width, 140),
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
  }, [placeMenu]);

  useEffect(() => {
    if (!session) return undefined;
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, close);
    return () => sub.remove();
  }, [session, close]);

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
                  },
                ]}
                onPress={() => {}}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  style={styles.menuScroll}
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
    borderRadius: 4,
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
