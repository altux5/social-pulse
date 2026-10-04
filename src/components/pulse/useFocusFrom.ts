import { useCallback, useRef } from 'react';
import type { View } from 'react-native';
import type { ID } from '@/domain/types';
import { useSocial } from '@/state/store';

/** Measures where an item sits on screen so the focus view can unfold from it. */
export function useFocusFrom(itemId: ID) {
  const ref = useRef<View>(null);
  const focusItem = useSocial((s) => s.focusItem);
  const open = useCallback(() => {
    const node = ref.current;
    if (!node) return focusItem(itemId);
    node.measureInWindow((x, y, width, height) => {
      focusItem(itemId, width > 0 ? { x, y, width, height } : undefined);
    });
  }, [focusItem, itemId]);
  return { ref, open };
}
