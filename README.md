
# 📅 Appointment Booking System

A comprehensive Full-Stack E-Learning and Service Management platform built using the **Microsoft Stack** (.NET 10) and **React**. This system allows users to book appointments, employees to manage schedules, and administrators to oversee the entire ecosystem.

## 🚀 Features

### Core Functionality
* **Real-Time Communication:** Integrated **SignalR** for instant notifications, chat, and appointment updates.
* **Advanced Authentication:** Secure login system using **JWT (JSON Web Tokens)** and **Refresh Tokens**.
* **Role-Based Access Control (RBAC):** Granular permission management for Admins, Employees, and Clients.
* **Payment Integration:** Online payment processing via Stripe/PayPal.
* **Dynamic Reporting:** Export/Import data in CSV, Excel, and JSON formats.

### Technical Excellence
* **Architecture:** Layered architecture (Controllers, Services, Repositories).
* **Database:** Hybrid approach using **SQL Server** for relational data and **MongoDB** for specific NoSQL needs.
* **Database Design:** 24+ tables optimized in **Third Normal Form (3NF)**.
* **API Documentation:** Fully documented endpoints using **Swagger**.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | .NET Core Web API (.NET 10) |
| **Frontend** | React + Vite |
| **Primary Database** | Microsoft SQL Server |
| **NoSQL Database** | MongoDB |
| **Real-Time** | SignalR (WebSockets) |
| **Project Mgmt** | Trello |
| **Version Control** | GitHub |

## 🏗️ Application Architecture

The system follows a clean, layered architecture to ensure maintainability and scalability:
* **Controllers:** Handling HTTP requests.
* **Services:** Containing core business logic.
* **Repositories:** Managing database abstraction.
* **Database Layer:** SQL Server & MongoDB.

## 👥 Team Contribution (4 Members)

As the **Project Manager & Lead Developer**, I coordinated the team of four and personally handled the **Authentication & User Management** module, including:
* Identity management and security (CORS, Validation).
* JWT & Refresh Token implementation.
* Database schema design for the entire system.

## 📋 Database Tables (Partial List)
The system includes 24+ mandatory tables such as:
`Users`, `Roles`, `Permissions`, `Appointments`, `Schedules`, `Payments`, `AuditLogs`, `Notifications`, `Invoices`, and more.

## 🏁 Getting Started

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/elvis1322/AppointmentBookingSystem.git](https://github.com/elvis1322/AppointmentBookingSystem.git)