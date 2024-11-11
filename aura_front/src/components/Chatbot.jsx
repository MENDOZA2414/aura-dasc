import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey] = useState('Bearer 4H0DHA5-1SGMFKH-K49YDJD-N7M51ME');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId !== null) {
      fetchConversation(currentConversationId);
    }
  }, [currentConversationId]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/v1/workspace/prueba', {
        headers: {
          'Authorization': apiKey
        }
      });
      
      const threads = response.data.workspace[0].threads || [];
      
      // Mapear los hilos y usar el `slug` como identificador
      const formattedThreads = threads.map((thread, index) => ({
        id: thread.slug,
        name: `Hilo ${index + 1}`, // Nombre predeterminado
        messages: [] // Inicialmente vacío
      }));
  
      setConversations(formattedThreads);
    } catch (error) {
      console.error('Error al obtener las conversaciones:', error);
    }
  };

  const fetchConversation = async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/workspace/prueba/thread/${conversationId}/chats`, {
        headers: {
          'Authorization': apiKey
        }
      });
      const fetchedMessages = response.data.history.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: msg.sentAt
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: fetchedMessages }
            : conv
        )
      );
    } catch (error) {
      console.error('Error al obtener la conversación:', error);
    }
  };

  const sendMessageToThread  = async (threadSlug, message) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/v1/workspace/prueba/thread/${threadSlug}/chat`,
        {
          message: message,
          mode: "chat", // o "query", según sea tu caso
          userId: 1 // ID del usuario si es necesario
        },
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        isUser: true,
        timestamp: new Date().getTime()
      };

      if (currentConversationId === null) {
        try {
          // Crear una nueva conversación si no hay una abierta
          const response = await axios.post('http://localhost:3001/api/v1/workspace/prueba/thread/new', {
            userId: 1,
            name: inputMessage,
            slug: `slug-${Date.now()}`
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': apiKey
            }
          });

          const newConversationId = response.data.thread.id;
          const newConversation = {
            id: newConversationId,
            name: inputMessage,
            messages: [newMessage]
          };
          setConversations([...conversations, newConversation]);
          setCurrentConversationId(newConversationId);
        } catch (error) {
          console.error('Error al crear un nuevo hilo:', error);
          return;
        }
      } else {
        // Agregar el mensaje a la conversación existente
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          )
        );

        try {
          // Enviar el mensaje al hilo específico
          const response = await sendMessageToThread (currentConversationId, inputMessage);

          const botResponseText = response.textResponse || 'No se recibió respuesta del modelo';
          const botResponse = {
            text: botResponseText,
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
        } catch (error) {
          console.error('Error al enviar el mensaje:', error);
          const errorResponse = {
            text: 'Hubo un error al conectar con la IA. Intenta nuevamente más tarde.',
            isUser: false,
            timestamp: new Date().getTime()
          };

          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversationId
                ? { ...conv, messages: [...conv.messages, errorResponse] }
                : conv
            )
          );
        } finally {
          setIsTyping(false);
        }
      }

      setInputMessage('');
      setIsTyping(true);
    }
  };

  const handleSelectConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    fetchConversation(conversationId);
    setIsSidebarOpen(false);
  };

  const handleCreateNewConversation = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/v1/workspace/prueba/thread/new', {
        userId: 1,
        name: inputMessage || 'Nueva Conversación',
        slug: `slug-${Date.now()}`
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        }
      });

      const newThreadId = response.data.thread.id;
      const newConversation = {
        id: newThreadId,
        name: inputMessage || 'Nueva Conversación',
        messages: []
      };

      setConversations([...conversations, newConversation]);
      setCurrentConversationId(newThreadId);
      setInputMessage('');
    } catch (error) {
      console.error('Error al crear nuevo hilo:', error);
    }
  };

  const currentConversation = conversations?.find(conv => conv.id === currentConversationId);

  return (
    <div className="chatbot-container">
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
              ¡Hola! Soy <span className="aura-text">AURA</span>,<br /> ¿En qué puedo ayudarte?
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
              {currentConversation.messages?.map((message, index) => (
                <div key={index} className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}>
                  {!message.isUser && (
                    <img src="/aura-bot.png" alt="AURA Bot" className="bot-avatar-small" />
                  )}
                  <div className="message-content">{message.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  <p>AURA está escribiendo<span className="dots">...</span></p>
                </div>
              )}
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
