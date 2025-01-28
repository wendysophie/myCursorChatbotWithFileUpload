import React, { useState, useRef } from 'react';
import './ChatApp.css';

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && files.length === 0) return;

    setIsLoading(true);
    
    try {
      // Create a regular JSON request instead of FormData
      const response = await fetch('http://localhost:9000/chat-with-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: inputMessage
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }
      
      setMessages(prev => [...prev, 
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: data.text }
      ]);
      
      setInputMessage('');
      setFiles([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    setFiles(Array.from(e.target.files));
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">My Chatbot</h1>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.files && message.files.length > 0 && (
              <div className="file-attachments">
                {message.files.map((file, fileIndex) => (
                  <div key={fileIndex} className="file-badge">
                    📎 {file.name}
                  </div>
                ))}
              </div>
            )}
            <p>{message.content}</p>
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.txt"
            style={{ display: 'none' }}
          />
          <button 
            type="button" 
            className="upload-button"
            onClick={() => fileInputRef.current.click()}
          >
            📎
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button type="submit" className="send-button" disabled={isLoading}>
            Send
          </button>
        </div>
        {files.length > 0 && (
          <div className="selected-files">
            {files.map((file, index) => (
              <span key={index} className="file-badge">
                📎 {file.name}
              </span>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default ChatApp;
