Image Compression Tool
A full-stack web application for compressing, converting, resizing and
managing images through a browser-based interface.

Live application: https://imagemanipulator-two.vercel.app\
Backend API: https://imagemanipulator-backend.onrender.com
Features
- Image compression: Compress JPEG, PNG, WebP and AVIF images.
- Quality control: Adjust output quality before processing.
- Dimension control: Specify output width and height.
- Rotation: Rotate images by 90°, 180° or 270°.
- Batch processing: Process multiple images and download the
  results as a ZIP archive.
- Format conversion: Convert between supported image formats.
- Resize and crop interface: Configure image dimensions and
  available fit/crop options.
- Compression history: View saved compression records, file sizes,
  savings and dates.
- Cloud storage: Upload processed image assets to Cloudinary.
Technology Stack
  Area               Technologies
  Frontend           React, Vite, Tailwind CSS
HTTP requests      Axios
Icons              Lucide React
Backend            Node.js, Express
Image processing   Sharp
File uploads       Multer
Cloud storage      Cloudinary
ZIP generation     JSZip
Frontend hosting   Vercel
Backend hosting    Render
Version control    Git and GitHub
Architecture
User's Browser
     |
     v
React + Vite Frontend (Vercel)
     |
     | POST /api/images/compress
     | multipart/form-data
     v
Express Backend (Render)
     |
     v
Multer receives uploaded image
     |
     v
Sharp processes the image
     |
     +------> Cloudinary stores processed asset
     |
     v
Processed image response returned to browser
     |
     v
Download / browser history
Repository Structure
imagemanipulator/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
Run Locally
Requirements
- Node.js and npm
- A Cloudinary account for cloud asset uploads
1. Clone the repository
git clone https://github.com/somrajdeb/imagemanipulator.git
cd imagemanipulator
2. Install and configure the backend
cd backend
npm install
Create backend/.env with the following variables:
PORT=5000
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Do not commit .env or expose Cloudinary credentials.

Start the backend:
npm run dev
The API will run at http://localhost:5000.
3. Install and configure the frontend
Open a second terminal:
cd frontend
npm install
Create frontend/.env:
VITE_API_URL=http://localhost:5000
Start the frontend:
npm run dev
Open the local Vite URL shown in the terminal, usually
http://localhost:5173.
API
Health check
GET /
Returns a simple API status response.
GET /api/health
Returns the backend health status.
Compress image
POST /api/images/compress
Content-Type: multipart/form-data
Form fields:

  Field        Description
  image      Image file to process
format     jpeg, png, webp or avif
quality    Output quality from 1 to 100
width      Optional target width
height     Optional target height
rotation   0, 90, 180 or 270

The endpoint returns the processed image as binary data. Response
headers include original size, compressed size, savings percentage and
Cloudinary asset information when the upload succeeds.
Deployment
Frontend --- Vercel
The frontend is deployed from the frontend directory.

Set this Vercel environment variable:
VITE_API_URL=https://imagemanipulator-backend.onrender.com
Redeploy the frontend after changing build-time environment variables.
Backend --- Render
The backend is deployed from the backend directory.

  Setting          Value
  Root Directory   backend
Build Command    npm install
Start Command    npm start

Configure these Render environment variables:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://imagemanipulator-two.vercel.app
Do not include a trailing slash in FRONTEND_URL when using the current
exact-origin CORS configuration.
Data and Security Notes
- The current compression history is stored in browser localStorage;
  it is not a centralized database and is specific to the browser.
- Cloudinary asset URLs may be publicly accessible depending on the
  Cloudinary delivery configuration. Do not treat a public URL as
  private access control.
- Keep .env files and API secrets out of GitHub.
- The Render free instance may sleep after inactivity, so the first
  request after a period of inactivity can take longer.
Future Enhancements
Potential extensions include user authentication, database-backed
history, usage quotas, analytics, email notifications, signed/private
asset delivery, automated tests and CI/CD.

These are future enhancements and should not be considered implemented
unless they are added to the codebase.
Author
Somraj Deb
Links
- Live application: https://imagemanipulator-two.vercel.app
- Backend API: https://imagemanipulator-backend.onrender.com
- GitHub repository: https://github.com/somrajdeb/imagemanipulator
