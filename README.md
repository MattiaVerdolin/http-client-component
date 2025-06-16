# 🌐 HTTP Client Component

## 📝 Overview
This project is a modern **HTTP Client component**, developed for the **Web Applications 2** course (2024/2025).  
It is inspired by tools like Postman and built using the **Svelte framework** with **Vite.js** as the bundler.  
The component is designed with a **modular and configurable architecture**, allowing seamless integration into different environments and use cases.

One of its key strengths is the **clean and polished UI**, styled with custom CSS and structured for a smooth and efficient user experience.

<p align="center">
  <img src="https://github.com/user-attachments/assets/351ffe0a-e301-45a6-81cd-74d227ccedef" height="400px">
</p>

---

## 🚀 Features

### 🔧 **Core Functionalities**
- **Expandable sidebar** for browsing and managing collections and their requests.
- **Dynamic request configuration** including:
  - HTTP method (GET, POST, PUT, DELETE, etc.)
  - URL input
  - Custom headers and body
- **Response preview** that adapts based on content type (HTML, image, JSON, etc.)
- **Real-time response log** showing status, headers, and response body.

### 🧩 **Request Management**
- **Create**, **edit**, and **delete** HTTP requests within collections.
- **Filter** collections and requests with client-side search.
- **Export** and **import** collections via file.

### ⚙️ **Component Configuration**
- Toggle visibility of the **search bar** and **collections sidebar**.
- Provide a **custom callback function** for handling click events on HTTP response logs.

## 🛠️ Technologies Used
- **Frontend Framework:** Svelte (component-based architecture)
- **Bundler:** Vite.js
- **HTTP Communication:** Fetch API
- **Remote API:** SUPSI HTTP BFF (https://supsi-ticket.cloudns.org/supsi-http-client/swagger-ui.html)
- **CSS Styling:** Custom design system

---

## 🔌 Backend Integration
The component communicates with a **remote backend** using the following endpoints:
- **List collections:**  
  `GET /bff/collections`
- **List requests for a collection:**  
  `GET /bff/collections/{collectionId}/requests?apiKey=YOUR_KEY`
- **Create a new request:**  
  `POST /bff/collections/{collectionId}/requests`
- **Update an existing request:**  
  `PUT /bff/requests/{requestId}`
- **Delete a request:**  
  `DELETE /bff/requests/{requestId}`

All endpoints require an `apiKey` parameter, which can be freely chosen (e.g. your last name).

---

## ▶️ How to Run
1. Clone the repository:
```bash
git clone git@github.com:YourUsername/http-client-svelte.git
```
2. Navigate to the project folder:

```bash
cd http-client-svelte
```
3. Install dependencies and run the project:

```bash
npm install
npm run dev
```
---
## 👥 Authors
- Mattia Verdolin 📧 mattia.verdolin@student.supsi.ch
- Alessandro Cantoni 📧 alessandro.cantoni@student.supsi.ch

---
## 📜 License
This component was developed for educational purposes as part of the SUPSI course “Web Applications 2”.
Any use outside the academic context requires prior approval from the authors.
