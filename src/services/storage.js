import { supabase } from '../config/supabase'

export class StorageService {
  // =====================================================
  // STORAGE CONFIGURATION
  // =====================================================

  static BUCKETS = {
    PRODUCTS: 'flickxir_uploads',
    PRESCRIPTIONS: 'flickxir_uploads',
    AVATARS: 'flickxir_uploads'
  }

  static ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]

  static ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]

  static MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @param {string} prefix - Prefix for the filename
   * @returns {string} Unique filename
   */
  static generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    const name = originalName.split('.').slice(0, -1).join('.')
    
    return `${prefix}${name}_${timestamp}_${randomString}.${extension}`
  }

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {Array} allowedTypes - Allowed MIME types
   * @returns {boolean} Whether file type is valid
   */
  static validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type)
  }

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSize - Maximum file size in bytes
   * @returns {boolean} Whether file size is valid
   */
  static validateFileSize(file, maxSize = this.MAX_FILE_SIZE) {
    return file.size <= maxSize
  }

  /**
   * Compress image file
   * @param {File} file - Image file to compress
   * @param {number} quality - Compression quality (0.1 to 1.0)
   * @returns {Promise<File>} Compressed file
   */
  static async compressImage(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        reject(new Error('File is not a supported image type'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxDimension = 1200
        let { width, height } = img

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // =====================================================
  // PRODUCT IMAGE UPLOADS
  // =====================================================

  /**
   * Upload product image
   * @param {File} file - Image file to upload
   * @param {string} productId - Product ID
   * @returns {Promise<{url: string|null, error: Error|null}>}
   */
  static async uploadProductImage(file, productId) {
    try {
      console.log('📁 StorageService: Uploading product image for product:', productId)
      
      // Validate file
      if (!this.validateFileType(file, this.ALLOWED_IMAGE_TYPES)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.')
      }

      if (!this.validateFileSize(file)) {
        throw new Error('File size too large. Maximum size is 10MB.')
      }

      // Compress image if it's large
      let uploadFile = file
      if (file.size > 2 * 1024 * 1024) { // 2MB
        console.log('📁 StorageService: Compressing large image')
        uploadFile = await this.compressImage(file, 0.8)
      }

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name, `product_${productId}_`)
      const filePath = `products/${productId}/${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.PRODUCTS)
        .upload(filePath, uploadFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ StorageService: Product image upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.PRODUCTS)
        .getPublicUrl(filePath)

      console.log('✅ StorageService: Product image uploaded successfully')
      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('❌ StorageService: Product image upload error:', error)
      return { url: null, error }
    }
  }

  /**
   * Upload multiple product images
   * @param {Array<File>} files - Array of image files
   * @param {string} productId - Product ID
   * @returns {Promise<{urls: Array<string>, error: Error|null}>}
   */
  static async uploadMultipleProductImages(files, productId) {
    try {
      console.log(`📁 StorageService: Uploading ${files.length} product images for product:`, productId)
      
      const uploadPromises = files.map(file => this.uploadProductImage(file, productId))
      const results = await Promise.all(uploadPromises)
      
      const urls = results
        .filter(result => result.url)
        .map(result => result.url)
      
      const errors = results
        .filter(result => result.error)
        .map(result => result.error.message)

      if (errors.length > 0) {
        console.warn('⚠️ StorageService: Some images failed to upload:', errors)
      }

      console.log(`✅ StorageService: ${urls.length}/${files.length} product images uploaded successfully`)
      return { urls, error: null }
    } catch (error) {
      console.error('❌ StorageService: Multiple product images upload error:', error)
      return { urls: [], error }
    }
  }

  /**
   * Delete product image
   * @param {string} filePath - File path in storage
   * @returns {Promise<{error: Error|null}>}
   */
  static async deleteProductImage(filePath) {
    try {
      console.log('📁 StorageService: Deleting product image:', filePath)
      
      const { error } = await supabase.storage
        .from(this.BUCKETS.PRODUCTS)
        .remove([filePath])

      if (error) {
        console.error('❌ StorageService: Delete product image error:', error)
        throw error
      }

      console.log('✅ StorageService: Product image deleted successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ StorageService: Delete product image error:', error)
      return { error }
    }
  }

  // =====================================================
  // PRESCRIPTION UPLOADS
  // =====================================================

  /**
   * Upload prescription file
   * @param {File} file - Prescription file to upload
   * @param {string} userId - User ID
   * @param {string} orderId - Order ID (optional)
   * @returns {Promise<{url: string|null, error: Error|null}>}
   */
  static async uploadPrescription(file, userId, orderId = null) {
    try {
      console.log('📁 StorageService: Uploading prescription for user:', userId)
      
      // Validate file
      if (!this.validateFileType(file, this.ALLOWED_DOCUMENT_TYPES)) {
        throw new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.')
      }

      if (!this.validateFileSize(file)) {
        throw new Error('File size too large. Maximum size is 10MB.')
      }

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name, `prescription_${userId}_`)
      const filePath = `prescriptions/${userId}/${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.PRESCRIPTIONS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ StorageService: Prescription upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.PRESCRIPTIONS)
        .getPublicUrl(filePath)

      console.log('✅ StorageService: Prescription uploaded successfully')
      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('❌ StorageService: Prescription upload error:', error)
      return { url: null, error }
    }
  }

  /**
   * Delete prescription file
   * @param {string} filePath - File path in storage
   * @returns {Promise<{error: Error|null}>}
   */
  static async deletePrescription(filePath) {
    try {
      console.log('📁 StorageService: Deleting prescription:', filePath)
      
      const { error } = await supabase.storage
        .from(this.BUCKETS.PRESCRIPTIONS)
        .remove([filePath])

      if (error) {
        console.error('❌ StorageService: Delete prescription error:', error)
        throw error
      }

      console.log('✅ StorageService: Prescription deleted successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ StorageService: Delete prescription error:', error)
      return { error }
    }
  }

  // =====================================================
  // AVATAR UPLOADS
  // =====================================================

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @param {string} userId - User ID
   * @returns {Promise<{url: string|null, error: Error|null}>}
   */
  static async uploadAvatar(file, userId) {
    try {
      console.log('📁 StorageService: Uploading avatar for user:', userId)
      
      // Validate file
      if (!this.validateFileType(file, this.ALLOWED_IMAGE_TYPES)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.')
      }

      if (!this.validateFileSize(file, 5 * 1024 * 1024)) { // 5MB for avatars
        throw new Error('File size too large. Maximum size is 5MB.')
      }

      // Compress image
      const compressedFile = await this.compressImage(file, 0.7)

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.name, `avatar_${userId}_`)
      const filePath = `avatars/${userId}/${filename}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKETS.AVATARS)
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('❌ StorageService: Avatar upload error:', error)
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKETS.AVATARS)
        .getPublicUrl(filePath)

      console.log('✅ StorageService: Avatar uploaded successfully')
      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('❌ StorageService: Avatar upload error:', error)
      return { url: null, error }
    }
  }

  // =====================================================
  // FILE MANAGEMENT
  // =====================================================

  /**
   * List files in a folder
   * @param {string} bucket - Storage bucket name
   * @param {string} folder - Folder path
   * @returns {Promise<{data: Array|null, error: Error|null}>}
   */
  static async listFiles(bucket, folder = '') {
    try {
      console.log(`📁 StorageService: Listing files in ${bucket}/${folder}`)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder)

      if (error) {
        console.error('❌ StorageService: List files error:', error)
        throw error
      }

      console.log(`✅ StorageService: Found ${data?.length || 0} files`)
      return { data, error: null }
    } catch (error) {
      console.error('❌ StorageService: List files error:', error)
      return { data: null, error }
    }
  }

  /**
   * Get file metadata
   * @param {string} bucket - Storage bucket name
   * @param {string} filePath - File path
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getFileMetadata(bucket, filePath) {
    try {
      console.log(`📁 StorageService: Getting metadata for ${bucket}/${filePath}`)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (error) {
        console.error('❌ StorageService: Get file metadata error:', error)
        throw error
      }

      console.log('✅ StorageService: File metadata retrieved successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ StorageService: Get file metadata error:', error)
      return { data: null, error }
    }
  }

  /**
   * Download file
   * @param {string} bucket - Storage bucket name
   * @param {string} filePath - File path
   * @returns {Promise<{data: Blob|null, error: Error|null}>}
   */
  static async downloadFile(bucket, filePath) {
    try {
      console.log(`📁 StorageService: Downloading file ${bucket}/${filePath}`)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath)

      if (error) {
        console.error('❌ StorageService: Download file error:', error)
        throw error
      }

      console.log('✅ StorageService: File downloaded successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ StorageService: Download file error:', error)
      return { data: null, error }
    }
  }

  // =====================================================
  // STORAGE BUCKET MANAGEMENT
  // =====================================================

  /**
   * Create storage bucket
   * @param {string} bucketName - Bucket name
   * @param {Object} options - Bucket options
   * @returns {Promise<{error: Error|null}>}
   */
  static async createBucket(bucketName, options = {}) {
    try {
      console.log(`📁 StorageService: Creating bucket: ${bucketName}`)
      
      const { error } = await supabase.storage
        .createBucket(bucketName, {
          public: options.public || false,
          allowedMimeTypes: options.allowedMimeTypes || null,
          fileSizeLimit: options.fileSizeLimit || null,
          ...options
        })

      if (error) {
        console.error('❌ StorageService: Create bucket error:', error)
        throw error
      }

      console.log('✅ StorageService: Bucket created successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ StorageService: Create bucket error:', error)
      return { error }
    }
  }

  /**
   * Delete storage bucket
   * @param {string} bucketName - Bucket name
   * @returns {Promise<{error: Error|null}>}
   */
  static async deleteBucket(bucketName) {
    try {
      console.log(`📁 StorageService: Deleting bucket: ${bucketName}`)
      
      const { error } = await supabase.storage
        .deleteBucket(bucketName)

      if (error) {
        console.error('❌ StorageService: Delete bucket error:', error)
        throw error
      }

      console.log('✅ StorageService: Bucket deleted successfully')
      return { error: null }
    } catch (error) {
      console.error('❌ StorageService: Delete bucket error:', error)
      return { error }
    }
  }

  /**
   * Get storage bucket info
   * @param {string} bucketName - Bucket name
   * @returns {Promise<{data: Object|null, error: Error|null}>}
   */
  static async getBucketInfo(bucketName) {
    try {
      console.log(`📁 StorageService: Getting info for bucket: ${bucketName}`)
      
      const { data, error } = await supabase.storage
        .getBucket(bucketName)

      if (error) {
        console.error('❌ StorageService: Get bucket info error:', error)
        throw error
      }

      console.log('✅ StorageService: Bucket info retrieved successfully')
      return { data, error: null }
    } catch (error) {
      console.error('❌ StorageService: Get bucket info error:', error)
      return { data: null, error }
    }
  }
}

export default StorageService
