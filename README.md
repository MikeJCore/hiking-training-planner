# Hiking Training Planner

A web application that generates personalized hiking training plans using AI. The frontend is built with React and Vite, and the backend is a Node.js/Express server that interfaces with the OpenAI API.

## 🚀 Deployment Architecture

- **Frontend**: Hosted on Netlify
- **Backend API**: Deployed on Render
- **Database**: None (stateless API)
- **AI**: OpenAI API

## 🛠 Local Development

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hiking-training-planner.git
   cd hiking-training-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running Locally

1. Start the backend server:
   ```bash
   npm run server
   ```
   The backend will be available at `http://localhost:5001`

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## 🌐 Deployment

### Backend (Render)

1. Push your code to a GitHub repository
2. Sign in to [Render](https://render.com/)
3. Click "New" > "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `hiking-training-planner-api`
   - **Region**: Choose the one closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click "Advanced" and add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `OPENAI_API_KEY`: Your OpenAI API key
7. Click "Create Web Service"

### Frontend (Netlify)

1. Push your code to a GitHub repository
2. Sign in to [Netlify](https://app.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub repository
5. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Show advanced" and add the following environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://hiking-training-planner-api.onrender.com`)
   - `VITE_APP_NAME`: `Hiking Training Planner`
7. Click "Deploy site"

## 🔄 Continuous Deployment

- The repository is set up with GitHub Actions for CI/CD
- Pushing to `main` will trigger automatic deployments to both Render and Netlify
- Environment variables are managed through the respective platform dashboards

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Your Name]
