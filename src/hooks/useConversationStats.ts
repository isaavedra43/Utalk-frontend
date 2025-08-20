import { useMemo } from 'react';
import { useChatStore } from '../stores/useChatStore';

// Hook ligero: calcula estadísticas desde el store sin hacer fetch ni efectos
export const useConversationStats = () => {
	const { conversations } = useChatStore();

	const stats = useMemo(() => {
		const total = conversations.length;
		const unread = conversations.reduce((sum, conv) => sum + (conv?.unreadCount || 0), 0);
		const assigned = conversations.filter((conv) => Boolean(conv?.assignedTo)).length;
		const urgent = conversations.filter((conv) => conv?.priority === 'urgent').length;
		const open = conversations.filter((conv) => conv?.status === 'open').length;

		return { total, unread, assigned, urgent, open };
	}, [conversations]);

	return stats;
}; 