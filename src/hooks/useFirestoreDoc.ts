"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseFirestoreDocOptions {
  realtime?: boolean;
}

export function useFirestoreDoc<T>(
  collectionName: string,
  documentId: string,
  options: UseFirestoreDocOptions = {}
) {
  const { realtime = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, collectionName, documentId);

    if (realtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data() as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error(`Error in ${collectionName}/${documentId} listener:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data() as T);
          } else {
            setData(null);
          }
          setLoading(false);
          unsubscribe();
        },
        (err) => {
          console.error(`Error fetching ${collectionName}/${documentId}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [collectionName, documentId, realtime]);

  return { data, loading, error, setData };
}
