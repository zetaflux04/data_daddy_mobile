import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Alert as RNAlert, } from 'react-native';
const AlertContext = createContext(undefined);
let globalShowAlert = null;
export const showAlert = (title, message, buttons, options) => {
    if (globalShowAlert) {
        globalShowAlert(title, message, buttons, options);
    }
    else {
        // Fallback if provider not mounted yet
        RNAlert.alert(title, message, buttons, options);
    }
};
export const CustomAlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });
    const hideAlert = useCallback(() => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    }, []);
    const show = useCallback((title, message, buttons, options) => {
        const resolvedButtons = buttons && buttons.length > 0
            ? buttons
            : [{ text: 'OK', style: 'default' }];
        setAlertState({
            visible: true,
            title: title || '',
            message: message || '',
            buttons: resolvedButtons,
            options,
        });
    }, []);
    useEffect(() => {
        globalShowAlert = show;
        // Monkey-patch RNAlert.alert so existing calls throughout the codebase automatically use this
        const originalRNAlert = RNAlert.alert;
        RNAlert.alert = (t, m, b, o) => {
            show(t, m, b, o);
        };
        return () => {
            globalShowAlert = null;
            RNAlert.alert = originalRNAlert;
        };
    }, [show]);
    const handleButtonPress = (btn) => {
        hideAlert();
        if (btn.onPress) {
            // Small timeout allows modal to dismiss smoothly before callback
            setTimeout(() => {
                btn.onPress?.();
            }, 100);
        }
    };
    const handleBackdropPress = () => {
        if (alertState.options?.cancelable) {
            hideAlert();
            alertState.options?.onDismiss?.();
        }
    };
    // Organize buttons:
    // If 2 buttons and one is destructive, place destructive on left and cancel/other on right like Image 3
    const isTwoButtons = alertState.buttons.length === 2;
    const destructiveBtn = alertState.buttons.find((b) => b.style === 'destructive');
    const otherBtns = alertState.buttons.filter((b) => b !== destructiveBtn);
    let displayButtons = alertState.buttons;
    if (isTwoButtons && destructiveBtn && otherBtns.length === 1) {
        displayButtons = [destructiveBtn, otherBtns[0]];
    }
    return (<AlertContext.Provider value={{ showAlert: show, hideAlert }}>
      {children}
      <Modal visible={alertState.visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleBackdropPress}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={handleBackdropPress}/>
          <View style={styles.card}>
            {alertState.title ? (<Text style={styles.title}>{alertState.title}</Text>) : null}

            {alertState.message ? (<Text style={styles.message}>{alertState.message}</Text>) : null}

            <View style={[
            styles.buttonRow,
            displayButtons.length > 2 && styles.buttonColumn,
            displayButtons.length === 1 && { justifyContent: 'flex-end' },
        ]}>
              {displayButtons.map((btn, index) => {
            const isDestructive = btn.style === 'destructive' ||
                btn.text?.toLowerCase().includes('delete') ||
                btn.text?.toLowerCase().includes('remove');
            const isCancel = btn.style === 'cancel';
            return (<Pressable key={index} style={({ pressed }) => [
                    styles.actionButton,
                    displayButtons.length > 2 && styles.fullWidthButton,
                    pressed && styles.actionButtonPressed,
                ]} onPress={() => handleButtonPress(btn)}>
                    <Text style={[
                    styles.actionText,
                    isDestructive && styles.destructiveText,
                    isCancel && !isDestructive && styles.cancelText,
                    !isDestructive && !isCancel && styles.primaryText,
                ]}>
                      {btn.text || 'OK'}
                    </Text>
                  </Pressable>);
        })}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>);
};
export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        return {
            showAlert,
            hideAlert: () => { },
        };
    }
    return context;
};
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.2,
        marginBottom: 10,
        textAlign: 'left',
    },
    message: {
        fontSize: 15,
        lineHeight: 22,
        color: '#475569',
        marginBottom: 24,
        textAlign: 'left',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        gap: 12,
    },
    buttonColumn: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidthButton: {
        width: '100%',
    },
    actionButtonPressed: {
        opacity: 0.7,
        backgroundColor: '#F1F5F9',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#2563EB',
        fontWeight: '700',
    },
    destructiveText: {
        color: '#DC2626',
        fontWeight: '600',
    },
    cancelText: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
