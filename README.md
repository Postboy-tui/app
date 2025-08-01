# Postboy

A modern, terminal-based API testing and development tool with a clean TUI (Text User Interface). Postboy helps you design, test, and debug HTTP requests efficiently, all from your terminal.

[![NPM Version](https://img.shields.io/npm/v/pomo-tui.svg)](https://www.npmjs.com/package/postboy-tui)
[![Node Version](https://img.shields.io/node/v/pomo-tui.svg)](https://www.npmjs.com/package/postboy-tui)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
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
npm i -g postboy-tui@latest
#or
bun i -g postboy-tui@latest
```

---

## Usage

### CLI Commands

- **Launch TUI interface:**
  ```bash
  postboy-tui ui
  ```

- **Send a test API request (interactive prompt):**
  ```bash
  postboy-tui run
  ```

- **List available mock API endpoints:**
  ```bash
  postboy-tui mock-list
  ```
---

## Feature Details

### 1. Intuitive TUI

A clean, keyboard-driven interface designed for productivity. Navigate between panels, compose requests, and view responses without leaving your terminal.

<img width="1111" height="649" alt="image" src="https://github.com/user-attachments/assets/de940869-4bfe-4349-a1bd-2259d46f2fde" />

---

### 2. Request Composer

Create and edit HTTP requests with support for all major methods. Add headers, body, and query parameters with ease.

<img width="643" height="428" alt="image" src="https://github.com/user-attachments/assets/304c5903-f3c1-4470-85d2-39eebb184c63" />


---

### 3. History Management

Automatically saves every request you make. Browse, search, and re-run previous requests.


<img width="427" height="440" alt="image" src="https://github.com/user-attachments/assets/cf055710-5701-490c-bfc6-a9afbbea223d" />


---

### 4. Response Viewer

View responses in a pretty-printed format. Supports JSON, XML, and raw text. Syntax highlighting for easy reading.

<img width="646" height="692" alt="image" src="https://github.com/user-attachments/assets/d5c60702-c71e-410c-bfbd-2643f78403f3" />


---

### 5. Theming

Switch between light and dark themes to suit your preference.
<img width="1145" height="912" alt="image" src="https://github.com/user-attachments/assets/c87c1484-0d59-4f29-9132-6783c8cc1e15" />

---

### 6. Mock APIs list

- categorized mock api lists
- get a bunch of mock apis for testing the clients under development.

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

## Contact

For support, questions, or feedback, please open an issue or contact the maintainer.

---
