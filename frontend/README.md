# SocialHub Frontend

A modern React-based frontend for SocialHub - a Threads clone social media application.

## 🎯 Features

- **Home Page**: Landing page with application information and call-to-action buttons
- **Login Page**: User authentication form with email and password
- **Register Page**: User registration form with validation
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean, professional design with gradient backgrounds
- **Form Validation**: Client-side validation for all forms

## 📂 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Login.js
│   │   └── Register.js
│   ├── styles/
│   │   ├── Home.css
│   │   └── Auth.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📄 Pages

### Home Page (/)
- Displays SocialHub branding and logo
- Lists key features with icons
- Navigation buttons to Login and Register pages
- Responsive hero section

### Login Page (/login)
- Email and password input fields
- Form validation
- Link to registration page
- Forgot password link (placeholder)
- Sidebar with benefits information

### Register Page (/register)
- Username, email, password, and confirm password fields
- Form validation
- Terms and privacy policy agreement checkbox
- Link to login page
- Sidebar with registration benefits

## 🎨 Design Features

- **Color Scheme**: Purple gradient (#667eea to #764ba2)
- **Logo**: SocialHub logo displayed as SVG (customizable)
- **Responsive**: Mobile-first design that adapts to all screen sizes
- **Animations**: Smooth transitions and hover effects
- **Form Validation**: Client-side validation with error messages

## 🔧 Customization

### Logo
Replace the SVG logo data URLs in the components with your own logo image. Look for:
- `Home.js` - Logo in navbar and hero section
- `Login.js` and `Register.js` - Logo in auth navbar

### Colors
The color scheme is defined in CSS files:
- Primary color: `#667eea`
- Secondary color: `#764ba2`

To change colors, update the CSS files in the `styles/` directory.

### Backend Integration
When the backend is ready, uncomment the fetch API calls in `Login.js` and `Register.js`:

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🔐 Security Notes

- Never store sensitive data in localStorage without encryption
- Implement HTTPS for production
- Use httpOnly cookies for JWT tokens
- Validate all input on the backend as well

## 🚢 Deployment

Build for production:
```bash
npm run build
```

This creates a `build/` directory with optimized production files.

## 📞 Support

For issues or questions, please refer to the backend team or create an issue in the repository.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.
