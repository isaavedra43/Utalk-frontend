import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} not allowed`);
  }

  const { conversation, sender, content } = req.body;

  if (!conversation?.id || !sender?.id || !content) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }

  const conversationRef = db.collection('conversations').doc(`${conversation.id}`);

  await conversationRef.set(
    {
      id: conversation.id,
      phoneNumber: sender.phone_number || 'N/A',
      lastText: content,
      lastTimestamp: new Date(),
      channel: 'chatwoot',
    },
    { merge: true }
  );

  await conversationRef.collection('messages').add({
    sender: sender.name || 'Desconocido',
    text: content,
    timestamp: new Date(),
    channel: 'chatwoot',
  });

  res.status(200).json({ success: true });
} 