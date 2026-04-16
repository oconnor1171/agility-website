# Agility Accounting & Advisors Website

## Overview
Static website for Agility Accounting & Advisors with integrated chat widgets for booking appointments and answering questions about services.

## Features
- **Seamless Chat Integration**: Two chat widgets that can hand off to each other based on user intent
- **Booking Chat Widget**: Interactive appointment scheduling with Google Calendar integration
- **AI Questions Chat Widget**: Intelligent Q&A about services, pricing, and industries using Claude API
- **Automatic Handoff**: Widgets detect intent and seamlessly switch between booking and Q&A modes
- **Financial Analysis Landing Page**: Dedicated page for operational benchmarking services
- **Responsive Design**: Mobile-friendly across all devices

## Chat Widgets

### Booking Widget (chat-widget.js)
- **Location**: Site-wide floating chat button
- **Capabilities**:
  - Appointment booking with Google Calendar integration
  - Q&A mode for common questions (pricing, services, industries, timelines)
  - AI-powered responses for complex questions via API
  - Automatic handoff to booking when AI detects scheduling intent
- **Smart Features**:
  - Keyword-based quick responses for simple questions
  - AI fallback for detailed inquiries
  - Seamless transition to booking flow

### AI Questions Widget (financial-analysis.js)
- **Location**: Financial analysis landing page
- **Capabilities**:
  - Intelligent responses using Anthropic Claude API
  - Service information, pricing details, industry coverage
  - Booking intent detection with automatic handoff to booking widget
  - Contact information when API is unavailable
- **Smart Features**:
  - Detects booking-related keywords and offers to switch to booking
  - Adds action buttons for booking or contact when appropriate
  - Graceful fallbacks with contact information

### Seamless Integration
The widgets work together to provide a unified experience:
- **From Booking Widget**: Complex questions trigger AI responses
- **From AI Widget**: Booking intent triggers switch to booking flow
- **User Experience**: Single conversation flow, no visible switching
- **Fallbacks**: Both widgets work independently if the other is unavailable

## Deployment

### Render Setup
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set the `ANTHROPIC_API_KEY` environment variable in Render dashboard
4. Deploy the static site with serverless API

### Local Development
```bash
# Install dependencies for API (if testing locally)
cd api
npm install

# Start local server
python -m http.server 8000
# or
npx serve .

# Test API locally (requires ANTHROPIC_API_KEY)
cd api
node index.js
```

## File Structure
```
/
├── index.html                 # Homepage
├── pages/                     # Additional pages
├── css/
│   ├── style.css             # Main stylesheet
│   └── financial-analysis.css # Landing page styles
├── js/
│   ├── main.js               # Main site functionality
│   ├── chat-widget.js        # Booking/Q&A widget
│   ├── financial-analysis.js # AI chat widget
│   └── lead-capture.js       # Lead capture forms
├── api/                      # Serverless API
│   ├── index.js             # Express server
│   └── package.json         # Dependencies
└── render.yaml              # Render deployment config
```

## API Endpoints
- `POST /api/chat` - AI chat responses
- `GET /api/health` - Health check

## Environment Variables
- `ANTHROPIC_API_KEY` - Required for AI chat functionality

## Browser Support
- Modern browsers with ES6+ support
- Mobile responsive design
- Graceful fallbacks for API failures