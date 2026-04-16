# 🖱 Input Controller — Desktop App (Electron + nut.js)

A desktop app to control mouse and keyboard programmatically using [nut.js](https://nutjs.dev/).

## Features

- **Mouse Control** — click (left/right/double), move, drag, scroll at any X/Y coordinate
- **Keyboard Control** — type text, press special keys, send hotkey combos
- **Coordinate Canvas** — click anywhere on canvas to instantly fire mouse events
- **Macro Builder** — chain multiple steps (click, move, type, wait) and repeat
- **Speed Control** — adjustable mouse movement speed
- **Activity Log** — live feedback on every action

## Setup

### Prerequisites

- Node.js 18+ (or 20+)
- npm 9+
- Linux: `libxtst-dev`, `libpng++-dev` (for nut.js native deps)
- macOS: Accessibility permissions in System Preferences → Security & Privacy
- Windows: No extra deps needed

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm start
```

### Linux Extra Steps

```bash
sudo apt-get install -y libxtst-dev libpng++-dev
```

### macOS Permissions

When prompted, grant Accessibility access to your Terminal or the built app in:
**System Preferences → Security & Privacy → Privacy → Accessibility**

## How to Use

### Mouse Tab (Left Panel)
1. **Click Mode** — choose Left, Right, or Double click
2. **Canvas** — hover to preview coordinates, click to fire the event at that position
3. **Move/Click** — enter X/Y coordinates manually and press the buttons
4. **Drag** — set from/to coordinates and drag
5. **Scroll** — set position, direction, and amount
6. **Speed** — slider from 100–2000 px/s

### Keyboard Tab (Right Panel)
- **Type Text** — paste any text and it gets typed character by character
- **Special Keys** — click chips to select keys, then "Press Selected Keys"
- **Hotkey Combo** — select a modifier (Ctrl/Alt/etc.) + a key to send a combo

### Macro Tab
1. Select step type (click/move/type/wait)
2. Fill in parameters and click **Add Step**
3. Repeat for all steps
4. Set repeat count and click **Run Macro**

## Coordinate System

Coordinates are absolute screen positions (pixels from top-left of your primary display). The canvas in the app is a visual helper — coordinates shown when hovering are illustrative. Enter your target screen coordinates in the X/Y inputs to control the actual cursor.

## File Structure

```
mouse-controller/
├── main.js       # Electron main process + nut.js IPC handlers
├── preload.js    # Secure bridge between renderer and nut.js
├── index.html    # App UI
├── package.json  # Dependencies
└── README.md
```
