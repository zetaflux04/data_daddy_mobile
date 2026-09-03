import React, { useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface S3ImageProps {
  /** Direct S3 public URL (primary source) */
  uri: string;
  /** Backend proxy fallback URL for older private S3 objects */
  proxyUri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  /** Called if ALL sources fail to load */
  onAllFailed?: () => void;
}

/**
 * Smart S3-aware Image component.
 *
 * Strategy:
 * 1. Try to load from the direct S3 URL (fast, no proxy)
 * 2. If that fails (e.g. old private object uploaded before ACL fix), try the backend proxy
 * 3. If both fail, call onAllFailed so the parent can show a fallback
 *
 * This handles both old (private) and new (public-read) S3 objects transparently.
 */
export const S3Image: React.FC<S3ImageProps> = ({
  uri,
  proxyUri,
  style,
  resizeMode = 'cover',
  onAllFailed,
}) => {
  const [currentUri, setCurrentUri] = useState(uri);
  const [triedProxy, setTriedProxy] = useState(false);

  const handleError = () => {
    if (!triedProxy && proxyUri && proxyUri !== currentUri) {
      // First failure: switch to backend proxy URL
      setTriedProxy(true);
      setCurrentUri(proxyUri);
    } else {
      // Both failed
      onAllFailed?.();
    }
  };

  return (
    <Image
      source={{ uri: currentUri }}
      style={style}
      resizeMode={resizeMode}
      onError={handleError}
    />
  );
};
