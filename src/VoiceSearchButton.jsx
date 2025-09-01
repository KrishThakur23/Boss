import React, { useState, useEffect } from 'react';
import './VoiceSearchButton.css';

const VoiceSearchButton = ({ className, 'aria-label': ariaLabel, title, searchInput }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 3;

      setRecognition(recognitionInstance);
    }
  }, []);

  const startRecording = () => {
    if (!recognition) {
      showVoiceError('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setIsRecording(true);
      
      recognition.start();
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (interimTranscript && searchInput) {
          searchInput.value = interimTranscript;
          searchInput.style.color = '#666';
        }
        
        if (finalTranscript && searchInput) {
          searchInput.value = finalTranscript;
          searchInput.style.color = '#1f2937';
          searchInput.dispatchEvent(new Event('input'));
          showVoiceSuccess('Voice input received: ' + finalTranscript);
          setTimeout(() => stopRecording(), 1000);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = '';
        
        switch(event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access blocked. Please enable microphone permissions.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice service not available. Please try again later.';
            break;
          default:
            errorMessage = 'Voice recognition error. Please try again.';
        }
        
        showVoiceError(errorMessage);
        stopRecording();
      };
      
      recognition.onend = () => {
        if (isRecording) {
          setTimeout(() => {
            if (isRecording) {
              recognition.start();
            }
          }, 100);
        }
      };
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      showVoiceError('Failed to start voice recognition. Please try again.');
      stopRecording();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    try {
      recognition?.stop();
    } catch (error) {
      console.log('Recognition already stopped');
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const showVoiceSuccess = (message) => {
    showNotification(message, '#10b981');
  };

  const showVoiceError = (message) => {
    showNotification(message, '#ef4444');
  };

  const showNotification = (message, backgroundColor) => {
    let notification = document.getElementById('voice-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'voice-notification';
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(notification);
    }
    
    notification.style.background = backgroundColor;
    notification.textContent = message;
    notification.style.transform = 'translateX(0)';
    
    const hideTime = backgroundColor === '#ef4444' ? 5000 : 3000;
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
    }, hideTime);
  };

  return (
    <button
      className={`${className} ${isRecording ? 'recording' : ''}`}
      aria-label={ariaLabel}
      title={isRecording ? 'Click to stop recording' : title}
      onClick={handleClick}
    >
      {isRecording ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" fill="currentColor"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )}
    </button>
  );
};

export default VoiceSearchButton;
