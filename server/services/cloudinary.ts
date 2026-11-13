import { v2 as cloudinary } from 'cloudinary';
import { getEnvConfig } from '../config/env.ts';

function ensureCloudinaryConfigured(): boolean {
  const cfg = getEnvConfig();
  if (!cfg.cloudinaryCloudName || !cfg.cloudinaryApiKey || !cfg.cloudinaryApiSecret) {
    return false;
  }
  cloudinary.config({
    cloud_name: cfg.cloudinaryCloudName,
    api_key: cfg.cloudinaryApiKey,
    api_secret: cfg.cloudinaryApiSecret,
    secure: true,
  });
  return true;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: 'image' | 'raw';
    originalName: string;
  }
): Promise<CloudinaryUploadResult> {
  if (!ensureCloudinaryConfigured()) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  return new Promise((resolve, reject) => {
    const cleanBase = options.originalName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        public_id: `${cleanBase}_${Date.now()}`,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format || '',
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> {
  if (!publicId || !ensureCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('[Cloudinary] Failed to delete asset:', err);
  }
}
