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
  const defaultOrderBy = collectionName === "updates" ? "createdAt" : "order";
  const defaultDirection = collectionName === "updates" ? "desc" : "asc";

  const {
    orderByField = defaultOrderBy,
    orderDirection = defaultDirection,
    realtime = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const constraints: QueryConstraint[] = [];
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection));
    }

    const q = query(collection(db, collectionName), ...constraints);

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.warn(`Query with orderBy on "${collectionName}" had an issue: ${err.message}. Retrying without orderBy.`);
        // Fallback: listen without orderBy so no documents are ever lost
        const fallbackQ = query(collection(db, collectionName));
        unsubscribe = onSnapshot(
          fallbackQ,
          (snapshot) => {
            const items = snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as T)
            );
            setData(items);
            setLoading(false);
          },
          (fallbackErr) => {
            console.error(`Error in ${collectionName} listener:`, fallbackErr);
            setError(fallbackErr.message);
            setLoading(false);
          }
        );
      }
    );

    return () => unsubscribe();
  }, [collectionName, orderByField, orderDirection, realtime]);

  return { data, loading, error, setData };
}
