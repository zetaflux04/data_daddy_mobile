import { useColorScheme as useColorSchemeCore } from 'react-native';
export const useColorScheme = () => {
    const coreScheme = useColorSchemeCore();
    return !coreScheme || coreScheme === 'unspecified' ? 'light' : coreScheme;
};
