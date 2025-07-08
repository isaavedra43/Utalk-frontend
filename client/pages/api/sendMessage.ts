// Endpoint para enviar mensajes al cliente real vía Twilio y guardar en Firestore.
// Protegido: solo usuarios autenticados pueden enviar mensajes.
// Requiere variables de entorno TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER.

import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@lib/withAuth'
import { db, admin } from '@lib/firebaseAdmin'
import Twilio from 'twilio'

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }
  // Leer y validar parámetros
  const { cid, text } = req.body
  if (!cid || !text || !text.trim()) {
    return res.status(400).json({ error: 'Faltan parámetros o el mensaje está vacío' })
  }
  // Obtener phoneNumber de la conversación
  const convRef = db.collection('conversations').doc(cid)
  const convSnap = await convRef.get()
  if (!convSnap.exists) {
    return res.status(404).json({ error: 'Conversación no encontrada' })
  }
  const { phoneNumber } = convSnap.data() || {}
  if (!phoneNumber) {
    return res.status(400).json({ error: 'La conversación no tiene phoneNumber' })
  }
  try {
    // Enviar mensaje real por Twilio
    await client.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_NUMBER,
      body: text,
    })
    // Guardar mensaje en Firestore
    const msg = {
      sender: (req as any).user?.uid,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      channel: 'web',
    }
    const docRef = await convRef.collection('messages').add(msg)
    const savedMsg = { id: docRef.id, ...msg }
    return res.status(201).json(savedMsg)
  } catch (error) {
    return res.status(500).json({ error: 'Error enviando mensaje' })
  }
}

export default withAuth(handler) 