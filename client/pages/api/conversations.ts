import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@lib/withAuth';
import { db } from '@lib/firebaseAdmin';

type Conversation = {
  id: string;
  phoneNumber: string;
  lastText: string;
  lastTimestamp: Date;
  channel: string;
};

const conversationsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Conversation[] | { error: string }>
) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const conversationsSnap = await db
      .collection('conversations')
      .orderBy('lastMessageTimestamp', 'desc')
      .get();

    if (conversationsSnap.empty) {
      return res.status(200).json([]);
    }

    const conversations: Conversation[] = conversationsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        phoneNumber: data.phoneNumber,
        lastText: data.lastText,
        lastTimestamp: data.lastMessageTimestamp.toDate(),
        channel: data.channel,
      };
    });

    return res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default withAuth(conversationsHandler); 