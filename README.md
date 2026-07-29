# 🍽️ Swift Food

<div align="center">

![Swift Food](https://img.shields.io/badge/Status-Under%20Development-yellow?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)
[![Stars](https://img.shields.io/github/stars/mrrSwift/Swift-Food?style=for-the-badge)](https://github.com/mrrSwift/Swift-Food/stargazers)

**Digital Menu for Cafes and Restaurants**

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

> [!WARNING]  
> **Under Active Development**  
> This app is still under development and needs a lot of improvement and refactoring. Expect breaking changes and incomplete features. We welcome contributions!

---

## 🤔 Why Swift Food?

- **🌍 Open Source**: Completely free and open-source. No hidden costs, no premium features.
- **🔄 Actively Maintained**: Everything is being updated and developed continuously.
- **⚡ Fast & Simple**: Built with cutting-edge technology for maximum performance.
- **🎨 Modern Stack**: Uses the latest web technologies for the best developer experience.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Features
- **📱 Digital Menu Display**: Beautiful, responsive menu for cafes and restaurants
- **👥 Multi-Vendor Support**: Multiple restaurant owners can manage their menus
- **🏪 Restaurant Management**: Complete CRUD for restaurant profiles
- **📋 Category Management**: Organize menu items with customizable categories
- **🍕 Menu Item Management**: Add, edit, and manage food items with images

</td>
<td width="50%">

### 🔧 Technical Features
- **🔐 JWT Authentication**: Secure login for restaurant owners and admins
- **🛡️ Role-Based Access**: Admin, Restaurant Owner, and Customer roles
- **📸 Image Upload**: Upload and manage images for menus and items
- **🎨 Custom Branding**: Each restaurant can have custom colors and themes
- **📱 Mobile-First Design**: iOS-style glassmorphism UI with responsive layout

</td>
</tr>
</table>

### :hammer_and_wrench: Refactor
- [ ] Layout
- [x] Component
- [x] Filter
- [x] Edit modal
- [ ] Back-end error messages
- [ ] Routing
- [ ] Type share

### 🚀 Coming Soon
- [x] Note order 
- [x] Order management system
- [x] QR code generation for tables
- [ ] Online payment system
- [x] Real-time order notifications
- [x] Analytics dashboard
- [ ] Multi-language support
- [x] Dark mode
- [x] PWA support
- [x] Dockerize
- [ ] Admin Dashboard
- [ ] Customer reviews and ratings

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

### Tools
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=zustand&logoColor=white)

</div>

---

## 📁 Project Structure
```html
Swift-Food/
├── 🖥️ client/ # Frontend React Application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ │ ├── layout/ # Header, Footer, Sidebar
│ │ │ ├── menu/ # Menu items, categories
│ │ │ ├── notebook/ # Cart/notebook functionality
│ │ │ ├── owner/ # Restaurant owner panel
│ │ │ └── ui/ # Base UI components (buttons, inputs)
│ │ ├── pages/ # Route pages
│ │ │ ├── owner/ # Owner dashboard pages
│ │ │ └── ... # Customer-facing pages
│ │ ├── services/ # API service layer
│ │ ├── store/ # Zustand state management
│ │ ├── types/ # TypeScript type definitions
│ │ └── lib/ # Utility functions
│ ├── public/ # Static assets
│ ├── vite.config.ts # Vite configuration
│ └── package.json
│
└── ⚙️ server/ # Backend Hono Application
│ ├── src/
│ │ ├── config/ # Database configuration
│ │ ├── controllers/ # Request handlers
│ │ ├── middleware/ # Auth, error handling, validation
│ │ ├── models/ # MongoDB schemas
│ │ ├── routes/ # API route definitions
│ │ ├── validators/ # Zod validation schemas
│ │ └── index.ts # Server entry point
│ ├── uploads/ # Uploaded images
│ └── package.json
│
├── 📄 turbo.json # Turborepo configuration
├── 📄 package.json # Root package.json
└── 📄 README.md # You are here!
```


---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** (v1.0.0 or higher)
- **[MongoDB](https://www.mongodb.com/)** (v6.0 or higher)
- **[Git](https://git-scm.com/)**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mrrSwift/Swift-Food.git
   cd Swift-Food

   bun install

   cd server
   bun install

   cd client
   bun install

   # or use docker

   docker compose up -d
   
   ```

Set up environment variables

Create .env file in apps/server/:

```env
MONGODB_URI=mongodb://localhost:27017/swift_food
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Create .env file in apps/client/:

```env
VITE_API_URL=http://localhost:3000
```

Run in Dev

```bash
# Run with turbo
bun dev 

# or run Separately
bun dev:client
bun dev:server

# or run standalone
# in two console run Separately
cd server
bun dev

cd client
bun dev

```

### 1- Areas We Need Help With
```diff
+ UI/UX Improvements
+ Bug fixes
+ Documentation
+ Test coverage
+ Performance optimization
- Currently not accepting major architectural changes
```
### 📝 Development Notes
Current State

🟡 Alpha Stage: Core features working, but needs refinement

🟡 API: Stable but may have breaking changes

🟡 UI: Functional but needs polish

🔴 Testing: Not yet implemented

### Known Issues
Image upload needs better error handling

Mobile responsiveness needs improvement in owner panel

No loading skeletons for data fetching

Missing form validation feedback

No offline support

### 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

### 🌟 Acknowledgments
Bun - Incredibly fast JavaScript runtime

Hono - Lightweight web framework

Vite - Next generation frontend tooling

Tailwind CSS - Utility-first CSS framework

Radix UI - Unstyled, accessible components

MongoDB - Flexible document database


### 📞 Contact & Support
Issues: GitHub Issues

Discussions: GitHub Discussions

Email: amirshayan1381@yahoo.com

<div align="center">
⭐ Star us on GitHub — it motivates us a lot!
⬆ Back to Top

Made with ❤️ by MrrSwift


   
