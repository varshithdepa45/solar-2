"use client";

// ════════════════════════════════════════════════════════════════════════════
// Firebase Storage Client
// ════════════════════════════════════════════════════════════════════════════

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadMetadata,
  UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

interface UploadOptions {
  metadata?: UploadMetadata;
  onProgress?: (progress: number) => void;
}

interface StorageFile {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

// Upload file to storage
export const uploadFile = async (
  path: string,
  file: File,
  options?: UploadOptions,
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const metadata: UploadMetadata = options?.metadata || {
      contentType: file.type,
    };

    const uploadTask: UploadTask = uploadBytes(storageRef, file, metadata);

    // Wait for upload to complete
    const snapshot = await uploadTask;
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    throw new Error(
      `Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Upload multiple files
export const uploadMultiple = async (
  basePath: string,
  files: File[],
  options?: UploadOptions,
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const path = `${basePath}/${Date.now()}_${index}_${file.name}`;
    return uploadFile(path, file, options);
  });

  return Promise.all(uploadPromises);
};

// Delete file from storage
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    throw new Error(
      `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Get download URL for a file
export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    throw new Error(
      `Failed to get download URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// List files in a folder
export const listFiles = async (folderPath: string): Promise<StorageFile[]> => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    const files: StorageFile[] = await Promise.all(
      result.items.map(async (itemRef) => ({
        name: itemRef.name,
        url: await getDownloadURL(itemRef),
      })),
    );

    return files;
  } catch (error) {
    throw new Error(
      `Failed to list files: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Helper to upload image with resizing metadata (for optimized storage)
export const uploadImage = async (
  path: string,
  file: File,
  options?: UploadOptions,
): Promise<string> => {
  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }

  const metadata: UploadMetadata = {
    contentType: file.type,
    cacheControl: "public, max-age=31536000", // Cache for 1 year
  };

  return uploadFile(path, file, { ...options, metadata });
};

// Generate optimized storage path for images
export const getImagePath = (userId: string, imageType: string): string => {
  return `images/${userId}/${imageType}/${Date.now()}`;
};

// Delete all files in a folder (use with caution)
export const deleteFolder = async (folderPath: string): Promise<void> => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    // Delete all items in folder
    await Promise.all(result.items.map((itemRef) => deleteObject(itemRef)));

    // Recursively delete subfolders
    await Promise.all(
      result.prefixes.map((prefix) => deleteFolder(prefix.fullPath)),
    );
  } catch (error) {
    throw new Error(
      `Failed to delete folder: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
