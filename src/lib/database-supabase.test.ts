import { supabaseDb } from './database-supabase';
import { supabaseAdmin } from './supabase';
import { logger } from "@/lib/logger";

// Mock the dependencies
jest.mock('./supabase', () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('supabaseDb', () => {
  let mockUpload: jest.Mock;
  let mockGetPublicUrl: jest.Mock;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpload = jest.fn();
    mockGetPublicUrl = jest.fn();
    mockRemove = jest.fn();

    // Setup the mock chain for supabaseAdmin.storage.from()
    (supabaseAdmin.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
      remove: mockRemove,
    });
  });

  describe('uploadDesignImage', () => {
    const mockFileName = 'test-user/image.jpg';
    const mockBuffer = new Uint8Array([1, 2, 3]);
    const mockContentType = 'image/jpeg';
    const mockPublicUrl = 'https://example.com/image.jpg';

    it('should upload an image and return the public URL on success', async () => {
      // Mock successful upload
      mockUpload.mockResolvedValueOnce({ error: null });
      // Mock successful URL generation
      mockGetPublicUrl.mockReturnValueOnce({ data: { publicUrl: mockPublicUrl } });

      const result = await supabaseDb.uploadDesignImage(mockFileName, mockBuffer, mockContentType);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('designs');
      expect(mockUpload).toHaveBeenCalledWith(mockFileName, mockBuffer, {
        contentType: mockContentType,
        upsert: false,
      });
      expect(mockGetPublicUrl).toHaveBeenCalledWith(mockFileName);
      expect(result).toBe(mockPublicUrl);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return null if upload fails', async () => {
      const mockError = new Error('Upload failed');
      // Mock failed upload
      mockUpload.mockResolvedValueOnce({ error: mockError });

      const result = await supabaseDb.uploadDesignImage(mockFileName, mockBuffer, mockContentType);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('designs');
      expect(mockUpload).toHaveBeenCalledWith(mockFileName, mockBuffer, {
        contentType: mockContentType,
        upsert: false,
      });
      expect(mockGetPublicUrl).not.toHaveBeenCalled();
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith({ uploadError: mockError }, 'Failed to upload design image:');
    });
  });

  describe('removeDesignImage', () => {
    const mockFileName = 'test-user/image.jpg';

    it('should remove an image and return true on success', async () => {
      // Mock successful removal
      mockRemove.mockResolvedValueOnce({ error: null });

      const result = await supabaseDb.removeDesignImage(mockFileName);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('designs');
      expect(mockRemove).toHaveBeenCalledWith([mockFileName]);
      expect(result).toBe(true);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return false if removal fails', async () => {
      const mockError = new Error('Removal failed');
      // Mock failed removal
      mockRemove.mockResolvedValueOnce({ error: mockError });

      const result = await supabaseDb.removeDesignImage(mockFileName);

      expect(supabaseAdmin.storage.from).toHaveBeenCalledWith('designs');
      expect(mockRemove).toHaveBeenCalledWith([mockFileName]);
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith({ error: mockError }, 'Failed to remove design image:');
    });
  });
});
