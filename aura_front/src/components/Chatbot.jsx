import React, { useState } from 'react';
import { BsMicFill } from 'react-icons/bs';
import { IoSendSharp } from 'react-icons/io5';
import { TbLayoutSidebarLeftExpand, TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { AiOutlinePlus } from 'react-icons/ai';
import './Chatbot.css';

const Chatbot = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        isUser: true,
        timestamp: new Date().getTime()
      };

      if (currentConversationId === null) {
        const newConversation = {
          id: conversations.length,
          name: inputMessage,
          messages: [newMessage]
        };
        setConversations([...conversations, newConversation]);
        setCurrentConversationId(newConversation.id);
      } else {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          )
        );
      }

      setInputMessage('');

      setTimeout(() => {
        const botResponse = {
          text: "Gracias por tu mensaje. ¿Hay algo más en lo que pueda ayudarte?",
          isUser: false,
          timestamp: new Date().getTime()
        };
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, botResponse] }
              : conv
          )
        );
      }, 1000);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
  };

  const handleCreateNewConversation = () => {
    setCurrentConversationId(null);
    setInputMessage('');
  };

  const currentConversation = conversations.find(conv => conv.id === currentConversationId);

  return (
    <div className="chatbot-container">
      {/* Header fijo */}
      <div className="header">
        <div className="sidebar-toggle-container">
          <button className="sidebar-toggle" onClick={handleSidebarToggle}>
            {isSidebarOpen ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
          </button>
          <div className="sidebar-title">
            <span className="aura">AURA</span>
            <span className="chat">Chat</span>
          </div>
        </div>
      </div>

      <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <h3>Conversaciones</h3>
        <button className="new-conversation" onClick={handleCreateNewConversation}>
          <AiOutlinePlus /> Crear nueva
        </button>
        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="conversation-name"
              onClick={() => handleSelectConversation(conv.id)}
              title={conv.name}
            >
              {conv.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-content">
        {!currentConversation ? (
          <div className="initial-view">
            <img src="/aura-bot.png" alt="AURA Bot" className="bot-avatar-large" />
            <p className="welcome-text">
              Hola! Soy <span className="aura-text">AURA</span>,<br /> ¿En qué puedo ayudarte?
            </p>
            <form onSubmit={handleSendMessage} className="input-container initial-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Envía un mensaje o háblame por voz"
                className="message-input"
              />
              <button type="button" className="mic-button">
                <BsMicFill />
              </button>
              <button type="submit" className="send-button">
                <IoSendSharp />
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-view">
            <div className="messages-container">
              {currentConversation.messages.map((message, index) => (
                <div key={index} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
                  {!message.isUser && (
                    <img src="/aura-bot.png" alt="AURA Bot" className="bot-avatar-small" />
                  )}
                  <div className="message-content">{message.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="input-container chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Envía un mensaje o háblame por voz"
                className="message-input"
              />
              <button type="button" className="mic-button">
                <BsMicFill />
              </button>
              <button type="submit" className="send-button">
                <IoSendSharp />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
