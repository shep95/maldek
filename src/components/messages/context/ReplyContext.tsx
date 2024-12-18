import { createContext } from "react";
import { Message } from "@/types/messages";

interface ReplyContextType {
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
}

export const ReplyContext = createContext<ReplyContextType>({
  replyingTo: null,
  setReplyingTo: () => {},
});