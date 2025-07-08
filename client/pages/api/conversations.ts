import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/firebaseAdmin'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('conversations').get()
      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      return res.status(200).json(conversations)
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener conversaciones' })
    }
  }
  if (req.method === 'POST') {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Falta el título' })
    }
    try {
      const docRef = await db.collection('conversations').add({ title, members: [] })
      return res.status(201).json({ id: docRef.id, title, members: [] })
    } catch (error) {
      return res.status(500).json({ error: 'Error al crear conversación' })
    }
  }
  return res.status(405).json({ error: 'Método no permitido' })
}

export default withAuth(handler) 