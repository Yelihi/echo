import type { RoleplayLine } from "@/entities/roleplay-material";
import type { LineId, SpeakerId } from "@/entities/value-object";

export interface ChatMessageProps extends Omit<RoleplayLine, "translation"> {
  id: LineId;
  order: 1 | 2;
  speakerId: SpeakerId;
  text: string;
  changeOrder: (id: LineId, order: 1 | 2) => void;
  changeMessage: (id: LineId, text: string) => void;
}

export type AllChatMessagesProps = ChatMessageProps[];

export interface RoleplayChatContainerProps {
  messages: AllChatMessagesProps;
}
