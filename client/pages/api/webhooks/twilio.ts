// Webhook de Twilio para recepción de mensajes entrantes (WhatsApp/SMS).
// Este endpoint es invocado por Twilio cada vez que tu número recibe un mensaje.
// Requiere que las variables de entorno de Twilio estén definidas en Vercel/.env.local.
// Guarda el mensaje en Firestore y responde XML vacío para evitar reintentos.

import type { NextApiRequest, NextApiResponse } from 'next'
import { db, admin } from '@lib/firebaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Método no permitido')
  }

  // Extraer datos del body enviado por Twilio
  const { From, Body } = req.body
  if (!From || !Body) {
    return res.status(400).json({ error: 'Faltan parámetros' })
  }

  // Buscar o crear la conversación con ID = número del remitente
  const convRef = db.collection('conversations').doc(From);
  const convSnap = await convRef.get()

  const dataToSet = {
    phoneNumber: From,
    channel: 'twilio',
    lastText: Body,
    lastMessageTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (!convSnap.exists) {
    dataToSet['createdAt'] = admin.firestore.FieldValue.serverTimestamp();
  }

  // Usar set con merge para crear o actualizar la conversación
  await convRef.set(dataToSet, { merge: true });

  // Guardar el mensaje en la subcolección 'messages' de la conversación
  await convRef.collection('messages').add({
    sender: From,
    text: Body,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    channel: 'twilio',
  })

  // Responder a Twilio con XML vacío para confirmar recepción
  res.setHeader('Content-Type', 'text/xml')
  return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
} 