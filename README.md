# Image Manipulator

### A Full-Stack Image Compression and Optimization Platform

Image Manipulator is a web-based image optimization application that allows users to compress, convert, resize, rotate and manage images through a simple and responsive interface.

The application supports multiple image formats and provides configurable compression quality, batch processing and ZIP downloads. It uses a React-based frontend, a Node.js and Express backend, Sharp for image processing and Cloudinary for cloud storage.

<p align="center">

  **Live Application:**  
  https://imagemanipulator-two.vercel.app

  **Backend API:**  
  https://imagemanipulator-backend.onrender.com

</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security and Data Handling](#security-and-data-handling)
- [Future Enhancements](#future-enhancements)
- [Author](#author)

---

## Overview

Images are widely used across websites, applications, social media and digital platforms. However, large image files can increase website loading times, consume storage and use more bandwidth.

Image Manipulator addresses this problem by providing a centralized platform for image optimization.

Users can upload images, configure processing settings and download optimized results without installing additional desktop software.

The application consists of a frontend interface, a backend processing API and cloud storage integration.

## Features

### 1. Image Compression

- Upload individual images.
- Support JPEG, PNG, WebP and AVIF formats.
- Adjust compression quality using a quality slider.
- Configure output image width and height.
- Rotate images by 90°, 180° or 270°.
- Download the processed image.
- View original and compressed file sizes.
- Calculate the percentage of storage saved.

### 2. Batch Image Processing

- Upload multiple images simultaneously.
- Process images individually through the backend API.
- Track processing status.
- Collect successfully processed images.
- Download multiple results together as a ZIP archive.

### 3. Image Format Converter

Convert images between supported formats:

- JPEG
- PNG
- WebP
- AVIF

Additional functionality includes quality adjustment, image preview, file size comparison and downloading the converted result.

### 4. Resize and Crop

- Configure custom image dimensions.
- Maintain aspect ratio where supported.
- Rotate images.
- Select available crop or fit options.
- Preview and download processed images.

### 5. Compression History

- Maintain a record of image-processing activities.
- View original and compressed file sizes.
- Display output formats and compression savings.
- Search records by filename.
- Delete individual records or clear history.

History metadata is currently stored in browser localStorage.

### 6. Cloud Storage Integration

Cloudinary is integrated to store processed image assets.

The backend uploads processed images to Cloudinary and retrieves asset information such as the image URL and public ID.

---

## Screenshots

Add screenshots of your actual application in the `screenshots` folder.

Suggested screenshots:

| Screenshot | Description |
|---|---|
| Dashboard | Main application dashboard |
| Compressor | Image compression interface |
| Batch Compressor | Multiple image processing |
| Format Converter | Image format conversion |
| Resize & Crop | Image editing controls |
| History | Saved processing records |

Example Markdown for displaying screenshots:

```markdown
## Application Preview

![Dashboard](screenshots/dashboard.png)

![Image Compressor](screenshots/compressor.png)

![Batch Compressor](screenshots/batch-compressor.png)
```

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| Tailwind CSS | Responsive styling |
| Axios | HTTP communication |
| Lucide React | Interface icons |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Sharp | Image processing and compression |
| Multer | Image upload handling |
| Cloudinary | Cloud image storage |
| JSZip | ZIP archive generation |
| Git | Version control |
| GitHub | Source code repository |
| Vercel | Frontend deployment |
| Render | Backend deployment |

---

## System Architecture

The application follows a client-server architecture.

```text
                  USER
                    |
                    v
             REACT FRONTEND
                 (Vercel)
                    |
                    | Axios HTTP Request
                    |
                    v
             EXPRESS BACKEND
                 (Render)
                    |
                    v
              MULTER UPLOAD
                    |
                    v
             SHARP PROCESSING
                    |
                    v
               CLOUDINARY
              CLOUD STORAGE
                    |
                    v
             PROCESSED IMAGE
                    |
                    v
             FRONTEND DOWNLOAD
```

### Frontend

The React frontend provides the user interface, manages application state, collects image-processing settings and communicates with the backend using Axios.

### Backend

The Express backend receives uploaded files, validates input and processes images using Sharp.

### Image Processing

Sharp performs image transformations such as resizing, rotation and encoding into supported output formats.

### Cloud Storage

Cloudinary stores processed image assets and provides their corresponding URLs and public IDs.

---

## Project Structure

```text
imagemanipulator/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   │
│   │   ├── controllers/
│   │   │
│   │   ├── middleware/
│   │   │
│   │   ├── routes/
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## How It Works

### Image Compression Workflow

**Step 1: Image Upload**

The user selects an image through the frontend interface.

**Step 2: Configuration**

The user chooses the output format, compression quality, dimensions and rotation settings.

**Step 3: API Request**

The frontend creates a FormData object containing the image and processing parameters and sends it to the Express backend.

**Step 4: File Validation**

Multer receives the uploaded image. The backend validates the file type, file size and processing parameters.

**Step 5: Image Processing**

Sharp processes the uploaded image buffer and generates the requested output format.

**Step 6: Cloud Upload**

The processed image is uploaded to Cloudinary.

**Step 7: Response and Download**

The backend returns the processed image as binary data along with relevant response headers. The frontend enables the user to download the result.

---

## API Documentation

### Base URL

```text
https://imagemanipulator-backend.onrender.com
```

### 1. Root Endpoint

**GET /**

Checks whether the backend service is running.

Example response:

```json
{
  "success": true,
  "message": "Image Compression API is running!"
}
```

### 2. Health Check

**GET /api/health**

Checks the backend health status.

Example response:

```json
{
  "success": true,
  "status": "healthy",
  "service": "Image Compression API"
}
```

### 3. Image Compression

**POST /api/images/compress**

Accepts an image and its processing parameters using `multipart/form-data`.

| Parameter | Type | Description |
|---|---|---|
| image | File | Image to process |
| format | String | jpeg, png, webp or avif |
| quality | Number | Compression quality from 1 to 100 |
| width | Number | Optional output width |
| height | Number | Optional output height |
| rotation | Number | 0, 90, 180 or 270 |

**Example request using JavaScript:**

```javascript
const formData = new FormData();

formData.append("image", selectedFile);
formData.append("format", "webp");
formData.append("quality", "80");
formData.append("width", "1200");
formData.append("height", "800");
formData.append("rotation", "0");

const response = await axios.post(
  `${API_URL}/api/images/compress`,
  formData,
  {
    responseType: "blob"
  }
);
```

The API returns the processed image as binary data.

Relevant response headers include:

- `X-Original-Size`
- `X-Compressed-Size`
- `X-Savings-Percentage`
- `X-Cloudinary-URL`
- `X-Cloudinary-Public-ID`

---

## Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- Cloudinary account

### Step 1: Clone the Repository

```bash
git clone https://github.com/somrajdeb/imagemanipulator.git
```

Navigate to the project directory:

```bash
cd imagemanipulator
```

### Step 2: Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend directory.

Add the following configuration:

```env
PORT=5000

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the Cloudinary placeholders with your own credentials.

Start the backend development server:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

### Step 3: Configure the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

Open the URL provided by Vite, normally:

```text
http://localhost:5173
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description |
|---|---|
| PORT | Port used by the Express server |
| FRONTEND_URL | Allowed frontend origin for CORS |
| CLOUDINARY_CLOUD_NAME | Cloudinary account cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

### Frontend Environment Variables

| Variable | Description |
|---|---|
| VITE_API_URL | Backend API base URL |

**Important:** Never upload `.env` files, API secrets or private credentials to GitHub.

---

## Deployment

The application is deployed using separate frontend and backend hosting services.

### Frontend Deployment — Vercel

- Repository: GitHub
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Production environment variable:

```env
VITE_API_URL=https://imagemanipulator-backend.onrender.com
```

Live URL:

https://imagemanipulator-two.vercel.app

### Backend Deployment — Render

- Repository: GitHub
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Configure the following environment variables in Render:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://imagemanipulator-two.vercel.app
```

Backend URL:

https://imagemanipulator-backend.onrender.com

### Deployment Workflow

```text
Local Development
       |
       v
     Git
       |
       v
    GitHub
       |
       +-------------------+
       |                   |
       v                   v
    Vercel               Render
   Frontend              Backend
       |                   |
       +---------+---------+
                 |
                 v
          Live Application
```

---

## Security and Data Handling

- Uploaded files are processed through the backend.
- Multer uses memory storage for incoming image uploads.
- File size and supported formats are validated.
- Cloudinary credentials are stored in environment variables.
- CORS is configured to allow the deployed frontend origin.
- Browser history is currently maintained using localStorage.
- Cloudinary URLs may be publicly accessible depending on asset delivery settings; they should not be treated as private access controls.

**Note:** The current project uses browser-based history rather than a centralized database with user accounts.

---

## Future Enhancements

The following improvements can be considered in future versions:

- User registration and authentication.
- Database-backed processing history.
- Individual user storage and usage quotas.
- Advanced analytics dashboard.
- Email notifications and download links.
- Private image delivery using signed URLs.
- Real-time processing progress.
- Automated testing using Jest.
- Continuous integration and deployment using GitHub Actions.

These are planned enhancements, not claims about currently implemented functionality.

---

## Author

**Somraj Deb**

Computer Science and Engineering

### Project Links

- **Live Website:** https://imagemanipulator-two.vercel.app
- **GitHub Repository:** https://github.com/somrajdeb/imagemanipulator
- **Backend API:** https://imagemanipulator-backend.onrender.com

---

<p align="center">

  **IMAGE MANIPULATOR**

  *Simplifying Image Compression and Optimization.*

</p>
