import React, { useState, useEffect } from 'react';
import { Image, View } from 'react-native';
/**
 * Smart S3-aware Image component.
 *
 * Strategy:
 * 1. Try to load from the direct S3 URL or local URI
 * 2. If that fails, try the backend proxy URL
 * 3. If both fail, call onAllFailed so the parent can show a fallback
 */
export const S3Image = ({ uri, proxyUri, style, resizeMode = 'cover', onAllFailed }) => {
    const [currentUri, setCurrentUri] = useState(uri);
    const [triedProxy, setTriedProxy] = useState(false);

    useEffect(() => {
        setCurrentUri(uri);
        setTriedProxy(false);
    }, [uri]);

    const handleError = () => {
        if (!triedProxy && proxyUri && proxyUri !== currentUri) {
            setTriedProxy(true);
            setCurrentUri(proxyUri);
        }
        else {
            onAllFailed?.();
        }
    };

    if (!currentUri) {
        return <View style={style} />;
    }

    return (<Image source={{ uri: currentUri }} style={style} resizeMode={resizeMode} onError={handleError}/>);
};
