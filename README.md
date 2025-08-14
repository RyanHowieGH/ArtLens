# ArtLens

ArtLens is a mobile and backend platform that allows users to discover and learn about public art using the power of image recognition and AI. By simply taking a photo of a mural, painting, or sculpture, ArtLens identifies the artwork and provides rich information about its history, artist, and fun trivia.

## Features

- **Instant Artwork Identification:**  
  Snap a photo (or upload one) of public art, and ArtLens uses Google Vision and Perplexity Vision AI to recognize and identify the piece.

- **Rich Artwork Details:**  
  For recognized works, the app provides the official title, artist, a concise history, three trivia facts, and a high-quality thumbnail image.

- **Location-Aware Search:**  
  Leverages your device’s location (with permission) to improve identification accuracy and context.

- **Favorites System:**  
  Save your favorite artworks for quick access later.

- **Multilingual Support:**  
  View artwork details in English, Spanish, or French.

- **Accessible Experience:**  
  “Read Aloud” feature lets users listen to artwork details.

## How It Works

- The mobile app (React Native/Expo) lets users take or choose a photo and optionally share their location.
- The backend server (Node.js/Express) receives the image and location, uses Google Vision to make a best guess, and if necessary, falls back to Perplexity Vision for a more thorough search.
- The backend then generates a JSON response with the artwork’s title, artist, history, trivia, and thumbnail.
- On failure to identify, users are notified gracefully.

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js, Express
- **AI Services:** Google Vision API, Perplexity Vision, OpenAI GPT-3.5
- **State & Context:** React Context API for language and favorites

## Directory Structure

- `ArtLens-Mobile/` – Mobile app source code
- `artlens-backend/` – Backend API and processing logic

## Getting Started

> _Note: This project is private and requires API keys for Google Vision, Perplexity, and OpenAI._

1. **Clone the repo**  
   `git clone https://github.com/RyanHowieGH/ArtLens.git`
2. **Backend Setup:**
   - Add your `gcp-credentials.json` to `artlens-backend/`
   - Set environment variables for API keys in a `.env` file
   - Install dependencies: `npm install`
   - Start the server: `npm start`
3. **Mobile App Setup:**
   - Go to `ArtLens-Mobile/`
   - Install dependencies: `npm install`
   - Run with Expo: `npx expo start`

## Example Usage

1. Open the mobile app and tap “Analyze”.
2. Take a photo of a mural or artwork.
3. Wait a moment as ArtLens identifies the piece and displays detailed info.
4. Save to favorites or have the app read the info aloud.

## Contributing

This project is under active development by RyanHowieGH. PRs and issues are welcome.

## License

_This repository does not yet specify a license. Please contact the owner before using for public or commercial purposes._

---
Created by [RyanHowieGH](https://github.com/RyanHowieGH)
