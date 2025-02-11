# Chalchitra

Chalchitra is a movie discovery web application built using React and Vite. It allows users to search for movies, view trending movies, and explore detailed information about each movie, including cast, trailers, reviews, and similar movies. The app fetches data from The Movie Database (TMDb) API and provides a seamless user experience with debounced search and dynamic content updates.

## Features
- **Movie Search**: Users can search for movies using a debounced search bar that fetches results efficiently.
- **Trending Movies**: Displays a list of trending movies fetched from a backend service.
- **Movie Details**: Clicking on a movie opens a detailed view with information like:
  - Overview, runtime, release date, and ratings
  - Cast and crew details
  - Trailers and videos
  - Similar movies and reviews
- **Optimized Fetching**: Uses caching and debounced search to reduce unnecessary API calls.
- **User Analytics**: Tracks search queries to analyze popular searches (powered by Appwrite backend).

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Appwrite (for tracking search trends)
- **API**: The Movie Database (TMDb)
- **Deployment**: Vercel

## Installation
To run this project locally, follow these steps:

### Prerequisites
- Node.js and npm installed
- TMDb API Read Access Token

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/chalchitra.git
   cd chalchitra
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add your TMDb API Read Access Token:
   ```sh
   VITE_API_READ_ACCESS_TOKEN=your_api_token_here
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

## Deployment
To deploy on Vercel:
1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Set environment variables in Vercel.
4. Deploy and share the link.

## License
This project is licensed under the MIT License.

## Contributions
Contributions are always welcome!

