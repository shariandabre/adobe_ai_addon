# 🎨 Design Assistant – Adobe Express Add-on

**Design Assistant** is a powerful AI-driven Adobe Express add-on that helps small business owners, content creators, and solopreneurs generate scroll-stopping, fully branded social media content in seconds – without switching tools or hiring a designer.

Built with 💡 intelligence and ease-of-use in mind, Design Assistant combines content generation (via ChatGPT), SEO optimization, and automated design layout – all within the Adobe Express editor.

---

## 🚀 What Can It Do?

Just describe your idea – like:

> “Instagram post for launch sale on monsoon jackets”  
> “Marketing content for eco-friendly shampoo brand”

**Design Assistant** instantly creates:
- A branded design using your color palette, fonts, and tone
- Catchy AI-generated captions
- Relevant hashtags
- Tone-matched layout variations
- SEO-friendly copy suggestions
- Editable templates right on the canvas

Say goodbye to tool-switching and creative blocks. Say hello to frictionless, AI-powered content creation.

---

## ✨ Features

| Feature          | Description |
|------------------|-------------|
| 🧠 **Chat Interface** | Ask the assistant for design ideas, captions, campaign directions, branding tips, etc. Powered by GPT. |
| 📈 **SEO Manager**    | Optimize content for visibility with keyword recommendations, caption rewrites, and content insights. |
| 🎨 **Auto Layouts**   | Design Assistant creates branded layouts instantly — applying suggested fonts, graphics, and colors to match your style. |
| 🛠️ **Inline Toolkit** | Use both tools inline while designing directly in Adobe Express |
| ⚡ **Quick Start UX** | Intuitive onboarding via help modal and guided interface |

---

## 📂 Project Structure

```

design-assistant/
├── public/               \# Static files and HTML template
├── src/
│   ├── components/
│   │   ├── HelpModal.jsx   \# Help/onboarding modal UI
│   │   └── ChatUI.jsx      \# GPT-powered chat interface
│   ├── App.jsx             \# Main app component
│   └── index.js            \# Entry point for the app
├── styles/              \# App styles (CSS)
├── dist/                \# Production build output
├── package.json         \# NPM scripts and dependencies
└── README.md            \# You're here 🎉

```

---

## 🛠️ Installation Instructions

### 📦 Prerequisites

- Node.js (v14+)
- NPM

### ⚙️ Setup

Clone the repository and install dependencies:

```

git clone https://github.com/shariandabre/adobe_ai_addon.git
cd adobe_ai_addon
npm install

```

### 🔁 Start Development Server

```

npm run start

```

This runs the project in development mode with live-reloading.

### 📦 Build for Production

```

npm run build

```

Outputs to the `/dist` directory.

---

## 💡 Help & Onboarding

Your add-on includes a built-in help guide via the `<HelpModal />` component. It contains:

- Overview of the tools
- Steps to get started
- Pro-tips for best results
- Tool-specific guidance

Activate it from the top right “Help ❓” button in the UI.

---

## 🧪 How It Works

1. 🔍 You enter a product, theme, or marketing idea
2. 🧠 GPT creates marketing captions, hashtags, and tone suggestions
3. 🎨 Design Assistant injects this data into the Adobe Express canvas using templates
4. 🛠 You can edit fonts, layouts, images, and color palettes – or pick from variations
5. 📢 Use the SEO Manager before exporting to optimize for visibility

All of this happens **within Adobe Express**, in real time.

---

## 📌 Use Cases

- Social posts for launches, promos, stories  
- Personal brand building  
- SMB digital marketing  
- Instagram Reels, Ads, and Stories  
- On-brand seasonal campaigns

Perfect for creators with no design team 👩‍💻

---

## 🤝 Contributing

We welcome issues, feedback, and pull requests!

To contribute:
1. Fork the repo
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit and push: `git commit -m 'New feature' && git push origin feature/my-feature`
4. Open a Pull Request

For design changes or UX ideas, open an Issue for discussion.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🧠 Credits

Created using [@adobe/create-ccweb-add-on](https://github.com/AdobeDocs/uxp-ccweb-add-on), React, and GPT AI integration.

_Designed with power users and creators in mind._ ✨

---

> 💬 “Design Assistant helps content creators go from idea ➞ brand-ready content in seconds. No friction, no blockers. Just magic.”
```
