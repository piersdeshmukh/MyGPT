import "./chatPage.css";
import NewPrompt from '../../components/newPrompt/NewPrompt'
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { IKImage } from "imagekitio-react";
import React, { useEffect, useState } from 'react';

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const [isNewChat, setIsNewChat] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  // Determine if this is a new chat (only has one message from user)
  useEffect(() => {
    if (data && data.history && data.history.length === 1 && data.history[0].role === "user") {
      setIsNewChat(true);
    } else {
      setIsNewChat(false);
    }
  }, [data]);

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
        {isPending
            ? "Loading..."
            : error
            ? ""
            : data?.history?.map((message, i) => (
                <React.Fragment key={i}>
                  {message.img && (
                    <IKImage
                      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                      path={message.img}
                      height="300"
                      width="400"
                      transformation={[{ height: 300, width: 400 }]}
                      loading="lazy"
                      lqip={{ active: true, quality: 20 }}
                    />
                  )}
                  <div
                    className={
                      message.role === "user" ? "message user" : "message"
                    }
                  >
                    <Markdown>{message.parts[0].text}</Markdown>
                  </div>
                </React.Fragment>
              ))}

          {data && <NewPrompt data={data} isNewChat={isNewChat} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;