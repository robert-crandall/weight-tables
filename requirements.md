# 🏋️ Barbell Plate Calculator Web App — Requirements

## 📌 Overview

This web application helps lifters determine the correct plate combinations to load a barbell for a range of target weights, based on available plates and bar weight. It is optimized for **print-first usage** and will be deployed as a static site via **GitHub Pages**.

---

## 🎯 Goals

- Allow users to enter their barbell setup (bar weight, available plates).
- Generate a **dual-axis visual table**:
  - **Rows** = base weights using common jump logic (e.g., +50, +90, +140)
  - **Columns** = fine-grained micro additions (2.5, 5, 7.5, etc.)
- Optimize layout for horizontal and vertical space in print mode
- Visually show plates with **color-coded representations**
- Be responsive and printable

---

## 🔧 User Inputs

| Field              | Type      | Default                | Description |
|-------------------|-----------|------------------------|-------------|
| **Barbell Weight** | Number    | `45`                   | Total weight of the barbell in pounds |
| **Available Plates** | Text/List | `45x2, 25, 10x2, 5, 2.5` | Plates user owns, including optional quantities |
| **Starting Weight** | Number    | `45`                   | First target total weight |
| **Ending Weight**   | Number    | `305`                  | Last target total weight |
| **Plate Colors**    | Object    | See below              | Map of plate weight to color (customizable) |

---

## 🧠 Plate Color Coding

| Plate Weight | Default Color |
|--------------|----------------|
| 45           | Blue           |
| 35           | Yellow         |
| 25           | Green          |
| 10           | Gray           |
| 5            | Black          |
| 2.5          | Light Gray     |

User can override these using a color picker UI.

---

## 📊 Output Table Layout

### Grid Logic

|               | +5 lbs   | +10 lbs | +15 lbs | +20 lbs | +25 lbs | +30 lbs | +35 lbs | +40 lbs | + 45 lbs |
|---------------|----------|--------|----------|----------|--------|---------|---------|---------|-------|
| **95** lbs 25  | **100** 25 2.5 | **105** 25 5 | **110** 25 5 2.5 | **115** 25 10 |  **120** 25 10 2.5 |  **125** 25 10 5 |  **130** 25 10 5 2.5 | (empty) | (empty) |
| **135** lbs 45  | **140** 45 2.5 | **145** 45 5 | **150** 45 5 2.5 | **155** 45 10 | **160** 45 10 2.5 | **165** 45 10 5 | **170** 45 10 5 2.5 | **175** 45 10 10 | **180** 45 10 10 2.5 |

- Each **row** starts with a **base weight** generated from `Base Jump Strategy`.
- Each **column** adds a **micro increment** to that base weight.
- **Cell** content:
  - Total weight (bold or highlighted)
  - Plate breakdown (e.g., `45 + 5`)
  - Visual bar with **color-coded plates**

### Base Jump Strategy Options

The two largest plates will cause new rows. This does not take quantity into account. For example, if there are 45x2 and 25 plates, new rows would be caused by 45 and 25.

News rows are created when **only** these weights are used. For example, if a weight is 185, which is caused by using 45 and 25 and **not using** any other weight, this will create a new row.


---

## 💻 Technical Requirements

| Area       | Requirement |
|------------|-------------|
| Frontend   | HTML, CSS (TailwindCSS suggested), JavaScript |
| Deployment | Static site (GitHub Pages) |
| Hosting    | GitHub Pages |
| Framework  | Vanilla JS or lightweight (e.g., Alpine.js) |
| Build Tool | Optional (e.g., Vite, no SSR needed) |

---

## 🖨️ Print-Friendly Requirements

- Use `@media print` CSS to:
  - Hide controls and UI chrome
  - Format table to maximize horizontal and vertical space
  - Fit common page sizes (A4, US Letter) in **landscape**
- Grid layout:
  - **Wide table with multiple columns per row**
  - Bold headers, readable font
  - High-contrast colors or grayscale fallback
- **Option to toggle colors on/off** for B&W printers
- Minimize page breaks by reducing row height and padding

---

## ✅ Acceptance Criteria

- [ ] App is a fully static site that runs in browser
- [ ] User can input configuration fields
- [ ] Plate breakdowns are calculated correctly per side
- [ ] Output table uses:
  - Rows for base weights
  - Columns for micro increments
- [ ] Visual output uses customizable color-coded plates
- [ ] Print-friendly formatting works cleanly
