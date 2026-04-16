// Financial Analysis Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // FAQ Accordion
  const faqItems = document.querySelectorAll('.fa-faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('open');
    });
  });

  // Scroll to mock on CTA click
  const scrollBtn = document.querySelector('.fa-cta-outline');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const mock = document.querySelector('.fa-mock-panel');
      if (mock) {
        mock.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        mock.style.boxShadow = '0 0 0 3px rgba(158,140,44,0.3)';
        setTimeout(() => {
          mock.style.boxShadow = '';
        }, 2000);
      }
    });
  }

  // Mock Analysis Tabs
  const mockTabs = document.querySelectorAll('.fa-mock-tab');
  const mockSections = document.querySelectorAll('.fa-mock-section');

  mockTabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      mockTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      this.classList.add('active');

      // Hide all sections
      mockSections.forEach(section => {
        section.style.display = 'none';
      });

      // Show corresponding section
      const sectionClasses = ['operational-analysis', 'income-statement', 'benchmarks', 'cost-analysis'];
      const targetSection = document.querySelector('.fa-mock-section.' + sectionClasses[index]);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });

  // Contact Form Submission to Google Apps Script
  const form = document.querySelector('.fa-contact-form');
  if (form) {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKtwnBjH6N71jFsFRMbTrRzHC8LW6waau2Fam77l9Ne_F_fd1_qXECsZIqQgZsicJU6Q/exec';

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const firstName = form.querySelector('input[name="firstName"]').value.trim();
      const lastName = form.querySelector('input[name="lastName"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();
      const company = form.querySelector('input[name="company"]').value.trim();
      const website = form.querySelector('input[name="website"]').value.trim();
      const phone = form.querySelector('input[name="phone"]').value.trim();
      const industry = form.querySelector('select[name="industry"]').value.trim();
      const notes = form.querySelector('textarea[name="notes"]')?.value.trim() || '';

      if (!firstName || !lastName || !email) {
        alert('Please fill in all required fields (First Name, Last Name, Email).');
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      const payload = {
        firstName,
        lastName,
        email,
        website,
        phone,
        company,
        industry,
        notes
      };

      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fa-success-msg';
        successMsg.textContent = 'Thank you! We\'ll be in touch within 24 hours to schedule your free consultation.';
        form.appendChild(successMsg);

        // Reset form
        form.reset();

        // Remove success message after 5 seconds
        setTimeout(() => {
          if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
          }
        }, 5000);
      } catch (err) {
        alert('There was an error submitting the form. Please try again or email us at oconnor1171@gmail.com');
      }
    });
  }

  // Chat Widget
  let chatOpen = false;
  let chatMsgs = [
    { role: 'bot', text: 'Hi! I\'m the Agility assistant. Ask me anything about our financial analysis services, pricing, industries we cover, or how to get started.' }
  ];
  let chatLoading = false;

  const chatToggle = document.querySelector('.fa-chat-toggle');
  const chatPanel = document.querySelector('.fa-chat-panel');
  const chatInput = document.querySelector('.fa-chat-input');
  const chatSend = document.querySelector('.fa-chat-send');
  const chatMessages = document.querySelector('.fa-chat-messages');

  function updateChatUI() {
    // Toggle panel visibility
    chatPanel.style.display = chatOpen ? 'flex' : 'none';
    chatToggle.innerHTML = chatOpen ? '✕' : '💬';

    // Update messages
    chatMessages.innerHTML = '';
    chatMsgs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `fa-chat-msg ${msg.role}`;
      msgDiv.textContent = msg.text;
      chatMessages.appendChild(msgDiv);

      // Add action buttons if needed
      if (msg.action) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'fa-chat-actions';
        actionDiv.style.marginTop = '8px';

        if (msg.action === 'booking') {
          const bookBtn = document.createElement('button');
          bookBtn.className = 'fa-chat-action-btn';
          bookBtn.textContent = 'Book Consultation';
          bookBtn.onclick = function() {
            // Open main booking widget
            const mainChatBtn = document.querySelector('.chat-widget-btn');
            if (mainChatBtn) {
              mainChatBtn.click();
              // Switch to booking mode after opening
              setTimeout(() => {
                if (window.ChatWidget && window.ChatWidget.startBooking) {
                  window.ChatWidget.startBooking();
                }
              }, 500);
            } else {
              // Fallback - redirect to contact page
              window.open('pages/contact.html', '_blank');
            }
          };
          actionDiv.appendChild(bookBtn);
        } else if (msg.action === 'contact') {
          const contactBtn = document.createElement('button');
          contactBtn.className = 'fa-chat-action-btn';
          contactBtn.textContent = 'Contact Us';
          contactBtn.onclick = function() {
            window.open('pages/contact.html', '_blank');
          };
          actionDiv.appendChild(contactBtn);
        }

        msgDiv.appendChild(actionDiv);
      }
    });

    if (chatLoading) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'fa-chat-loading';
      loadingDiv.textContent = 'Typing...';
      chatMessages.appendChild(loadingDiv);
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Update send button
    chatSend.disabled = chatLoading;
  }

  if (chatToggle) {
    chatToggle.addEventListener('click', function() {
      chatOpen = !chatOpen;
      updateChatUI();
    });
  }

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || chatLoading) return;

    chatInput.value = '';
    chatMsgs.push({ role: 'user', text });
    chatLoading = true;
    updateChatUI();

    // Check for booking intent before calling API
    const lowerText = text.toLowerCase();
    const bookingKeywords = ['book', 'schedule', 'appointment', 'consultation', 'meeting', 'call', 'talk', 'speak', 'meet'];
    const hasBookingIntent = bookingKeywords.some(keyword => lowerText.includes(keyword));

    if (hasBookingIntent) {
      // Offer to switch to booking widget
      chatMsgs.push({
        role: 'bot',
        text: 'I\'d be happy to help you schedule a consultation! Let me connect you with our booking assistant who can help you find the perfect time.'
      });
      chatLoading = false;
      updateChatUI();

      // Add booking button after a short delay
      setTimeout(() => {
        chatMsgs.push({
          role: 'bot',
          text: '',
          action: 'booking'
        });
        updateChatUI();
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        let botReply = data.reply;

        // Check if AI response suggests booking
        const lowerReply = botReply.toLowerCase();
        const suggestsBooking = lowerReply.includes('schedule') || lowerReply.includes('consultation') ||
                               lowerReply.includes('appointment') || lowerReply.includes('call us') ||
                               lowerReply.includes('contact us');

        if (suggestsBooking) {
          botReply += '\n\nWould you like me to help you book a consultation?';
          chatMsgs.push({ role: 'bot', text: botReply, action: 'booking' });
        } else {
          chatMsgs.push({ role: 'bot', text: botReply });
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      chatMsgs.push({
        role: 'bot',
        text: 'I\'m sorry, I\'m having trouble connecting right now. Please call us at 410-456-2433 or email oconnor1171@gmail.com to schedule your free consultation.',
        action: 'contact'
      });
    }

    chatLoading = false;
    updateChatUI();
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Initialize chat UI
  updateChatUI();
});