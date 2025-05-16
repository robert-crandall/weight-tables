document.addEventListener('DOMContentLoaded', () => {
  // Default plate colors
  const defaultPlateColors = {
    '45': '#0066cc', // Blue
    '35': '#ffcc00', // Yellow
    '25': '#00cc66', // Green
    '10': '#999999', // Gray
    '5': '#333333',  // Black
    '2.5': '#cccccc' // Light Gray
  };

  // Store current plate colors
  let currentPlateColors = {...defaultPlateColors};
  
  // Get DOM elements
  const calculateBtn = document.getElementById('calculateBtn');
  const printBtn = document.getElementById('printBtn');
  const plateColorsContainer = document.getElementById('plateColors');
  const colorToggle = document.getElementById('colorToggle');
  const plateTableContainer = document.getElementById('plateTable');
  const noResultsMsg = document.getElementById('noResults');
  
  // Initialize color pickers
  initializePlateColors();
  
  // Add event listeners
  calculateBtn.addEventListener('click', calculatePlates);
  printBtn.addEventListener('click', printResults);
  colorToggle.addEventListener('change', toggleBWMode);
  
  /**
   * Initialize plate color pickers
   */
  function initializePlateColors() {
    plateColorsContainer.innerHTML = '';
    
    Object.entries(defaultPlateColors).forEach(([weight, color]) => {
      const colorInputGroup = document.createElement('div');
      colorInputGroup.className = 'color-input-group';
      
      const colorPreview = document.createElement('div');
      colorPreview.className = 'color-preview';
      colorPreview.style.backgroundColor = color;
      
      const weightLabel = document.createElement('span');
      weightLabel.textContent = `${weight} lbs`;
      weightLabel.className = 'text-sm font-medium';
      
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.value = color;
      colorPicker.className = 'w-10 h-10 cursor-pointer';
      colorPicker.dataset.weight = weight;
      
      colorPicker.addEventListener('input', (e) => {
        const selectedColor = e.target.value;
        const plateWeight = e.target.dataset.weight;
        colorPreview.style.backgroundColor = selectedColor;
        
        // Update current colors
        currentPlateColors[plateWeight] = selectedColor;
        
        // Update CSS variables
        document.documentElement.style.setProperty(`--plate-${plateWeight.replace('.', '-')}`, selectedColor);
        
        // Recalculate if results are already shown
        if (plateTableContainer.querySelector('table')) {
          calculatePlates();
        }
      });
      
      colorInputGroup.appendChild(colorPreview);
      colorInputGroup.appendChild(weightLabel);
      colorInputGroup.appendChild(colorPicker);
      plateColorsContainer.appendChild(colorInputGroup);
    });
  }
  
  /**
   * Parse available plates from input string
   * Format: weight×quantity, e.g., 45x2, 25, 10x2, 5, 2.5
   */
  function parseAvailablePlates(platesStr) {
    const plates = [];
    
    // Split by comma and trim whitespace
    const plateParts = platesStr.split(',').map(p => p.trim());
    
    plateParts.forEach(part => {
      if (!part) return;
      
      if (part.includes('x')) {
        // Format: weight×quantity
        const [weightStr, quantityStr] = part.split('x').map(p => p.trim());
        const weight = parseFloat(weightStr);
        const quantity = parseInt(quantityStr);
        
        if (!isNaN(weight) && !isNaN(quantity)) {
          for (let i = 0; i < quantity; i++) {
            plates.push(weight);
          }
        }
      } else {
        // Format: just weight (quantity = 1)
        const weight = parseFloat(part);
        if (!isNaN(weight)) {
          plates.push(weight);
        }
      }
    });
    
    // Sort plates in descending order
    return plates.sort((a, b) => b - a);
  }
  
  /**
   * Calculate plate combinations for a specific target weight
   */
  function calculatePlateCombo(targetWeight, barbellWeight, availablePlates) {
    // Calculate weight needed on each side
    const weightPerSide = (targetWeight - barbellWeight) / 2;
    
    if (weightPerSide < 0) {
      return { possible: false, plateCombo: [], message: 'Target weight less than barbell' };
    }
    
    if (weightPerSide === 0) {
      return { possible: true, plateCombo: [], message: 'Empty bar' };
    }
    
    // Make a copy of available plates to track usage
    const remainingPlates = [...availablePlates];
    const plateCombo = [];
    let currentWeight = 0;
    
    // Greedy algorithm - take largest plates first that don't exceed target
    for (let i = 0; i < remainingPlates.length; i++) {
      const plate = remainingPlates[i];
      
      if (currentWeight + plate <= weightPerSide) {
        plateCombo.push(plate);
        currentWeight += plate;
        remainingPlates.splice(i, 1);
        i--; // Adjust index after removing an element
      }
    }
    
    // Check if we hit the target exactly
    if (currentWeight === weightPerSide) {
      return { possible: true, plateCombo };
    } else {
      return { 
        possible: false, 
        plateCombo, 
        message: `Can't make exact weight (closest: ${barbellWeight + currentWeight * 2})` 
      };
    }
  }
  
  /**
   * Find all base weights by identifying weights that use only the two largest plates
   */
  function findBaseWeights(startingWeight, endingWeight, barbellWeight, availablePlates) {
    // Get the two largest unique plates
    const uniquePlates = [...new Set(availablePlates)].sort((a, b) => b - a);
    const largePlates = uniquePlates.slice(0, 2);
    
    if (largePlates.length === 0) {
      return [barbellWeight];
    }
    
    const baseWeights = new Set([barbellWeight]);
    
    // Generate all possible combinations of just using these large plates
    for (let i = startingWeight; i <= endingWeight; i += 5) {
      const weightPerSide = (i - barbellWeight) / 2;
      
      if (weightPerSide <= 0) {
        baseWeights.add(i);
        continue;
      }
      
      // Check if this weight can be achieved using only large plates
      let canBeAchieved = true;
      let remainingWeight = weightPerSide;
      
      // Try to form the weight using only the large plates
      for (const plate of largePlates) {
        while (remainingWeight >= plate) {
          remainingWeight -= plate;
        }
      }
      
      // If we used up all the weight exactly, it's a base weight
      if (remainingWeight === 0) {
        baseWeights.add(i);
      }
    }
    
    return Array.from(baseWeights).sort((a, b) => a - b);
  }
  
  /**
   * Generate micro increments for column headers
   */
  function generateMicroIncrements() {
    // Standard micro increments (in lbs)
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  }
  
  /**
   * Create visualization of plates (one side only)
   */
  function createPlateVisualization(plateCombo, bwMode = false) {
    const container = document.createElement('div');
    container.className = 'bar-visualization' + (bwMode ? ' bw-mode' : '');
    
    // Create plates from inside out (reverse the plateCombo)
    const reversedPlates = [...plateCombo].reverse();
    
    // Just one side plates (reversed order to show largest plates on the outside)
    reversedPlates.forEach(weight => {
      const plateContainer = document.createElement('div');
      plateContainer.className = 'plate-container';
      
      const plate = document.createElement('div');
      plate.className = `plate plate-${weight.toString().replace('.', '-')}`;
      
      // Add weight text to the plate
      const weightText = document.createElement('span');
      weightText.className = 'plate-weight-text';
      weightText.textContent = weight;
      
      plateContainer.appendChild(plate);
      plateContainer.appendChild(weightText);
      container.appendChild(plateContainer);
    });
    
    return container;
  }
  
  /**
   * Main calculation function
   */
  function calculatePlates() {
    // Get input values
    const barbellWeight = parseFloat(document.getElementById('barbellWeight').value) || 45;
    const availablePlatesStr = document.getElementById('availablePlates').value || '45x2, 25, 10x2, 5, 2.5';
    const startingWeight = parseFloat(document.getElementById('startingWeight').value) || barbellWeight;
    const endingWeight = parseFloat(document.getElementById('endingWeight').value) || 305;
    const bwMode = document.getElementById('colorToggle').checked;
    
    // Parse available plates
    const availablePlates = parseAvailablePlates(availablePlatesStr);
    
    // Get base weights and micro increments
    const baseWeights = findBaseWeights(startingWeight, endingWeight, barbellWeight, availablePlates);
    const microIncrements = generateMicroIncrements();
    
    // Create table
    const table = document.createElement('table');
    table.className = 'min-w-full border-collapse';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.className = 'border px-4 py-2 bg-gray-200';
    cornerCell.textContent = 'Base / Add';
    headerRow.appendChild(cornerCell);
    
    // Add micro increment headers
    microIncrements.forEach(increment => {
      const th = document.createElement('th');
      th.className = 'border px-4 py-2 bg-gray-200';
      th.textContent = `+${increment} lbs`;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    baseWeights.forEach(baseWeight => {
      if (baseWeight < startingWeight || baseWeight > endingWeight) return;
      
      const row = document.createElement('tr');
      
      // First cell is the base weight
      const baseCell = document.createElement('td');
      baseCell.className = 'border px-4 py-2 bg-gray-100 font-bold';
      baseCell.textContent = `${baseWeight} lbs`;
      row.appendChild(baseCell);
      
      // Generate cells for each micro increment
      microIncrements.forEach(increment => {
        const targetWeight = baseWeight + increment;
        
        // Skip if outside of weight range
        if (targetWeight < startingWeight || targetWeight > endingWeight) {
          const blankCell = document.createElement('td');
          blankCell.className = 'border px-2 py-1';
          row.appendChild(blankCell);
          return;
        }
        
        const result = calculatePlateCombo(targetWeight, barbellWeight, availablePlates);
        
        const cell = document.createElement('td');
        cell.className = 'border px-2 py-2 weight-cell text-center';
        
        if (result.possible) {
          // Create weight display
          const weightDisplay = document.createElement('div');
          weightDisplay.className = 'total-weight';
          weightDisplay.textContent = `${targetWeight}`;
          cell.appendChild(weightDisplay);
          
          // Create plate breakdown text
          if (result.plateCombo.length > 0) {
            const breakdownText = document.createElement('div');
            breakdownText.className = 'plate-breakdown';
            breakdownText.textContent = result.plateCombo.join(' + ');
            // cell.appendChild(breakdownText); // Uncomment to show breakdown text
            
            // Create plate visualization
            const visualization = createPlateVisualization(result.plateCombo, bwMode);
            cell.appendChild(visualization);
          } else {
            const emptyBar = document.createElement('div');
            emptyBar.className = 'plate-breakdown';
            emptyBar.textContent = 'Empty bar';
            cell.appendChild(emptyBar);
          }
        } else {
          cell.classList.add('bg-gray-50', 'text-gray-400');
          cell.textContent = '-';
        }
        
        row.appendChild(cell);
      });
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    
    // Update DOM
    plateTableContainer.innerHTML = '';
    plateTableContainer.appendChild(table);
    noResultsMsg.style.display = 'none';
  }

  /**
   * Toggle black and white mode
   */
  function toggleBWMode() {
    const bwMode = document.getElementById('colorToggle').checked;
    const visualizations = document.querySelectorAll('.bar-visualization');
    
    visualizations.forEach(vis => {
      if (bwMode) {
        vis.classList.add('bw-mode');
      } else {
        vis.classList.remove('bw-mode');
      }
    });
  }
  
  /**
   * Print results
   */
  function printResults() {
    if (!plateTableContainer.querySelector('table')) {
      alert('Please calculate plate combinations first.');
      return;
    }
    
    window.print();
  }
});
