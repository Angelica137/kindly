'use client';
import ConversationCard from './ConversationCard';
import { useEffect, useState } from 'react';
import { createSupabaseClient as supabase } from '@/utils/supabase/createSupabaseClient';
import { ConversationCardType } from '@/types/messagingTypes';
import { useConversationContext } from '@/context/conversationContext';
import selectItemImageAndName from '@/utils/messaging/selectItemImageAndName';

const ConversationsList: React.FC = () => {
  const {
    allConversations,
    setAllConversations,
    setCurrentConversation,
    setShowConversationsList,
    currentUserId,
  } = useConversationContext();

  const [notificationList, setNotificationList] = useState<number[]>([]);

  const updateOpenConvo = async (givenId: number) => {
    setCurrentConversation &&
      setCurrentConversation(
        allConversations?.filter(
          (conversations) => conversations.conversation_id === givenId
        )[0]
      );

    setShowConversationsList(false);
  };

  useEffect(() => {
    const channel = supabase
      .channel('realtime conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_conversations',
          filter: `user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          if (payload.new.user_id === currentUserId) {
            const newConversation = await selectItemImageAndName(
              payload.new as ConversationCardType
            );

            setAllConversations((prevConversations) => [
              ...prevConversations,
              newConversation,
            ]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_conversations',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.has_unread_messages) {
            setNotificationList((prevState) => {
              if (!prevState.includes(payload.new.conversation_id)) {
                return [...prevState, payload.new.conversation_id];
              }
              return prevState;
            });
          }
          if (!payload.new.has_unread_messages) {
            setNotificationList((prevState) => {
              return prevState.filter(
                (conversationId) =>
                  conversationId !== payload.new.conversation_id
              );
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_conversations',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          setAllConversations((prevConversations) => [
            ...prevConversations.filter(
              (conversation) => conversation.id !== payload.old.id
            ),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, allConversations, setAllConversations]);

  return (
    <div className='m-4 overflow-y-auto'>
      {allConversations.length > 0 ? (
        allConversations.map((conversation) => (
          <div key={`${conversation.id}`}>
            <ConversationCard
              conversationId={conversation.conversation_id}
              joinedAt={conversation.joined_at}
              itemName={conversation.items.item_name}
              imageSrc={conversation.items.imageSrc}
              clickHandler={() => updateOpenConvo(conversation.conversation_id)}
              notificationList={notificationList}
            />
          </div>
        ))
      ) : (
        <p>There are no active conversations</p>
      )}
    </div>
  );
};

export default ConversationsList;
