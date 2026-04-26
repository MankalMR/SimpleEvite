import { supabaseDb } from './database-supabase';
import { supabaseAdmin } from './supabase';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Create a highly configurable mock for supabaseAdmin
const mockSingle = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockOrder = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

// Storage mocks
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockRemove = jest.fn();

type QueryResult = { data?: unknown; error?: unknown };
type ResolveFn = (value: QueryResult) => void;

const mockQueryBuilder: Record<string, unknown> = {
  select: mockSelect,
  eq: mockEq,
  in: mockIn,
  order: mockOrder,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  single: mockSingle,
  then: jest.fn(),
};

// Setup chainable returns
mockSelect.mockReturnValue(mockQueryBuilder);
mockEq.mockReturnValue(mockQueryBuilder);
mockIn.mockReturnValue(mockQueryBuilder);
mockOrder.mockReturnValue(mockQueryBuilder);
mockInsert.mockReturnValue(mockQueryBuilder);
mockUpdate.mockReturnValue(mockQueryBuilder);
mockDelete.mockReturnValue(mockQueryBuilder);

jest.mock('./supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => mockQueryBuilder),
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
        remove: mockRemove,
      })),
    },
  },
}));

describe('supabaseDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default promise resolution
    (mockQueryBuilder.then as jest.Mock).mockImplementation((resolve: ResolveFn) => resolve({ data: [], error: null }));
    mockSingle.mockResolvedValue({ data: {}, error: null });
    
    // Default Promise.all for template enrichment
    const defaultPromiseAll = global.Promise.all;
    jest.spyOn(global.Promise, 'all').mockImplementation((promises) => {
      // If we are calling Promise.all during enrichInvitationsWithTemplates
      if (Array.isArray(promises) && promises.length === 2 && typeof promises[0] === 'object') {
        return defaultPromiseAll([
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] })
        ]) as unknown as Promise<unknown[]>;
      }
      return defaultPromiseAll(promises) as unknown as Promise<unknown[]>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUserEmail', () => {
    it('should return email on success', async () => {
      mockSingle.mockResolvedValueOnce({ data: { email: 'test@test.com' }, error: null });
      const email = await supabaseDb.getUserEmail('user1');
      expect(email).toBe('test@test.com');
    });

    it('should return null if not found (PGRST116)', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      const email = await supabaseDb.getUserEmail('user1');
      expect(email).toBeNull();
    });

    it('should throw on other errors', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: new Error('DB Error') });
      await expect(supabaseDb.getUserEmail('user1')).rejects.toThrow('DB Error');
    });
  });

  describe('Invitations', () => {
    const mockDbInvitation = {
      id: 'inv1', user_id: 'user1', title: 'Test', event_date: '2026-01-01',
      design_id: 'design1'
    };

    describe('getInvitations', () => {
      it('should fetch and enrich invitations successfully', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [mockDbInvitation], error: null }));
        
        // Mock the Promise.all for enrichInvitationsWithTemplates
        jest.spyOn(global.Promise, 'all').mockResolvedValueOnce([
          { data: [{ id: 'design1', name: 'Design 1' }] },
          { data: [] }
        ] as unknown as Promise<unknown[]>);

        const result = await supabaseDb.getInvitations('user1');
        
        expect(supabaseAdmin.from).toHaveBeenCalledWith('invitations');
        expect(mockEq).toHaveBeenCalledWith('user_id', 'user1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('inv1');
        expect(result[0].designs?.name).toBe('Design 1');
      });

      it('should return raw invitation if design is not found in db', async () => {
        // Line 100 coverage
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [mockDbInvitation], error: null }));
        jest.spyOn(global.Promise, 'all').mockResolvedValueOnce([
          { data: [] },
          { data: [] }
        ] as unknown as Promise<unknown[]>);
        const result = await supabaseDb.getInvitations('user1');
        expect(result[0].designs).toBeUndefined();
      });

      it('should map nested designs synchronously', async () => {
        // Line 51 coverage
        const invWithNested = { ...mockDbInvitation, designs: { id: 'nested1', name: 'Nested Design' } };
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [invWithNested], error: null }));
        const result = await supabaseDb.getInvitations('user1');
        expect(result[0].designs?.name).toBe('Nested Design');
      });

      it('should return early if no missing design ids', async () => {
        // Line 66 coverage
        const invWithoutDesign = { ...mockDbInvitation, design_id: undefined };
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [invWithoutDesign], error: null }));
        const result = await supabaseDb.getInvitations('user1');
        expect(result[0].design_id).toBeUndefined();
      });

      it('should handle errors', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((_resolve: ResolveFn, reject: (err: unknown) => void) => reject(new Error('Error')));
        await expect(supabaseDb.getInvitations('user1')).rejects.toThrow('Error');
      });
    });

    describe('getInvitation', () => {
      it('should fetch single invitation', async () => {
        mockSingle.mockResolvedValueOnce({ data: mockDbInvitation, error: null });
        jest.spyOn(global.Promise, 'all').mockResolvedValueOnce([
          { data: [] },
          { data: [{ id: 'design1', name: 'Template 1' }] }
        ] as unknown as Promise<unknown[]>);

        const result = await supabaseDb.getInvitation('inv1', 'user1');
        
        expect(result?.id).toBe('inv1');
        expect(result?.default_templates?.name).toBe('Template 1');
      });

      it('should return null if not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
        const result = await supabaseDb.getInvitation('inv1', 'user1');
        expect(result).toBeNull();
      });

      it('should throw on generic DB errors', async () => {
        // Line 212 coverage
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Generic DB Error') });
        await expect(supabaseDb.getInvitation('inv1', 'user1')).rejects.toThrow('Generic DB Error');
      });
    });

    describe('getInvitationByToken', () => {
      it('should fetch by token', async () => {
        mockSingle.mockResolvedValueOnce({ data: mockDbInvitation, error: null });
        const result = await supabaseDb.getInvitationByToken('token123');
        expect(result?.id).toBe('inv1');
      });

      it('should return null on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        const result = await supabaseDb.getInvitationByToken('token123');
        expect(result).toBeNull();
      });
    });

    describe('createInvitation', () => {
      it('should insert and return new invitation', async () => {
        mockSingle.mockResolvedValueOnce({ data: mockDbInvitation, error: null });
        const result = await supabaseDb.createInvitation({ title: 'New' } as unknown as Parameters<typeof supabaseDb.createInvitation>[0], 'user1');
        expect(mockInsert).toHaveBeenCalled();
        expect(result.id).toBe('inv1');
      });
    });

    describe('updateInvitation', () => {
      it('should update and return invitation', async () => {
        mockSingle.mockResolvedValueOnce({ data: mockDbInvitation, error: null });
        const result = await supabaseDb.updateInvitation('inv1', { title: 'Updated' }, 'user1');
        expect(mockUpdate).toHaveBeenCalled();
        expect(result?.id).toBe('inv1');
      });
      
      it('should return null on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        const result = await supabaseDb.updateInvitation('inv1', {}, 'user1');
        expect(result).toBeNull();
      });
    });

    describe('deleteInvitation', () => {
      it('should delete and return true on success', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ error: null }));
        const result = await supabaseDb.deleteInvitation('inv1', 'user1');
        expect(mockDelete).toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });
  });

  describe('Designs', () => {
    describe('getDesigns', () => {
      it('should fetch designs', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [{ id: 'd1' }], error: null }));
        const result = await supabaseDb.getDesigns('user1');
        expect(result).toHaveLength(1);
      });
      it('should throw on error', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((_resolve: ResolveFn, reject: (err: unknown) => void) => reject(new Error('Error')));
        await expect(supabaseDb.getDesigns('user1')).rejects.toThrow('Error');
      });
    });
    
    describe('getDesign', () => {
      it('should fetch single design', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'd1' }, error: null });
        const result = await supabaseDb.getDesign('d1', 'user1');
        expect(result?.id).toBe('d1');
      });
      it('should return null on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        const result = await supabaseDb.getDesign('d1', 'user1');
        expect(result).toBeNull();
      });
    });

    describe('createDesign', () => {
      it('should insert design', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'd1' }, error: null });
        const result = await supabaseDb.createDesign({ name: 'New' } as unknown as Parameters<typeof supabaseDb.createDesign>[0], 'user1');
        expect(result.id).toBe('d1');
      });
      it('should throw on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        await expect(supabaseDb.createDesign({ name: 'New' } as unknown as Parameters<typeof supabaseDb.createDesign>[0], 'user1')).rejects.toThrow('Error');
      });
    });

    describe('updateDesign', () => {
      it('should update design', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'd1' }, error: null });
        const result = await supabaseDb.updateDesign('d1', { name: 'Updated' }, 'user1');
        expect(result?.id).toBe('d1');
      });
      it('should return null on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        const result = await supabaseDb.updateDesign('d1', { name: 'Updated' }, 'user1');
        expect(result).toBeNull();
      });
    });

    describe('deleteDesign', () => {
      it('should delete design', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ error: null }));
        const result = await supabaseDb.deleteDesign('d1', 'user1');
        expect(result).toBe(true);
      });
    });
  });

  describe('RSVPs', () => {
    describe('getRSVPs', () => {
      it('should fetch RSVPs', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: [{ id: 'r1' }], error: null }));
        const result = await supabaseDb.getRSVPs('inv1');
        expect(result).toHaveLength(1);
      });
      it('should throw on error', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ data: null, error: new Error('Error') }));
        await expect(supabaseDb.getRSVPs('inv1')).rejects.toThrow('Error');
      });
    });

    describe('createRSVP', () => {
      it('should insert RSVP', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null });
        const result = await supabaseDb.createRSVP({ name: 'Test' } as unknown as Parameters<typeof supabaseDb.createRSVP>[0], 'inv1');
        expect(result.id).toBe('r1');
      });
      it('should throw on error', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') });
        await expect(supabaseDb.createRSVP({ name: 'Test' } as unknown as Parameters<typeof supabaseDb.createRSVP>[0], 'inv1')).rejects.toThrow('Error');
      });
    });

    describe('upsertRSVP', () => {
      it('should create if no email provided', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null });
        const result = await supabaseDb.upsertRSVP({ name: 'Test' } as unknown as Parameters<typeof supabaseDb.upsertRSVP>[0], 'inv1');
        expect(result.isUpdate).toBe(false);
      });

      it('should create if email provided but not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: null }); // find
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null }); // insert
        const result = await supabaseDb.upsertRSVP({ name: 'Test', email: 'test@test.com' } as unknown as Parameters<typeof supabaseDb.upsertRSVP>[0], 'inv1');
        expect(result.isUpdate).toBe(false);
      });

      it('should update if email provided and found', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null }); // find
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null }); // update
        const result = await supabaseDb.upsertRSVP({ name: 'Test', email: 'test@test.com' } as unknown as Parameters<typeof supabaseDb.upsertRSVP>[0], 'inv1');
        expect(result.isUpdate).toBe(true);
      });
      
      it('should throw if update fails', async () => {
        mockSingle.mockResolvedValueOnce({ data: { id: 'r1' }, error: null }); // find
        mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Error') }); // update fails
        await expect(supabaseDb.upsertRSVP({ name: 'Test', email: 'test@test.com' } as unknown as Parameters<typeof supabaseDb.upsertRSVP>[0], 'inv1')).rejects.toThrow('Error');
      });
    });

    describe('deleteRSVP', () => {
      it('should delete RSVP', async () => {
        (mockQueryBuilder.then as jest.Mock).mockImplementationOnce((resolve: ResolveFn) => resolve({ error: null }));
        const result = await supabaseDb.deleteRSVP('r1');
        expect(result).toBe(true);
      });
    });
  });

  describe('Storage', () => {
    describe('uploadDesignImage', () => {
      it('should upload image', async () => {
        mockUpload.mockResolvedValueOnce({ error: null });
        const result = await supabaseDb.uploadDesignImage('file.jpg', new Uint8Array(), 'image/jpeg');
        expect(result.error).toBeNull();
        expect(mockUpload).toHaveBeenCalledWith('file.jpg', expect.any(Uint8Array), expect.any(Object));
      });
    });

    describe('getDesignPublicUrl', () => {
      it('should get public url', () => {
        mockGetPublicUrl.mockReturnValueOnce({ data: { publicUrl: 'http://url' } });
        const result = supabaseDb.getDesignPublicUrl('file.jpg');
        expect(result).toBe('http://url');
      });
      
      it('should return null if no url', () => {
        mockGetPublicUrl.mockReturnValueOnce({ data: null });
        const result = supabaseDb.getDesignPublicUrl('file.jpg');
        expect(result).toBeNull();
      });
    });

    describe('deleteDesignImage', () => {
      it('should delete image', async () => {
        mockRemove.mockResolvedValueOnce({ error: null });
        await supabaseDb.deleteDesignImage('file.jpg');
        expect(mockRemove).toHaveBeenCalledWith(['file.jpg']);
      });
    });
  });
});
