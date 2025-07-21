// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react"; // Import useState
import "./App.css";
import ChatInterface from "./ChatInterface";
import SEOManager from "./seo";

const App = ({ addOnUISdk, sandboxProxy }) => {
    // State to manage which component is active
    const [activeComponent, setActiveComponent] = useState(null); // Initialize with null or a default

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

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="express" scale="medium" color="light">
            <div className="flex flex-col h-screen w-full p-4"> {/* Changed to flex-col for buttons at top */}
                <div className="flex justify-center space-x-4 mb-4">
                    <Button
                        onClick={() => setActiveComponent("seo")}
                        className={`spectrum-Button spectrum-Button--cta ${activeComponent === "seo" ? "is-selected" : ""}`}
                    >
                        SEO Manager
                    </Button>
                    <Button
                        onClick={() => setActiveComponent("chat")}
                        className={`spectrum-Button spectrum-Button--cta ${activeComponent === "chat" ? "is-selected" : ""}`}
                    >
                        Chat Interface
                    </Button>
                    {/* Optionally, you can keep your test buttons if needed */}
                    {/* <Button onClick={handleClick} className={"spectrum-Button spectrum-Button--cta"}>
                        Create Rectangle
                    </Button>
                    <Button onClick={handleCreateStuff} className={"spectrum-Button spectrum-Button--cta"}>
                        Test
                    </Button> */}
                </div>

                <div className="flex-grow"> {/* This div will hold the active component */}
                    {activeComponent === "seo" && <SEOManager addOnUISdk={addOnUISdk} />}
                    {activeComponent === "chat" && <ChatInterface sandboxProxy={sandboxProxy} />}
                    {!activeComponent && (
                        <div className="text-center text-gray-600 mt-8">
                            Please select a component to view.
                        </div>
                    )}
                </div>
            </div>
        </Theme>
    );
};

export default App;

