# Music Player with Dropbox Integration

A modern music player application that integrates with Dropbox for cloud storage access.

## Features

- 🎵 Play music from your Dropbox account
- 📱 Responsive design for all devices
- 🎨 Modern UI with dark mode support
- 🔄 Real-time playback controls
- 📁 File browser with folder navigation
- 🔐 Secure Dropbox authentication

## Prerequisites

- Node.js 18.0 or later
- npm or yarn
- A Dropbox account
- A Dropbox App (created through the Dropbox Developer Console)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd music-player
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your Dropbox app key:
   ```
   NEXT_PUBLIC_DROPBOX_APP_KEY=your_dropbox_app_key_here
   ```

4. Configure your Dropbox App:
   - Go to the [Dropbox Developer Console](https://www.dropbox.com/developers/apps)
   - Create a new app with the following settings:
     - Choose "Scoped access"
     - Select "App folder" access
     - Enable the following permissions:
       - `files.content.read`
     - Set the redirect URI to: `http://localhost:3000`
     - Enable "No expiration" for access tokens

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding Music to Dropbox

For the application to display and play your music, you need to:

1. Create a folder named `music` in your Dropbox app folder:
   - After setting up your Dropbox app, a dedicated folder will be created in your Dropbox account named after your app
   - Inside this app folder, create a new folder called `music`

2. Add your music files to this folder:
   - Supported formats: MP3, FLAC, WAV
   - For best results, name your files as `Artist - Title.mp3` (the application will extract artist and title information from the filename)
   - You can organize your music into subfolders if needed

3. After adding music, refresh the application:
   - The music player will scan your `/music` folder and display all compatible audio files
   - If you add new music files while the application is running, you'll need to refresh the page to see them

Note: If no music is found, you'll see a message prompting you to add music to your Dropbox music folder.

## Project Structure

```
music-player/
├── app/
│   ├── layout.tsx           # Root layout with authentication
│   ├── metadata.ts          # Next.js metadata configuration
│   ├── page.tsx            # Home page
│   ├── login/
│   │   └── page.tsx        # Login page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx     # Responsive sidebar
│   └── player/
│       └── PlayerControls.tsx # Music player controls
├── lib/
│   ├── context/
│   │   └── PlayerContext.tsx # Audio player context
│   ├── services/
│   │   └── dropboxService.ts # Dropbox API integration
│   └── types.ts            # TypeScript interfaces
└── public/                 # Static assets
```

## Authentication Flow

1. User visits the application
2. If not authenticated, redirected to login page
3. User authorizes with Dropbox
4. Access token is stored securely
5. User can access their music files

## Player Features

- Play/Pause control
- Next/Previous track navigation
- Volume control
- Progress bar with seek functionality
- Playlist management
- Current track information display

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment on Netlify

Follow these steps to deploy the application on Netlify:

1. Fork or clone this repository to your GitHub account
2. Log in to [Netlify](https://www.netlify.com/)
3. Click on "New site from Git"
4. Select GitHub as your provider
5. Choose the repository you created
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
7. Add environment variables:
   - Add `NEXT_PUBLIC_DROPBOX_APP_KEY` with your Dropbox app key
8. Click "Deploy site"

### Additional Netlify Configuration

The repository includes a `netlify.toml` file with the necessary configuration for Next.js deployment. Make sure your Dropbox app is configured to allow your Netlify domain in the redirect URIs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 