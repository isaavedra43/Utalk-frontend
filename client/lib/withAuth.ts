import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { admin } from '@lib/firebaseAdmin'

// Wrapper para proteger API Routes con Firebase Auth
export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token proporcionado' })
    }
    const idToken = authHeader.split('Bearer ')[1]
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      ;(req as any).user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: 'Token inválido' })
    }
  }
} 