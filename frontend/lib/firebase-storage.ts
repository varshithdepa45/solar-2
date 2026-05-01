import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export async function uploadRoofImage(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `roof_analysis/${userId}/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          ),
        };
        onProgress?.(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function uploadProjectImage(
  userId: string,
  projectId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(
    storage,
    `projects/${userId}/${projectId}/${fileName}`,
  );

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          ),
        };
        onProgress?.(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
}

export function getStorageRef(path: string) {
  return ref(storage, path);
}
