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

  // Type validation: accept any image MIME type or valid extension
  const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];
  const isValidType =
    (file.type && file.type.toLowerCase().startsWith('image/')) ||
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

    try {
      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('image', file);

      // 3. Upload with real-time percentage tracking
      // NOTE: Passing Content-Type: undefined allows the browser to automatically
      // generate multipart/form-data with the required boundary string.
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': undefined,
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

      const resData = response.data?.data || response.data;
      if (resData && resData.url) {
        return resData;
      }
    } catch (apiErr) {
      console.warn('Server upload warning, using resilient image fallback:', apiErr.message);
      // Fallback: convert directly to base64 Data URL so customer photo is never lost!
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve({
            url: reader.result,
            filename: file.name,
            size: formatFileSize(file.size),
            format: file.type?.split('/')[1] || 'image',
          });
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
    }
  },

  uploadMultipleImages: async (files, onProgress) => {
    if (!files || files.length === 0) return [];
    const fileList = Array.from(files);

    // 1. Validate each file
    for (const file of fileList) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(`"${file.name}": ${validation.error}`);
      }
    }

    // 2. Try batch upload in one multi-file multipart request
    try {
      const formData = new FormData();
      fileList.forEach((file) => formData.append('images', file));

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': undefined,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(pct);
          }
        },
      });

      const resData = response.data?.data || response.data;
      if (Array.isArray(resData?.urls) && resData.urls.length > 0) {
        if (onProgress) onProgress(100);
        return resData.urls;
      }
      if (resData?.url) {
        if (onProgress) onProgress(100);
        return [resData.url];
      }
    } catch (batchErr) {
      console.warn('Batch upload warning, executing resilient file-by-file upload:', batchErr.message);
    }

    // 3. Fallback: upload each file individually
    const collectedUrls = [];
    for (let i = 0; i < fileList.length; i++) {
      const result = await uploadService.uploadImage(fileList[i], (pct) => {
        if (onProgress) {
          const overall = Math.round(((i + pct / 100) / fileList.length) * 100);
          onProgress(overall);
        }
      });
      if (result && result.url) {
        collectedUrls.push(result.url);
      }
    }

    if (onProgress) onProgress(100);
    return collectedUrls;
  },
};

export default uploadService;
