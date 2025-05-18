document.addEventListener('DOMContentLoaded', function() {
    const poemContainer = document.getElementById('poemContainer');
    const highlightBtn = document.getElementById('highlightBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const boldBtn = document.getElementById('boldBtn');
    const resetLayoutBtn = document.getElementById('resetLayoutBtn');
    const randomLayoutBtn = document.getElementById('randomLayoutBtn');
    const saveLayoutBtn = document.getElementById('saveLayoutBtn');
    const newPromptBtn = document.getElementById('newPromptBtn');
    const reflectionText = document.getElementById('reflectionText');
    const savedLayouts = document.getElementById('savedLayouts');
    const tooltip = document.getElementById('tooltip');
    const promptBox = document.getElementById('randomPrompt');
    
    let highlightMode = false;
    let selectedWord = null;
    let offsetX, offsetY;
    let savedLayoutCount = 0;
    
    // Define all words with their properties
    const poemWords = [
        { text: "C'ÉTAIT", className: "cetait", left: 470, top: 81, fontSize: 20, isItalic: true },
        { text: "issu stellaire", className: "titre-italique", left: 480, top: 105, fontSize: 9, isItalic: true },
        { text: "LE NOMBRE", className: "le-nombre", left: 925, top: 83, fontSize: 18, isItalic: true },
        { text: "EXISTÂT-IL", className: "existat-il", left: 910, top: 128, fontSize: 15, isItalic: false },
        { text: "autrement qu'hallucination éparse d'agonie", className: "autrement", left: 885, top: 147, fontSize: 9, isItalic: false },
        { text: "COMMENÇÂT-IL ET CESSÂT-IL", className: "commencat-il", left: 860, top: 175, fontSize: 15, isItalic: false },
        { text: "sourdant que nié et clos quand apparu", className: "soufflant", left: 848, top: 192, fontSize: 8, isItalic: false },
        { text: "enfin", className: "titre-italique", left: 905, top: 202, fontSize: 8, isItalic: false },
        { text: "par quelque profusion répandue en rareté", className: "par-quelque", left: 882, top: 212, fontSize: 8, isItalic: false },
        { text: "SE CHIFFRÂT-IL", className: "se-chiffrat-il", left: 970, top: 226, fontSize: 15, isItalic: false },
        { text: "évidence de la somme pour peu qu'une", className: "evidence", left: 890, top: 263, fontSize: 8, isItalic: true },
        { text: "ILLUMINÂT-IL", className: "illuminat-il", left: 965, top: 280, fontSize: 15, isItalic: false },
        { text: "CE SERAIT", className: "ce-serait", left: 160, top: 375, fontSize: 18, isItalic: true },
        { text: "pire", className: "pire", left: 223, top: 398, fontSize: 8, isItalic: true },
        { text: "non", className: "non", left: 275, top: 408, fontSize: 8, isItalic: true },
        { text: "davantage ni moins", className: "davantage", left: 312, top: 418, fontSize: 9, isItalic: false },
        { text: "indifféremment mais autant", className: "indifferemment", left: 430, top: 431, fontSize: 8, isItalic: false },
        { text: "LE HASARD", className: "le-hasard", left: 811, top: 401, fontSize: 42, isItalic: false ,wordspacing: 10},
        { text: "Choit", className: "choit", left: 758, top: 523, fontSize: 13, isItalic: true },
        { text: "la plume", className: "la-plume", left: 789, top: 540, fontSize: 13, isItalic: true },
        { text: "rythmique suspens du sinistre", className: "rythmique", left: 827, top: 556, fontSize: 13, isItalic: true },
        { text: "s'ensevelir", className: "ensevelir", left: 995, top: 572, fontSize: 13, isItalic: true },
        { text: "aux écumes originelles", className: "aux-ecumes", left: 925, top: 587, fontSize: 13, isItalic: true },
        { text: "naguères d'où sursauta son délire jusqu'à une cime", className: "nagueres", left: 780, top: 602, fontSize: 13, isItalic: true },
        { text: "flétrie", className: "fletrie", left: 968, top: 619, fontSize: 13, isItalic: true },
        { text: "par la neutralité identique du gouffre", className: "par-la-neutralite", left: 840, top: 633, fontSize: 13, isItalic: true }
    ];
    
    // Create line markers for horizontal alignment
    const lineHeights = [];
    poemWords.forEach(word => {
        if (!lineHeights.includes(word.top)) {
            lineHeights.push(word.top);
        }
    });
    
    lineHeights.forEach(height => {
        const lineMarker = document.createElement('div');
        lineMarker.className = 'line-marker';
        lineMarker.style.top = (height + 12) + 'px'; // Adjusted to be at text baseline
        poemContainer.appendChild(lineMarker);
    });
    
    // Create words in the poem container
    poemWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word ' + word.className;
        wordElement.textContent = word.text;
        wordElement.style.left = word.left + 'px';
        wordElement.style.top = word.top + 'px';
        wordElement.style.fontSize = word.fontSize + 'px';
        if (word.isItalic) {
            wordElement.style.fontStyle = 'italic';
        }
        
        wordElement.dataset.originalLeft = word.left + 'px';
        wordElement.dataset.originalTop = word.top + 'px';
        wordElement.dataset.originalFontSize = word.fontSize + 'px';
        wordElement.dataset.originalFontStyle = word.isItalic ? 'italic' : 'normal';
        wordElement.dataset.lineTop = word.top;
        
        poemContainer.appendChild(wordElement);
        
        // Setup drag functionality (horizontal only)
        wordElement.addEventListener('mousedown', startDrag);
        wordElement.addEventListener('click', handleWordClick);
        
        // Setup tooltip
        wordElement.addEventListener('mouseover', function(e) {
            tooltip.style.display = 'block';
            tooltip.textContent = highlightMode ? 'Click to highlight' : 'Drag horizontally to move';
            updateTooltipPosition(e);
        });
        
        wordElement.addEventListener('mouseout', function() {
            tooltip.style.display = 'none';
        });
    });
    
    function startDrag(e) {
        if (highlightMode) return;
        
        // Remove selection from previously selected word
        if (selectedWord) {
            selectedWord.classList.remove('selected');
        }
        
        selectedWord = this;
        selectedWord.classList.add('selected');
        
        const rect = selectedWord.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!selectedWord) return;
        
        const containerRect = poemContainer.getBoundingClientRect();
        let left = e.clientX - containerRect.left - offsetX;
        
        // Keep within horizontal boundaries
        left = Math.max(0, Math.min(left, containerRect.width - selectedWord.offsetWidth));
        
        // Only change horizontal position, vertical stays the same
        selectedWord.style.left = left + 'px';
    }
    
    function stopDrag() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
    
    function handleWordClick(e) {
        if (highlightMode) {
            this.classList.toggle('highlighted');
            e.preventDefault();
        }
    }
    
    function updateTooltipPosition(e) {
        tooltip.style.left = (e.pageX + 10) + 'px';
        tooltip.style.top = (e.pageY + 10) + 'px';
    }
    
    highlightBtn.addEventListener('click', function() {
        highlightMode = !highlightMode;
        this.textContent = highlightMode ? 'Exit Highlight Mode' : 'Toggle Highlight Mode';
        poemContainer.style.cursor = highlightMode ? 'pointer' : 'default';
        
        // Update tooltip text
        const allWords = poemContainer.querySelectorAll('.word');
        allWords.forEach(word => {
            word.addEventListener('mouseover', function(e) {
                tooltip.style.display = 'block';
                tooltip.textContent = highlightMode ? 'Click to highlight' : 'Drag horizontally to move';
                updateTooltipPosition(e);
            });
        });
    });
    
    increaseFontBtn.addEventListener('click', function() {
        if (selectedWord) {
            const currentSize = parseFloat(window.getComputedStyle(selectedWord).fontSize);
            selectedWord.style.fontSize = (currentSize + 2) + 'px';
        }
    });
    
    decreaseFontBtn.addEventListener('click', function() {
        if (selectedWord) {
            const currentSize = parseFloat(window.getComputedStyle(selectedWord).fontSize);
            if (currentSize > 8) {
                selectedWord.style.fontSize = (currentSize - 2) + 'px';
            }
        }
    });
    
    boldBtn.addEventListener('click', function() {
        if (selectedWord) {
            const currentWeight = window.getComputedStyle(selectedWord).fontWeight;
            selectedWord.style.fontWeight = (currentWeight === '700' || currentWeight === 'bold') ? 'normal' : 'bold';
        }
    });
    
    resetLayoutBtn.addEventListener('click', function() {
        const words = poemContainer.querySelectorAll('.word');
        words.forEach(word => {
            word.style.left = word.dataset.originalLeft;
            word.style.fontSize = word.dataset.originalFontSize;
            word.style.fontWeight = 'normal';
            word.style.fontStyle = word.dataset.originalFontStyle;
            word.classList.remove('highlighted');
        });
        
        if (selectedWord) {
            selectedWord.classList.remove('selected');
            selectedWord = null;
        }
    });
    
    randomLayoutBtn.addEventListener('click', function() {
        const words = poemContainer.querySelectorAll('.word');
        const containerWidth = poemContainer.offsetWidth;
        
        words.forEach(word => {
            // Random horizontal position (keeping on their own line)
            const wordWidth = word.offsetWidth;
            const maxLeft = containerWidth - wordWidth - 40; // 40px margin from right edge
            const randomLeft = Math.floor(Math.random() * maxLeft) + 20; // 20px margin from left edge
            
            word.style.left = randomLeft + 'px';
            
            // Random font size variation (slight)
            const originalSize = parseFloat(word.dataset.originalFontSize);
            const sizeVariation = Math.floor(Math.random() * 6) - 2; // -2 to +3px variation
            const newSize = Math.max(8, originalSize + sizeVariation);
            word.style.fontSize = newSize + 'px';
            
            // Random bold (30% chance)
            word.style.fontWeight = Math.random() < 0.3 ? 'bold' : 'normal';
            
            // Random highlight (20% chance)
            if (Math.random() < 0.2) {
                word.classList.add('highlighted');
            } else {
                word.classList.remove('highlighted');
            }
        });
    });
    
    saveLayoutBtn.addEventListener('click', function() {
        savedLayoutCount++;
        const noSavedMsg = document.getElementById('noSavedLayouts');
        if (noSavedMsg) {
            noSavedMsg.remove();
        }
        
        // Create a snapshot of the current layout
        const layoutDiv = document.createElement('div');
        layoutDiv.className = 'saved-layout';
        layoutDiv.innerHTML = `
            <strong>Layout ${savedLayoutCount}</strong>
            <p>${new Date().toLocaleString()}</p>
            <p><em>${reflectionText.value.substring(0, 100)}${reflectionText.value.length > 100 ? '...' : ''}</em></p>
            <button class="load-layout-btn" data-layout-id="${savedLayoutCount}">Load Layout</button>
            <button class="delete-layout-btn" data-layout-id="${savedLayoutCount}">Delete</button>
        `;
        
        // Save the current state
        const layoutState = {
            words: [],
            reflection: reflectionText.value
        };
        
        const words = poemContainer.querySelectorAll('.word');
        words.forEach(word => {
            layoutState.words.push({
                text: word.textContent,
                className: word.className.replace('word ', '').replace(' highlighted', '').replace(' selected', ''),
                left: word.style.left,
                top: word.style.top || word.dataset.originalTop,
                fontSize: word.style.fontSize || word.dataset.originalFontSize,
                fontWeight: word.style.fontWeight || 'normal',
                fontStyle: word.style.fontStyle || word.dataset.originalFontStyle,
                highlighted: word.classList.contains('highlighted'),
                originalLeft: word.dataset.originalLeft,
                originalTop: word.dataset.originalTop,
                originalFontSize: word.dataset.originalFontSize,
                originalFontStyle: word.dataset.originalFontStyle,
                lineTop: word.dataset.lineTop
            });
        });
        
        layoutDiv.dataset.state = JSON.stringify(layoutState);
        savedLayouts.appendChild(layoutDiv);
        
        // Add event listeners to the buttons
        layoutDiv.querySelector('.load-layout-btn').addEventListener('click', function() {
            loadLayout(JSON.parse(layoutDiv.dataset.state));
        });
        
        layoutDiv.querySelector('.delete-layout-btn').addEventListener('click', function() {
            layoutDiv.remove();
            if (savedLayouts.querySelectorAll('.saved-layout').length === 0) {
                savedLayouts.innerHTML = '<div id="noSavedLayouts">No layouts saved yet.</div>';
            }
        });
    });
    
    function loadLayout(state) {
        // Clear current layout
        const currentWords = poemContainer.querySelectorAll('.word');
        currentWords.forEach(word => {
            word.remove();
        });
        
        // Recreate the saved layout
        state.words.forEach(wordData => {
            const word = document.createElement('div');
            word.className = 'word ' + wordData.className;
            word.textContent = wordData.text;
            word.style.left = wordData.left;
            word.style.top = wordData.top;
            word.style.fontSize = wordData.fontSize;
            word.style.fontWeight = wordData.fontWeight;
            word.style.fontStyle = wordData.fontStyle;
            
            if (wordData.highlighted) {
                word.classList.add('highlighted');
            }
            
            word.dataset.originalLeft = wordData.originalLeft;
            word.dataset.originalTop = wordData.originalTop;
            word.dataset.originalFontSize = wordData.originalFontSize;
            word.dataset.originalFontStyle = wordData.originalFontStyle;
            word.dataset.lineTop = wordData.lineTop;
            
            word.addEventListener('mousedown', startDrag);
            word.addEventListener('click', handleWordClick);
            
            word.addEventListener('mouseover', function(e) {
                tooltip.style.display = 'block';
                tooltip.textContent = highlightMode ? 'Click to highlight' : 'Drag horizontally to move';
                updateTooltipPosition(e);
            });
            
            word.addEventListener('mouseout', function() {
                tooltip.style.display = 'none';
            });
            
            poemContainer.appendChild(word);
        });
        
        reflectionText.value = state.reflection;
    }
    
    // Random prompts functionality
    const prompts = [
        "Move words horizontally to reflect the theme of chance.",
        "Highlight all words that evoke nothingness or absence.",
        "Create a pattern of highlighted words that form a visual constellation.",
        "Arrange the text horizontally to visually represent the fall of dice.",
        "Emphasize words related to numbers and mathematics through highlighting and font size.",
        "Create a layout that expresses the tension between order and chaos through spacing.",
        "Highlight words to create a visual pattern of light and shadow in the poem.",
        "Position text to create balanced negative space on both sides.",
        "Highlight the contrast between certainty and doubt in the poem.",
        "Create rhythmic patterns through strategic horizontal positioning."
    ];
    
    newPromptBtn.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        promptBox.textContent = prompts[randomIndex];
        promptBox.style.backgroundColor = '#ffffcc';
        setTimeout(() => {
            promptBox.style.backgroundColor = '#f0f0f0';
        }, 1000);
    });
    
    // Initialize with a random prompt
    promptBox.textContent = prompts[Math.floor(Math.random() * prompts.length)];
});