import { useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { RxHamburgerMenu } from 'react-icons/rx';
import './Chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <RxHamburgerMenu className="menu-icon" />
      </div>
      
      <div className="chatbot-content">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <img 
              src="/aura-bot.png" 
              alt="AURA Bot" 
              className="aura-logo"
            />
            <h1 className="welcome-text">
              Hola! Soy <span className="aura-text">AURA</span>,
              <br />¿En qué puedo ayudarte?
            </h1>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${message.sender === 'user' ? 'user-message' : 'bot-message'} message`}
              >
                {message.sender === 'bot' && (
                  <div className="bot-avatar">
                    <img src="/aura-bot.png" alt="AURA" />
                  </div>
                )}
                <div className="message-content">
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="initial-input-container">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Envía un mensaje o háblame por voz"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="send-button">
              <IoSend />
            </button>
            <button type="button" className="voice-button">
              <FaMicrophone />
            </button>
          </form>
        </div>
      ) : (
        <div className="input-container">
          <form onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Envía un mensaje o háblame por voz"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button type="submit" className="send-button">
              <IoSend />
            </button>
            <button type="button" className="voice-button">
              <FaMicrophone />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
