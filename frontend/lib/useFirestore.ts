"use client";

// ════════════════════════════════════════════════════════════════════════════
// Firestore Hook for Real-Time Data
// ════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  Query,
  QueryConstraint,
  DocumentReference,
} from "firebase/firestore";
import { firestore } from "./firebase";

interface UseFirestoreOptions {
  constraints?: QueryConstraint[];
}

interface UseFirestoreResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export const useFirestore = <T extends { id?: string }>(
  collectionName: string,
  options?: UseFirestoreOptions,
): UseFirestoreResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const collectionRef = collection(firestore, collectionName);
      const q: Query = options?.constraints
        ? query(collectionRef, ...options.constraints)
        : collectionRef;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = [];
          snapshot.forEach((doc) => {
            items.push({ ...doc.data(), id: doc.id } as T);
          });
          setData(items);
          setError(null);
          setLoading(false);
        },
        (error) => {
          setError(error);
          setLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Firestore error"));
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(options?.constraints || [])]);

  return { data, loading, error };
};

// Single document hook
export const useFirestoreDoc = <T extends { id?: string }>(
  collectionName: string,
  docId: string | null,
): UseFirestoreResult<T> & { refetch: () => Promise<void> } => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!docId) return;
    try {
      setLoading(true);
      const docRef = doc(firestore, collectionName, docId);
      const docSnap = await getDocs(
        query(
          collection(firestore, collectionName),
          where("__name__", "==", docId),
        ),
      );
      const items: T[] = [];
      docSnap.forEach((d) => {
        items.push({ ...d.data(), id: d.id } as T);
      });
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Firestore error"));
    } finally {
      setLoading(false);
    }
  }, [collectionName, docId]);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(firestore, collectionName, docId);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData([{ ...docSnap.data(), id: docSnap.id } as T]);
          } else {
            setData([]);
          }
          setError(null);
          setLoading(false);
        },
        (error) => {
          setError(error);
          setLoading(false);
        },
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Firestore error"));
      setLoading(false);
    }
  }, [collectionName, docId]);

  return { data, loading, error, refetch };
};

// Write operations
export const addDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: T,
  docId?: string,
): Promise<DocumentReference> => {
  const docRef = docId
    ? doc(firestore, collectionName, docId)
    : doc(collection(firestore, collectionName));

  await setDoc(docRef, data);
  return docRef;
};

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T>,
): Promise<void> => {
  const docRef = doc(firestore, collectionName, docId);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (
  collectionName: string,
  docId: string,
): Promise<void> => {
  const docRef = doc(firestore, collectionName, docId);
  await deleteDoc(docRef);
};
