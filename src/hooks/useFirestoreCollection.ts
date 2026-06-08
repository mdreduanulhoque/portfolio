"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseFirestoreCollectionOptions {
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  realtime?: boolean;
}

export function useFirestoreCollection<T>(
  collectionName: string,
  options: UseFirestoreCollectionOptions = {}
) {
  const {
    orderByField = "order",
    orderDirection = "asc",
    realtime = false,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const constraints: QueryConstraint[] = [];
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    const q = query(collection(db, collectionName), ...constraints);

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as T)
          );
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(`Error in ${collectionName} listener:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as T)
          );
          setData(items);
          setLoading(false);
          unsubscribe();
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [collectionName, orderByField, orderDirection, realtime]);

  return { data, loading, error, setData };
}
