# Postboy

A modern, terminal-based API testing and development tool with a clean TUI (Text User Interface). Postboy helps you design, test, and debug HTTP requests efficiently, all from your terminal.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Feature Details](#feature-details)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Intuitive TUI**: Clean, keyboard-driven interface for rapid API testing.
- **Request Composer**: Easily create and edit HTTP requests (GET, POST, PUT, DELETE, etc.).
- **History Management**: Automatically saves and organizes your request history.
- **Response Viewer**: Pretty-prints JSON, XML, and raw responses.
- **Theming**: Switch between ten different themes.
- **Mock Server**: Quickly spin up mock endpoints for local testing.
- **Logging**: Detailed request/response logs for debugging.
- **Keyboard Shortcuts**: Efficient navigation and actions.
- **Configurable**: Customize settings to fit your workflow.

---

## Installation

```bash
# Using bun
bun install

# Or using npm
npm install
```

---

## Usage

### Run in Development

```bash
# Start the TUI (Text User Interface)
bun run src/index.ts ui

# Or with npm
npm start -- ui
```

### CLI Commands

- **Launch TUI interface:**
  ```bash
  bun run src/index.ts ui
  # or, if installed globally:
  postboy ui
  ```

- **Send a test API request (interactive prompt):**
  ```bash
  bun run src/index.ts test
  # or
  postboy test
  ```

- **List available mock API endpoints:**
  ```bash
  bun run src/index.ts mock-list
  # or
  postboy mock-list
  ```

### Build and Install Globally (Optional)

To use the `postboy` command anywhere:

```bash
bun run build
bun add -g .
# Now you can use:
postboy ui
postboy test
postboy mock-list
```

---

## Screenshots

> _Add screenshots in the spaces below to showcase the UI and features._

### Main Dashboard

![Main Dashboard](./screenshots/main-dashboard.png)

### Request Composer

![Request Composer](./screenshots/request-composer.png)

### Response Viewer

![Response Viewer](./screenshots/response-viewer.png)

### History Management

![History Management](./screenshots/history.png)

### Theming

![Theming](./screenshots/theming.png)

---

## Feature Details

### 1. Intuitive TUI

A clean, keyboard-driven interface designed for productivity. Navigate between panels, compose requests, and view responses without leaving your terminal.

> _Screenshot: Main Dashboard_

---

### 2. Request Composer

Create and edit HTTP requests with support for all major methods. Add headers, body, and query parameters with ease.

> _Screenshot: Request Composer_

---

### 3. History Management

Automatically saves every request you make. Browse, search, and re-run previous requests.

> _Screenshot: History Management_

---

### 4. Response Viewer

View responses in a pretty-printed format. Supports JSON, XML, and raw text. Syntax highlighting for easy reading.

> _Screenshot: Response Viewer_

---

### 5. Theming

Switch between light and dark themes to suit your preference.

> _Screenshot: Theming_

---

### 6. Mock Server

Spin up local mock endpoints for testing your API clients without needing a real backend.

---

### 7. Logging

Detailed logs of all requests and responses, including headers, status codes, and timings.

---

### 8. Keyboard Shortcuts

Navigate and perform actions quickly using intuitive keyboard shortcuts.

---

### 9. Configurable

Customize settings such as themes, default headers, and more to fit your workflow.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

[MIT](./LICENSE)

---

## Contact

For support, questions, or feedback, please open an issue or contact the maintainer.

---
