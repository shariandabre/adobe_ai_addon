// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import "./App.css";
import ChatInterface from "./ChatInterface";
import SEOManager from "./seo";

const App = ({ addOnUISdk, sandboxProxy }) => {
    const [activeComponent, setActiveComponent] = useState("welcome");
    const [showHelp, setShowHelp] = useState(false);

    function handleClick() {
        sandboxProxy.createRectangle({ width: 500, height: 500, x: 250, y: 250 });
    }

    const fc = { red: 0, green: 0.99, blue: 0, alpha: 1 };
    async function handleCreateStuff() {
        const rectDesc = await sandboxProxy.createRectangle({
            width: 200, height: 150, x: 50, y: 50
        });

        const r1 = await sandboxProxy.createRectangle({ width: 200, height: 150, x: 50, y: 50 });

        const r2 = await sandboxProxy.createRectangle({
            width: 100, height: 350, x: 100, y: 90
        });

        const r3 = await sandboxProxy.createRectangle({
            width: 200, height: 250, x: 200, y: 100
        });

        const nodes = await sandboxProxy.listNodes();
        console.log("Canvas nodes:", nodes);

        const gnode = await sandboxProxy.getNode(nodes[0].id);
        console.log("Nodes:", gnode);
    }

    const WelcomeScreen = () => (
        <div className="welcome-container">
            <div className="welcome-header">
                <div className="logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="url(#gradient1)"/>
                        <path d="M12 14L16 18L20 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="16" cy="10" r="2" fill="white"/>
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1"/>
                                <stop offset="100%" stopColor="#8b5cf6"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h1>Design Assistant</h1>
                <p>AI-powered tools for your creative workflow</p>
            </div>

            <div className="tools-list">
                <div className="tool-item" onClick={() => setActiveComponent("seo")}>
                    <div className="tool-icon seo-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="tool-content">
                        <h3>SEO Manager</h3>
                        <p>Optimize content for search engines</p>
                    </div>
                    <div className="tool-arrow">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                <div className="tool-item" onClick={() => setActiveComponent("chat")}>
                    <div className="tool-icon chat-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="tool-content">
                        <h3>Chat Interface</h3>
                        <p>AI assistant for creative guidance</p>
                    </div>
                    <div className="tool-arrow">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div className="welcome-footer">
                <p>Select a tool to get started</p>
            </div>
        </div>
    );

    const HelpModal = () => showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-header">
                    <h2>Design Assistant</h2>
                    <button className="close-btn" onClick={() => setShowHelp(false)}>×</button>
                </div>
                <div className="help-content">
                    <section>
                        <h3>🎨 What is Design Assistant?</h3>
                        <p>A powerful Adobe Express add-on that enhances your creative workflow with AI-powered tools for content optimization and creative guidance.</p>
                    </section>
                    
                    <section>
                        <h3>🛠 Available Tools</h3>
                        <div className="help-tool">
                            <strong>SEO Manager</strong>
                            <p>Optimize your designs for search engines with keyword analysis, content suggestions, and performance insights.</p>
                        </div>
                        <div className="help-tool">
                            <strong>Chat Interface</strong>
                            <p>Get instant creative guidance, brainstorm ideas, and receive AI-powered suggestions for your projects.</p>
                        </div>
                    </section>

                    <section>
                        <h3>🚀 Quick Start</h3>
                        <ol>
                            <li>Select a tool from the main screen</li>
                            <li>Follow the guided workflow</li>
                            <li>Apply suggestions to your project</li>
                            <li>Export your optimized content</li>
                        </ol>
                    </section>

                    <section>
                        <h3>💡 Pro Tips</h3>
                        <ul>
                            <li>Use SEO Manager before publishing</li>
                            <li>Ask Chat Interface for inspiration</li>
                            <li>Combine tools for best results</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="sidebar-app">
                {/* Header */}
                <header className="sidebar-header">
                    <div className="header-actions">
                        {(activeComponent === "seo" || activeComponent === "chat") && (
                            <button 
                                className="back-btn"
                                onClick={() => setActiveComponent("welcome")}
                                title="Back to tools"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M11 5L6 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        )}
                        
                        <div className="header-title">
                            {activeComponent === "welcome" && "Design Assistant"}
                            {activeComponent === "seo" && "SEO Manager"}
                            {activeComponent === "chat" && "Chat Interface"}
                        </div>
                        
                        <button 
                            className="help-btn"
                            onClick={() => setShowHelp(true)}
                            title="Help & Information"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M9 0C4.03 0 0 4.03 0 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 13H8v-2h2v2zm0-3H8V5h2v5z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="sidebar-main">
                    {activeComponent === "welcome" && <WelcomeScreen />}
                    {activeComponent === "seo" && <SEOManager addOnUISdk={addOnUISdk} />}
                    {activeComponent === "chat" && <ChatInterface sandboxProxy={sandboxProxy} />}
                </main>

                {/* Help Modal */}
                <HelpModal />
            </div>

            <style jsx>{`
                .sidebar-app {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100%;
                    max-width: 100%;
                    background: #ffffff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .sidebar-header {
                    background: #ffffff;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 12px 16px;
                    flex-shrink: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .back-btn, .help-btn {
                    background: none;
                    border: none;
                    padding: 6px;
                    border-radius: 6px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .back-btn:hover, .help-btn:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .header-title {
                    font-weight: 600;
                    color: #111827;
                    font-size: 16px;
                    text-align: center;
                    flex: 1;
                    margin: 0 8px;
                }

                .sidebar-main {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .welcome-container {
                    padding: 24px 16px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .welcome-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .logo {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 16px;
                }

                .welcome-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 8px 0;
                }

                .welcome-header p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.5;
                }

                .tools-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tool-item {
                    display: flex;
                    align-items: center;
                    padding: 16px;
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .tool-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    transform: scaleY(0);
                    transition: transform 0.2s ease;
                }

                .tool-item:hover::before {
                    transform: scaleY(1);
                }

                .tool-item:hover {
                    border-color: #d1d5db;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transform: translateY(-1px);
                }

                .tool-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    flex-shrink: 0;
                }

                .tool-icon.seo-icon {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .tool-icon.chat-icon {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }

                .tool-content {
                    flex: 1;
                    min-width: 0;
                }

                .tool-content h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 4px 0;
                }

                .tool-content p {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.4;
                }

                .tool-arrow {
                    color: #d1d5db;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                }

                .tool-item:hover .tool-arrow {
                    color: #6366f1;
                    transform: translateX(2px);
                }

                .welcome-footer {
                    text-align: center;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #f3f4f6;
                }

                .welcome-footer p {
                    font-size: 13px;
                    color: #9ca3af;
                    margin: 0;
                }

                .help-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .help-modal {
                    background: white;
                    border-radius: 12px;
                    max-width: 480px;
                    width: 100%;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
                }

                .help-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                }

                .help-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: white;
                    cursor: pointer;
                    padding: 4px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .help-content {
                    padding: 20px;
                    overflow-y: auto;
                    max-height: calc(80vh - 80px);
                }

                .help-content section {
                    margin-bottom: 20px;
                }

                .help-content section:last-child {
                    margin-bottom: 0;
                }

                .help-content h3 {
                    margin: 0 0 12px 0;
                    color: #111827;
                    font-weight: 600;
                    font-size: 16px;
                }

                .help-content p {
                    color: #6b7280;
                    line-height: 1.6;
                    margin: 0 0 12px 0;
                    font-size: 14px;
                }

                .help-tool {
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                    border-left: 3px solid #6366f1;
                }

                .help-tool strong {
                    display: block;
                    color: #111827;
                    margin-bottom: 4px;
                    font-weight: 600;
                }

                .help-tool p {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .help-content ol, .help-content ul {
                    color: #6b7280;
                    line-height: 1.6;
                    margin: 0;
                    padding-left: 16px;
                    font-size: 14px;
                }

                .help-content li {
                    margin-bottom: 6px;
                }

                @media (max-width: 320px) {
                    .welcome-container {
                        padding: 16px 12px;
                    }
                    
                    .tool-item {
                        padding: 12px;
                    }
                    
                    .tool-content h3 {
                        font-size: 15px;
                    }
                    
                    .tool-content p {
                        font-size: 12px;
                    }
                }
            `}</style>
        </Theme>
    );
};

export default App;