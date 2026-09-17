import { useRef, useCallback, useEffect } from 'react';
import { updateNote } from '../services/api';

export function useAutoSave(noteId, delay = 2000) {
  const timerRef = useRef(null);
  const latestDataRef = useRef(null);
  const savingRef = useRef(false);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const triggerSave = useCallback(
    (data, onSaveStart, onSaveEnd) => {
      latestDataRef.current = data;

      // Clear previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new debounce timer
      timerRef.current = setTimeout(async () => {
        if (!noteId || savingRef.current) return;

        savingRef.current = true;
        if (onSaveStart) onSaveStart();

        try {
          await updateNote(noteId, latestDataRef.current);
        } catch (err) {
          console.error('Auto-save failed:', err.message);
        } finally {
          savingRef.current = false;
          if (onSaveEnd) onSaveEnd();
        }
      }, delay);
    },
    [noteId, delay]
  );

  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (noteId && latestDataRef.current && !savingRef.current) {
      savingRef.current = true;
      try {
        await updateNote(noteId, latestDataRef.current);
      } catch (err) {
        console.error('Flush save failed:', err.message);
      } finally {
        savingRef.current = false;
      }
    }
  }, [noteId]);

  return { triggerSave, flushSave };
}
