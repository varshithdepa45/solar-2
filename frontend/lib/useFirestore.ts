import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";

// Hook for fetching predictions
export function usePredictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "predictions"),
      where("uid", "==", user.uid),
      orderBy("created_at", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPredictions(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return { predictions, loading, error };
}

// Hook for fetching projects
export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "projects"),
      where("uid", "==", user.uid),
      orderBy("updated_at", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  return { projects, loading, error };
}

// Hook for a single project
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "projects", projectId),
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            setProject({ id: snapshot.id, ...snapshot.data() });
          } else {
            setProject(null);
          }
          setLoading(false);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      },
    );

    return () => unsubscribe();
  }, [projectId]);

  return { project, loading, error };
}

// Hook for creating predictions
export function useCreatePrediction() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPrediction = async (data: any) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setLoading(true);
      setError(null);

      const docRef = await addDoc(collection(db, "predictions"), {
        uid: user.uid,
        ...data,
        created_at: serverTimestamp(),
      });

      setLoading(false);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { createPrediction, loading, error };
}

// Hook for creating projects
export function useCreateProject() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (data: any) => {
    if (!user) throw new Error("User not authenticated");

    try {
      setLoading(true);
      setError(null);

      const docRef = await addDoc(collection(db, "projects"), {
        uid: user.uid,
        status: "draft",
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      setLoading(false);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { createProject, loading, error };
}

// Hook for updating project
export function useUpdateProject(projectId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = async (data: any) => {
    if (!projectId) throw new Error("Project ID required");

    try {
      setLoading(true);
      setError(null);

      await updateDoc(doc(db, "projects", projectId), {
        ...data,
        updated_at: serverTimestamp(),
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { updateProject, loading, error };
}

// Hook for deleting project
export function useDeleteProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      await deleteDoc(doc(db, "projects", projectId));

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { deleteProject, loading, error };
}
