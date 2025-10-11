# OX-Admin: A Lightweight Admin Dashboard

![GitHub release](https://img.shields.io/github/release/SunnyVinizin/OX-Admin.svg) ![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg) ![Vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)

Welcome to **OX-Admin**, a lightweight and efficient admin dashboard built with Vue 3 and Element Plus. This system integrates various enterprise-level features, including RBAC permission management, workflow approval, a form designer, and real-time communication. It also supports one-click deployment via Docker.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Features

- **RBAC Permission Management**: Manage user roles and permissions effectively.
- **Workflow Approval**: Streamline approval processes within your organization.
- **Form Designer**: Create custom forms easily.
- **Real-time Communication**: Enable real-time updates and notifications.
- **Docker Support**: Simplify deployment with one-click Docker support.

## Technologies Used

- **Vue 3**: The core framework for building user interfaces.
- **Element Plus**: A UI toolkit for Vue 3 that provides a set of customizable components.
- **Pinia**: A state management library for Vue 3 applications.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **TypeScript**: A superset of JavaScript that adds static types.
- **WebSocket**: For real-time communication.
- **Workflow Engine**: To manage complex workflows within the application.

## Installation

To get started with OX-Admin, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/SunnyVinizin/OX-Admin.git
   cd OX-Admin
   ```

2. **Install Dependencies**:

   Use npm or yarn to install the necessary packages.

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the Application**:

   You can run the application in development mode using:

   ```bash
   npm run serve
   # or
   yarn serve
   ```

4. **Build for Production**:

   To build the application for production, run:

   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Docker Deployment**:

   For one-click deployment using Docker, follow these commands:

   ```bash
   docker build -t ox-admin .
   docker run -d -p 8080:80 ox-admin
   ```

   Visit `http://localhost:8080` to access the application.

## Usage

Once the application is running, you can navigate through the dashboard. The main features include:

- **User Management**: Add, edit, and delete users.
- **Role Management**: Create and assign roles to users.
- **Form Designer**: Access the form designer to create custom forms.
- **Workflow Management**: View and manage workflows.

## Contributing

We welcome contributions to OX-Admin. If you want to contribute, please follow these steps:

1. **Fork the Repository**.
2. **Create a New Branch**:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. **Make Your Changes**.
4. **Commit Your Changes**:
   ```bash
   git commit -m "Add some feature"
   ```
5. **Push to the Branch**:
   ```bash
   git push origin feature/YourFeature
   ```
6. **Open a Pull Request**.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Links

For the latest releases, visit [Releases](https://github.com/SunnyVinizin/OX-Admin/releases). You can download the latest version and execute it according to the installation instructions provided above.

Feel free to explore the project and contribute. Your feedback and suggestions are always welcome. Thank you for your interest in OX-Admin!