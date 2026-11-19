import api from './api';

export const MAX_IMAGE_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 Megabytes
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Please choose an image file.' };
  }

  // Type validation
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];
  const isValidType =
    SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase()) ||
    validExts.includes(ext);

  if (!isValidType) {
    return {
      valid: false,
      error: 'Only JPG, JPEG, PNG, and WEBP formats are supported.',
    };
  }

  // Size validation: 50MB
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image size must not exceed 50 MB.',
    };
  }

  return { valid: true };
};

export const uploadService = {
  uploadImage: async (file, onProgress) => {
    // 1. Client-side pre-validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('image', file);

    // 3. Upload with real-time percentage tracking
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data?.data || response.data;
  },
};

export default uploadService;
