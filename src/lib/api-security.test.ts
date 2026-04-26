import { addSecurityHeaders } from './api-security';
import { NextResponse } from 'next/server';

describe('api-security', () => {
  describe('addSecurityHeaders', () => {
    it('should add X-Request-ID and X-API-Version headers', () => {
      const response = NextResponse.json({ success: true });
      const responseWithHeaders = addSecurityHeaders(response);

      const requestId = responseWithHeaders.headers.get('X-Request-ID');
      const apiVersion = responseWithHeaders.headers.get('X-API-Version');

      expect(requestId).toBeDefined();
      expect(requestId).toMatch(/^req_\d+_[0-9a-f-]{36}$/);
      expect(apiVersion).toBe('1.0');
    });

    it('should generate unique request IDs', () => {
      const response1 = addSecurityHeaders(NextResponse.json({}));
      const response2 = addSecurityHeaders(NextResponse.json({}));

      const id1 = response1.headers.get('X-Request-ID');
      const id2 = response2.headers.get('X-Request-ID');

      expect(id1).not.toBe(id2);
    });
  });
});
