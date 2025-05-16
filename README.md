# 🏋️ Barbell Plate Calculator

A web application that helps lifters determine the correct plate combinations to load a barbell for a range of target weights. Optimized for print-first usage and deployed as a static site via GitHub Pages.

## 📋 Features

- Enter your barbell setup (bar weight, available plates)
- Generate a dual-axis visual table:
  - **Rows** = base weights using common jump logic
  - **Columns** = fine-grained micro additions
- Color-coded visual representation of plates
- Print-friendly layout optimized for landscape orientation
- Fully configurable plate colors with black and white mode for printing

## 🚀 Usage

1. Enter your barbell weight (default: 45 lbs)
2. List your available plates in the format `weight×quantity` (e.g., `45x2, 25, 10x2, 5, 2.5`)
3. Set your starting and ending weight range
4. Customize plate colors (optional)
5. Click "Calculate Plate Combinations"
6. View and print your personalized plate combination chart

## 🖨️ Printing

This application is designed to be print-friendly. To print your plate combination chart:

1. Calculate your plate combinations
2. Optionally toggle "Use black and white" for B&W printers
3. Click the "Print Results" button
4. In the print dialog, select "Landscape" orientation for best results

## 💻 Local Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in your browser

No build steps required! This is a vanilla HTML, CSS, and JavaScript project.

## 📦 Deployment

This project is designed to be deployed on GitHub Pages:

1. Push the repository to GitHub
2. Go to Settings > Pages
3. Select the branch you want to deploy from (e.g., `main`)
4. The site will be available at `https://[your-username].github.io/plate-calculator/`

## 📄 License

MIT
