import { useContext } from 'react';
import { useColorScheme as useColorSchemeCore } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export const useColorScheme = () => {
    const themeContext = useContext(ThemeContext);
    if (themeContext && themeContext.effectiveTheme) {
        return themeContext.effectiveTheme;
    }
    const coreScheme = useColorSchemeCore();
    return !coreScheme || coreScheme === 'unspecified' ? 'light' : coreScheme;
};
