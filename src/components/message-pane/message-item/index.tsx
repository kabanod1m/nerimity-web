import styles from './styles.module.scss';
import { classNames, conditionalClass } from '@/common/classNames';
import { formatTimestamp } from '@/common/date';
import Avatar from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { MessageType, RawMessage } from '@/chat-api/RawData';
import { Message, MessageSentStatus } from '@/chat-api/store/useMessages';
import { deleteMessage } from '@/chat-api/services/MessageService';
import RouterEndpoints from '@/common/RouterEndpoints';
import { Link, useParams } from 'solid-named-router';
import useStore from '@/chat-api/store/useStore';
import { onMount, Show } from 'solid-js';


function FloatOptions(props: { message: RawMessage, isCompact?: boolean | number }) {

  const onDeleteClick = () => {
    deleteMessage({channelId: props.message.channelId, messageId: props.message.id});
  }
  
  return (
    <div class={styles.floatOptions}>
      {props.isCompact && (<div class={styles.floatDate}>{formatTimestamp(props.message.createdAt)}</div>)}
      <Show when={props.message.type === MessageType.CONTENT} ><div class={styles.item}><Icon size={18} name='edit' class={styles.icon} /></div></Show>
      <div class={styles.item} onClick={onDeleteClick}><Icon size={18} name='delete' class={styles.icon} color='var(--alert-color)' /></div>
    </div>
  )
}





const MessageItem = (props: { message: Message, beforeMessage?: Message | false, animate?: boolean }) => {
  
  const params = useParams();
  const {serverMembers} = useStore();
  const serverMember = () => params.serverId ? serverMembers.get(params.serverId, props.message.createdBy.id) : undefined;

  const systemMessage = () => {
    switch (props.message.type) {
      case MessageType.JOIN_SERVER:
        return {icon: "", message: "has joined the server."}
      case MessageType.LEAVE_SERVER:
        return {icon: "", message: "has left the server."}
      case MessageType.KICK_USER:
        return {icon: "", message: "has been kicked."}
      case MessageType.BAN_USER:
        return {icon: "", message: "has been banned."}
      default:
        return undefined;
    }
  }
  
  const Details = () => (
    <div class={styles.details}>
      <Link to={RouterEndpoints.PROFILE(props.message.createdBy.id)} class={conditionalClass(systemMessage(), styles.systemMessageAvatar)}>
        <Avatar hexColor={props.message.createdBy.hexColor} size={systemMessage() ? 23 : 30} />
      </Link>
      <Link class={styles.username} to={RouterEndpoints.PROFILE(props.message.createdBy.id)} style={{color: serverMember()?.roleColor()}}>
        {props.message.createdBy.username}
      </Link>
      <Show when={systemMessage()}>
        <div class={styles.systemMessage}>{systemMessage()?.message}</div>
      </Show>
      <div class={styles.date}>{formatTimestamp(props.message.createdAt)}</div>
    </div>
  )

  const currentTime = new Date(props.message?.createdAt).getTime();
  const beforeMessageTime = props.beforeMessage && new Date(props.beforeMessage?.createdAt!).getTime()

  const isSameCreator = () => props.beforeMessage && props.beforeMessage?.createdBy?.id === props.message?.createdBy?.id;
  const isDateUnderFiveMinutes = () => beforeMessageTime && (currentTime- beforeMessageTime) < 300000;


  const isCompact = () => isSameCreator() && isDateUnderFiveMinutes();


  return (
    <div class={classNames(styles.messageItem, conditionalClass(isCompact(), styles.compact), conditionalClass(props.animate, styles.animate))}>
      <FloatOptions isCompact={isCompact()} message={props.message} />
      <div class={styles.messageItemOuterContainer}>
        <div class={styles.messageItemContainer}>
          {isCompact() ? null : <Details />}
          <div class={styles.messageContainer}>
            {props.message.sentStatus === MessageSentStatus.FAILED && <Icon name='error_outline' size={14} color="var(--alert-color)" class={styles.messageStatus} />}
            {props.message.sentStatus === MessageSentStatus.SENDING && <Icon name='query_builder' size={14} color="rgba(255,255,255,0.4)" class={styles.messageStatus} />}
            <div class={styles.content}>{props.message.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

