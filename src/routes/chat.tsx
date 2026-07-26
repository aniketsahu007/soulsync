import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { MobileChatPage } from "@/components/mobile/MobilePublicPages";
import { ResponsivePage } from "@/components/responsive/ResponsivePage";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <ResponsivePage
      DesktopComponent={DesktopChatPage}
      MobileComponent={MobileChatPage}
    />
  );
}

function DesktopChatPage() {
  return (
    <div className="flex flex-col h-screen pt-16">
      <Navbar />
      <ChatInterface />
    </div>
  );
}

