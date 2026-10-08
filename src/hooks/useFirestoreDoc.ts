"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseFirestoreDocOptions {
  realtime?: boolean;
}

export function useFirestoreDoc<T>(
  collectionName: string,
  documentId: string,
  options: UseFirestoreDocOptions = {}
) {
  const { realtime = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const docRef = doc(db, collectionName, documentId);

    if (realtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.error(`Error in ${collectionName}/${documentId} listener:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      getDoc(docRef)
        .then((snapshot) => {
          if (!isMounted) return;
          if (snapshot.exists()) {
            setData({ id: snapshot.id, ...snapshot.data() } as T);
          } else {
            setData(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error(`Error fetching ${collectionName}/${documentId}:`, err);
          setError(err.message);
          setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [collectionName, documentId, realtime]);

  return { data, loading, error, setData };
}
