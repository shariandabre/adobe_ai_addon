import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor, colorUtils, constants } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;
const posterTemplates = {
    event: {
        layout: "header_image_details_footer",
        colors: {
            primary: { red: 0.2, green: 0.4, blue: 0.8, alpha: 1 },
            secondary: { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 },
            accent: { red: 1, green: 0.6, blue: 0, alpha: 1 }
        }
    },
    sale: {
        layout: "bold_center_burst",
        colors: {
            primary: { red: 0.8, green: 0.1, blue: 0.1, alpha: 1 },
            secondary: { red: 1, green: 1, blue: 1, alpha: 1 },
            accent: { red: 1, green: 0.9, blue: 0, alpha: 1 }
        }
    },
    minimal: {
        layout: "clean_typography",
        colors: {
            primary: { red: 0.1, green: 0.1, blue: 0.1, alpha: 1 },
            secondary: { red: 0.95, green: 0.95, blue: 0.95, alpha: 1 },
            accent: { red: 0.6, green: 0.6, blue: 0.6, alpha: 1 }
        }
    }
};
// Breadth-first search to find a node by its _addonId
function findNode(id, root = editor.context.insertionParent) {
    const queue = [root];
    while (queue.length) {
        const n = queue.shift();
        if (n?.id === id) return n;
        if (n?.children) queue.push(...n.children.toArray());
    }
    return null;
}

function serialize(node, object_type = "", deep = false) {
    const base = {
        id: node.id,
        type: node.constructor.name,
        x: node.translation?.x ?? 0,
        y: node.translation?.y ?? 0,
        width: node.width ?? node.rx * 2 ?? undefined,
        height: node.height ?? node.ry * 2 ?? undefined,
        rotation: node.rotation ?? 0,
        opacity: node.opacity ?? 1,
        locked: node.locked ?? false,
        object_type,
    };
    if (deep && node.children) {
        base.children = node.children.toArray().map(c => serialize(c, object_type, true));
    }
    return base;
}


// =================================================================================================================
// ASYNC: All Asynchronous functions we created below
//==================================================================================================================

async function createImageNode({ blob, x = 0, y = 0, width = 300 } = {}) {
    // Load the bitmap from the Blob
    const bitmap = await editor.loadBitmapImage(blob);

    // enclose DOM-mutations in queueAsyncEdit so undo/redo works
    let container;
    await editor.queueAsyncEdit(() => {
        container = editor.createImageContainer(bitmap, { width });
        container.translation = { x, y };
        editor.context.insertionParent.children.append(container);
    });

    // return serialized descriptor
    return serialize(container);
}

const _mkFill = c => editor.makeColorFill(c);

function start() {
    const sandboxApi = {

        createPoster: ({
            width = 1080,
            height = 1440,
            template = "event",
            title = "Your Event Title",
            subtitle = "Subtitle or Date",
            description = "Event description goes here",
            callToAction = "Learn More",
            backgroundType = "solid", // "solid", "gradient", "pattern"
            imageUrl = null
        } = {}) => {
            const posterData = posterTemplates[template] || posterTemplates.event;
            const elements = [];

            // Background
            const background = sandboxApi.createRectangle({
                width,
                height,
                fill: posterData.colors.secondary,
                x: 0,
                y: 0
            });
            elements.push(background);

            if (backgroundType === "gradient") {
                // Create gradient effect with overlapping rectangles
                const gradientOverlay = sandboxApi.createRectangle({
                    width,
                    height: height * 0.6,
                    fill: { ...posterData.colors.primary, alpha: 0.1 },
                    x: 0,
                    y: 0
                });
                elements.push(gradientOverlay);
            }

            // Layout-specific arrangements
            if (posterData.layout === "header_image_details_footer") {
                // Header section
                const headerBg = sandboxApi.createRectangle({
                    width,
                    height: height * 0.15,
                    fill: posterData.colors.primary,
                    x: 0,
                    y: 0
                });
                elements.push(headerBg);

                // Title
                const titleText = sandboxApi.createText({
                    text: title.toUpperCase(),
                    fontSize: Math.min(width * 0.08, 72),
                    color: posterData.colors.secondary,
                    align: constants.TextAlignment.center,
                    x: width * 0.1,
                    y: height * 0.05
                });
                elements.push(titleText);

                // Subtitle
                const subtitleText = sandboxApi.createText({
                    text: subtitle,
                    fontSize: Math.min(width * 0.04, 32),
                    color: posterData.colors.primary,
                    align: constants.TextAlignment.center,
                    x: width * 0.1,
                    y: height * 0.25
                });
                elements.push(subtitleText);

                // Description area
                const descBox = sandboxApi.createRectangle({
                    width: width * 0.8,
                    height: height * 0.3,
                    fill: { ...posterData.colors.secondary, alpha: 0.9 },
                    x: width * 0.1,
                    y: height * 0.4
                });
                elements.push(descBox);

                const descText = sandboxApi.createText({
                    text: description,
                    fontSize: Math.min(width * 0.035, 28),
                    color: posterData.colors.primary,
                    align: constants.TextAlignment.center,
                    x: width * 0.15,
                    y: height * 0.45
                });
                elements.push(descText);

                // Call to action button
                const ctaButton = sandboxApi.createRectangle({
                    width: width * 0.4,
                    height: height * 0.08,
                    fill: posterData.colors.accent,
                    x: width * 0.3,
                    y: height * 0.8
                });
                elements.push(ctaButton);

                const ctaText = sandboxApi.createText({
                    text: callToAction.toUpperCase(),
                    fontSize: Math.min(width * 0.03, 24),
                    color: posterData.colors.secondary,
                    align: constants.TextAlignment.center,
                    x: width * 0.32,
                    y: height * 0.82
                });
                elements.push(ctaText);
            }

            // Group all elements
            const nodeIds = elements.map(el => el.id);
            return sandboxApi.createGroup({ nodeIds });
        },

        createFlyer: ({
            width = 816,
            height = 1056, // 8.5x11 ratio
            style = "business", // "business", "party", "sale", "announcement"
            headline = "Your Headline Here",
            subheading = "Supporting text or details",
            bodyText = "Main content goes here with all the important information",
            contactInfo = "Contact: info@example.com | 555-0123",
            logoText = "LOGO",
            colorScheme = "blue" // "blue", "red", "green", "purple", "orange"
        } = {}) => {
            const colorSchemes = {
                blue: {
                    primary: { red: 0.1, green: 0.3, blue: 0.7, alpha: 1 },
                    secondary: { red: 0.8, green: 0.9, blue: 1, alpha: 1 },
                    accent: { red: 0, green: 0.6, blue: 0.9, alpha: 1 }
                },
                red: {
                    primary: { red: 0.8, green: 0.1, blue: 0.1, alpha: 1 },
                    secondary: { red: 1, green: 0.9, blue: 0.9, alpha: 1 },
                    accent: { red: 0.6, green: 0, blue: 0, alpha: 1 }
                },
                green: {
                    primary: { red: 0.1, green: 0.6, blue: 0.2, alpha: 1 },
                    secondary: { red: 0.9, green: 1, blue: 0.9, alpha: 1 },
                    accent: { red: 0, green: 0.8, blue: 0.3, alpha: 1 }
                }
            };

            const colors = colorSchemes[colorScheme] || colorSchemes.blue;
            const elements = [];

            // Background
            const bg = sandboxApi.createRectangle({
                width, height,
                fill: { red: 1, green: 1, blue: 1, alpha: 1 },
                x: 0, y: 0
            });
            elements.push(bg);

            // Header section with logo area
            const header = sandboxApi.createRectangle({
                width,
                height: height * 0.12,
                fill: colors.primary,
                x: 0, y: 0
            });
            elements.push(header);

            // Logo placeholder
            const logo = sandboxApi.createText({
                text: logoText,
                fontSize: width * 0.04,
                color: { red: 1, green: 1, blue: 1, alpha: 1 },
                x: width * 0.05,
                y: height * 0.03
            });
            elements.push(logo);

            // Main headline
            const headlineEl = sandboxApi.createText({
                text: headline.toUpperCase(),
                fontSize: Math.min(width * 0.08, 64),
                color: colors.primary,
                align: constants.TextAlignment.center,
                x: width * 0.1,
                y: height * 0.18
            });
            elements.push(headlineEl);

            // Decorative line under headline
            const decorLine = sandboxApi.createRectangle({
                width: width * 0.6,
                height: 4,
                fill: colors.accent,
                x: width * 0.2,
                y: height * 0.28
            });
            elements.push(decorLine);

            // Subheading
            const subheadEl = sandboxApi.createText({
                text: subheading,
                fontSize: Math.min(width * 0.045, 36),
                color: colors.accent,
                align: constants.TextAlignment.center,
                x: width * 0.1,
                y: height * 0.32
            });
            elements.push(subheadEl);

            // Content area background
            const contentBg = sandboxApi.createRectangle({
                width: width * 0.85,
                height: height * 0.35,
                fill: colors.secondary,
                x: width * 0.075,
                y: height * 0.42
            });
            elements.push(contentBg);

            // Body text
            const bodyEl = sandboxApi.createText({
                text: bodyText,
                fontSize: Math.min(width * 0.025, 18),
                color: { red: 0.2, green: 0.2, blue: 0.2, alpha: 1 },
                x: width * 0.1,
                y: height * 0.45
            });
            elements.push(bodyEl);

            // Footer with contact info
            const footer = sandboxApi.createRectangle({
                width,
                height: height * 0.08,
                fill: colors.primary,
                x: 0,
                y: height * 0.92
            });
            elements.push(footer);

            const contactEl = sandboxApi.createText({
                text: contactInfo,
                fontSize: Math.min(width * 0.02, 14),
                color: { red: 1, green: 1, blue: 1, alpha: 1 },
                align: constants.TextAlignment.center,
                x: width * 0.1,
                y: height * 0.94
            });
            elements.push(contactEl);

            const nodeIds = elements.map(el => el.id);
            return sandboxApi.createGroup({ nodeIds });
        },

        createBusinessCard: ({
            width = 420, // 3.5 inches at 120 DPI
            height = 252, // 2.1 inches at 120 DPI
            name = "John Doe",
            title = "Software Developer",
            company = "Tech Company",
            phone = "555-0123",
            email = "john@company.com",
            website = "www.company.com",
            colorScheme = "professional" // "professional", "creative", "minimal"
        } = {}) => {
            const schemes = {
                professional: {
                    primary: { red: 0.1, green: 0.2, blue: 0.4, alpha: 1 },
                    secondary: { red: 1, green: 1, blue: 1, alpha: 1 },
                    accent: { red: 0.3, green: 0.5, blue: 0.7, alpha: 1 }
                },
                creative: {
                    primary: { red: 0.8, green: 0.2, blue: 0.6, alpha: 1 },
                    secondary: { red: 1, green: 1, blue: 1, alpha: 1 },
                    accent: { red: 1, green: 0.7, blue: 0.2, alpha: 1 }
                },
                minimal: {
                    primary: { red: 0.1, green: 0.1, blue: 0.1, alpha: 1 },
                    secondary: { red: 1, green: 1, blue: 1, alpha: 1 },
                    accent: { red: 0.6, green: 0.6, blue: 0.6, alpha: 1 }
                }
            };

            const colors = schemes[colorScheme] || schemes.professional;
            const elements = [];

            // Background
            const bg = sandboxApi.createRectangle({
                width, height,
                fill: colors.secondary,
                x: 0, y: 0
            });
            elements.push(bg);

            // Accent stripe
            const stripe = sandboxApi.createRectangle({
                width: width * 0.08,
                height,
                fill: colors.primary,
                x: 0, y: 0
            });
            elements.push(stripe);

            // Name
            const nameEl = sandboxApi.createText({
                text: name.toUpperCase(),
                fontSize: 18,
                color: colors.primary,
                x: width * 0.12,
                y: height * 0.15
            });
            elements.push(nameEl);

            // Title
            const titleEl = sandboxApi.createText({
                text: title,
                fontSize: 14,
                color: colors.accent,
                x: width * 0.12,
                y: height * 0.35
            });
            elements.push(titleEl);

            // Company
            const companyEl = sandboxApi.createText({
                text: company,
                fontSize: 12,
                color: colors.primary,
                x: width * 0.12,
                y: height * 0.5
            });
            elements.push(companyEl);

            // Contact info
            const phoneEl = sandboxApi.createText({
                text: phone,
                fontSize: 10,
                color: colors.accent,
                x: width * 0.12,
                y: height * 0.68
            });
            elements.push(phoneEl);

            const emailEl = sandboxApi.createText({
                text: email,
                fontSize: 10,
                color: colors.accent,
                x: width * 0.12,
                y: height * 0.78
            });
            elements.push(emailEl);

            const websiteEl = sandboxApi.createText({
                text: website,
                fontSize: 10,
                color: colors.accent,
                x: width * 0.12,
                y: height * 0.88
            });
            elements.push(websiteEl);

            const nodeIds = elements.map(el => el.id);
            return sandboxApi.createGroup({ nodeIds });
        },

        createSocialMediaPost: ({
            size = "instagram", // "instagram", "facebook", "twitter", "linkedin"
            template = "quote", // "quote", "announcement", "product", "tip"
            mainText = "Your main message here",
            subtitle = "",
            hashtags = "#design #creative",
            brandName = "",
            colorTheme = "vibrant"
        } = {}) => {
            const sizes = {
                instagram: { width: 1080, height: 1080 },
                facebook: { width: 1200, height: 630 },
                twitter: { width: 1200, height: 675 },
                linkedin: { width: 1200, height: 627 }
            };

            const themes = {
                vibrant: {
                    bg: { red: 0.9, green: 0.2, blue: 0.5, alpha: 1 },
                    text: { red: 1, green: 1, blue: 1, alpha: 1 },
                    accent: { red: 1, green: 0.8, blue: 0.2, alpha: 1 }
                },
                minimal: {
                    bg: { red: 0.95, green: 0.95, blue: 0.95, alpha: 1 },
                    text: { red: 0.1, green: 0.1, blue: 0.1, alpha: 1 },
                    accent: { red: 0.3, green: 0.3, blue: 0.3, alpha: 1 }
                },
                professional: {
                    bg: { red: 0.1, green: 0.3, blue: 0.5, alpha: 1 },
                    text: { red: 1, green: 1, blue: 1, alpha: 1 },
                    accent: { red: 0.4, green: 0.7, blue: 1, alpha: 1 }
                }
            };

            const { width, height } = sizes[size] || sizes.instagram;
            const colors = themes[colorTheme] || themes.vibrant;
            const elements = [];

            // Background
            const bg = sandboxApi.createRectangle({
                width, height,
                fill: colors.bg,
                x: 0, y: 0
            });
            elements.push(bg);

            // Decorative elements based on template
            if (template === "quote") {
                // Quote marks
                const quoteLeft = sandboxApi.createText({
                    text: '"',
                    fontSize: width * 0.2,
                    color: { ...colors.accent, alpha: 0.3 },
                    x: width * 0.1,
                    y: height * 0.1
                });
                elements.push(quoteLeft);

                const quoteRight = sandboxApi.createText({
                    text: '"',
                    fontSize: width * 0.2,
                    color: { ...colors.accent, alpha: 0.3 },
                    x: width * 0.75,
                    y: height * 0.6
                });
                elements.push(quoteRight);
            }

            // Main text
            const mainTextEl = sandboxApi.createText({
                text: mainText,
                fontSize: Math.min(width * 0.06, 48),
                color: colors.text,
                align: constants.TextAlignment.center,
                x: width * 0.1,
                y: height * 0.35
            });
            elements.push(mainTextEl);

            // Subtitle if provided
            if (subtitle) {
                const subtitleEl = sandboxApi.createText({
                    text: subtitle,
                    fontSize: Math.min(width * 0.03, 24),
                    color: { ...colors.text, alpha: 0.8 },
                    align: constants.TextAlignment.center,
                    x: width * 0.1,
                    y: height * 0.55
                });
                elements.push(subtitleEl);
            }

            // Brand name
            if (brandName) {
                const brandEl = sandboxApi.createText({
                    text: brandName.toUpperCase(),
                    fontSize: Math.min(width * 0.025, 20),
                    color: colors.accent,
                    x: width * 0.05,
                    y: height * 0.9
                });
                elements.push(brandEl);
            }

            // Hashtags
            if (hashtags) {
                const hashtagEl = sandboxApi.createText({
                    text: hashtags,
                    fontSize: Math.min(width * 0.02, 16),
                    color: { ...colors.text, alpha: 0.7 },
                    align: constants.TextAlignment.right,
                    x: width * 0.6,
                    y: height * 0.9
                });
                elements.push(hashtagEl);
            }

            const nodeIds = elements.map(el => el.id);
            return sandboxApi.createGroup({ nodeIds });
        }
        ,
        // =============================================================================================================
        // CURR IMPLEMENTATIONS
        //==============================================================================================================
        // Inside sandboxApi in code.js
        createGrid: ({
            rows = 1,
            columns = 1,
            width = 100,
            height = 100,
            color1,
            color2 = null
        } = {}) => {
            if (!color1) throw new Error("color1 is required");
            const nodes = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    const x = c * width;
                    const y = r * height;
                    // pick color1 or color2
                    const fill = color2 && ((r + c) % 2 === 1)
                        ? color2
                        : color1;
                    const rect = editor.createRectangle();
                    Object.assign(rect, {
                        width,
                        height,
                        translation: { x, y },
                        fill: editor.makeColorFill(fill)
                    });
                    editor.context.insertionParent.children.append(rect);
                    nodes.push(serialize(rect, "rectangle"));
                }
            }
            return nodes;
        },
        createPixelArt: ({
            rows = 10,
            columns = 10,
            canvasWidth,
            canvasHeight,
            pixelSize = 30,
            colors = [],
            x: offsetX = 0,
            y: offsetY = 0
        } = {}) => {
            const total = rows * columns;

            // 1) Ensure we have at least `total` entries
            const padded = colors.slice(0, total);
            while (padded.length < total) {
                padded.push(colors[0] || "#000000");
            }

            // 2) Compute overall and per-cell sizes
            const W = canvasWidth ?? columns * pixelSize;
            const H = canvasHeight ?? rows * pixelSize;
            const cellW = W / columns;
            const cellH = H / rows;

            // 3) Hex‐to‐RGBA helper, with validation
            const hexToRGBA = (hex) => {
                let h = (hex || "").replace(/^#/, "");
                if (![3, 6].includes(h.length)) h = "000000";
                if (h.length === 3) h = h.split("").map(c => c + c).join("");
                const val = parseInt(h, 16);
                return {
                    red: ((val >> 16) & 0xff) / 255,
                    green: ((val >> 8) & 0xff) / 255,
                    blue: (val & 0xff) / 255,
                    alpha: 1
                };
            };

            // 4) Draw the grid
            const out = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    const idx = r * columns + c;
                    const rect = editor.createRectangle();
                    Object.assign(rect, {
                        width: cellW,
                        height: cellH,
                        translation: {
                            x: offsetX + c * cellW,
                            y: offsetY + r * cellH
                        },
                        fill: editor.makeColorFill(hexToRGBA(padded[idx]))
                    });
                    editor.context.insertionParent.children.append(rect);
                    out.push(serialize(rect, "pixel"));
                }
            }
            return out;
        },


        // TODO: Forest --> calls tree function
        // TODO: Tree function


        createEvergreenTree: ({
            xpos = 0,
            ypos = 0,
            leaf_color = { red: 0, green: 0.5, blue: 0, alpha: 1 },
            stem_color = { red: 0.5, green: 0.25, blue: 0, alpha: 1 }
        } = {}) => {
            const g = editor.createGroup();

            const trunk = editor.createRectangle();
            trunk.width = 20;
            trunk.height = 50;
            trunk.translation = { x: 100, y: 150 };
            trunk.fill = editor.makeColorFill(stem_color);
            g.children.append(trunk);

            const tri1 = editor.createPath("M 0 60 L 40 0 L 80 60 Z");
            tri1.translation = { x: 70, y: 90 };
            tri1.fill = editor.makeColorFill(leaf_color);
            g.children.append(tri1);

            const tri2 = editor.createPath("M 0 50 L 30 0 L 60 50 Z");
            tri2.translation = { x: 80, y: 50 };
            tri2.fill = editor.makeColorFill(leaf_color);
            g.children.append(tri2);

            const tri3 = editor.createPath("M 0 40 L 20 0 L 40 40 Z");
            tri3.translation = { x: 90, y: 20 };
            tri3.fill = editor.makeColorFill(leaf_color);
            g.children.append(tri3);

            g.translation = { x: xpos, y: ypos };
            editor.context.insertionParent.children.append(g);

            return serialize(g, "group", true);
        },
        createForest: ({
            num_trees = 10,
            tree_data = {
                leaf_color: { red: 0, green: 0.5, blue: 0.25, alpha: 1 },
                stem_color: { red: 0.4, green: 0.25, blue: 0.1, alpha: 1 }
            },
            xrange = { low: 0, high: 1000 },
            yrange = { low: 0, high: 600 }
        } = {}) => {
            const results = [];
            for (let i = 0; i < num_trees; i++) {
                const x = xrange.low + Math.random() * (xrange.high - xrange.low);
                const y = yrange.low + Math.random() * (yrange.high - yrange.low);

                const treeNode = sandboxApi.createEvergreenTree({
                    ...tree_data,
                    xpos: x,
                    ypos: y
                });

                results.push(treeNode);
            }
            return results.flat();
        },

        createRectangle({ width = 300, height = 300, fill = { red: .32, green: .34, blue: .89, alpha: 1 }, x = 0, y = 0 } = {}) {
            const r = editor.createRectangle();
            Object.assign(r, { width, height, translation: { x, y }, fill: editor.makeColorFill(fill) });
            editor.context.insertionParent.children.append(r);
            return serialize(r, "rectangle");
        },
        createEllipse({ rx = 150, ry = 150, fill = { red: .32, green: .34, blue: .89, alpha: 1 }, x = 0, y = 0 } = {}) {
            const e = editor.createEllipse();
            Object.assign(e, { rx, ry, translation: { x, y }, fill: editor.makeColorFill(fill) });
            editor.context.insertionParent.children.append(e);
            return serialize(e, "ellipse");
        },
        createLine({ start = { x: 0, y: 0 }, end = { x: 100, y: 100 }, stroke = { red: 0, green: 0, blue: 0, alpha: 1 }, width = 1, dashPattern = [], x = 0, y = 0 } = {}) {
            const ln = editor.createLine();
            ln.setEndPoints(start.x, start.y, end.x, end.y);
            ln.translation = { x, y };
            ln.stroke = editor.makeStroke({ color: stroke, width, dashPattern });
            editor.context.insertionParent.children.append(ln);
            return serialize(ln, "line");
        },
        createText({ text = "Text", fontSize = 20, color = { red: 0, green: 0, blue: 0, alpha: 1 }, align = constants.TextAlignment.left, x = 50, y = 50 } = {}) {
            const t = editor.createText();
            t.fullContent.text = text;
            t.fullContent.applyCharacterStyles({ fontSize, color });
            t.textAlignment = align;
            t.translation = { x, y };
            editor.context.insertionParent.children.append(t);
            return serialize(t, "text");
        },
        createPath({ svgPath = "M 0 0 L 100 0 L 100 100 Z", stroke = null, fill = null, x = 0, y = 0 } = {}) {
            const p = editor.createPath(svgPath);
            if (fill) p.fill = editor.makeColorFill(fill);
            if (stroke) p.stroke = editor.makeStroke(stroke);
            p.translation = { x, y };
            editor.context.insertionParent.children.append(p);
            return serialize(p, "path");
        },
        createImage: createImageNode,
        createGroup: ({ nodeIds = [] } = {}) => {
            const g = editor.createGroup();
            nodeIds.map(findNode).filter(Boolean).forEach(n => g.children.append(n));
            editor.context.insertionParent.children.append(g);
            return serialize(g, "group", true);
        },


        // =============================================================================================================
        // Updating Existing Objects
        //==============================================================================================================


        moveNode: ({ id, dx = 0, dy = 0 } = {}) => {
            const n = findNode(id);
            if (!n) throw new Error("Node not found");
            n.translation = { x: (n.translation?.x ?? 0) + dx, y: (n.translation?.y ?? 0) + dy };
        },
        rotateNode: ({ id, degrees = 0, pivot = { x: 0, y: 0 } } = {}) => {
            const n = findNode(id);
            if (!n?.setRotationInParent) throw new Error("Rotation not supported");
            n.setRotationInParent(degrees, pivot);
        },
        updateFill(id, fill) {
            const n = findNode(id);
            if (!n) throw new Error("Node not found");
            if (!n.fill) throw new Error("Node has no fill property");
            n.fill = editor.makeColorFill(fill);
        },
        setOpacity(id, value = 1) {
            const n = findNode(id);
            n.opacity = value;
        },
        lockNode(id, locked = true) {
            const n = findNode(id);
            n.locked = locked;
        },


        // =============================================================================================================
        // Deleting Existing Objects
        //==============================================================================================================

        deleteNode(id) {
            const n = findNode(id);
            if (n) n.removeFromParent(); // official deletion method
            return { id, deleted: !!n };
        },
        clearCanvas() {
            const parent = editor.context.insertionParent;
            [...parent.children.toArray()].forEach(c => c.removeFromParent());
            return { cleared: true };
        },

        // =============================================================================================================
        // To Help with queries
        //==============================================================================================================

        listNodes({ deep = false } = {}) {
            return editor.context.insertionParent.children.toArray().map(n => serialize(n, deep));
        },
        getNode(id, { deep = false } = {}) {
            const n = findNode(id);
            return n ? serialize(n, deep) : null;
        },


    };

    runtime.exposeApi(sandboxApi);
}

start();

