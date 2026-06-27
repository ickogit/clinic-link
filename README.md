# ClinicLink Admin Portal

ClinicLink is a full-stack web application designed to solve scheduling friction and streamline queue management for small medical clinics and General Practitioners. Built using the **MERN Stack**, this portal enables healthcare administrators to efficiently manage patient traffic, register new slots, and execute real-time administrative actions without UI lag.

## 🚀 Key Features

* **Interactive Live Queue:** Provides a dynamic view of all active daily patient records sorted chronologically.
* **Instant Query Search:** Allows clinic staff to instantaneously search through appointments by Patient Name, Phone Number, or Assigned Doctor on every keystroke.
* **Inline Editing Flow:** Features state-driven toggling toggles between read-only views and form editing fields directly inside the card list layout.
* **Dynamic Metadata Engine:** Implements precise localized date string manipulations to append clear long-form day-of-the-week references (e.g., Thursday, Friday) next to the date for scheduling ease.
* **Custom Filtering Controls:** Enables seamless single-click dropdown segmentation to isolate schedules matching specific attending specialists.

## 🛠️ Technical Stack

* **Frontend:** React (Hooks, Dynamic UI Toggling State, Local Client-side Mutation Modifiers)
* **Backend:** Node.js, Express.js (RESTful Routing Architecture, Input Form Error Validations)
* **Database:** MongoDB via Mongoose Object Modeling
* **Environment Hygiene:** Fully sandboxed secure configuration keys (`.env`) and explicit `.gitignore` definitions.

## 📦 Installation & Setup

To replicate or review the development environment locally, follow these steps:

### 1. Clone the Repository
```bash
git clone [https://github.com/ickogit/clinic-link.git](https://github.com/ickogit/clinic-link.git)
cd clinic-link