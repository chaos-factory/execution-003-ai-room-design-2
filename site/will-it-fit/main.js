// Demo widget functionality
class DoorwayFitChecker {
  constructor() {
    this.init();
  }

  init() {
    // Tab switching
    const tabs = document.querySelectorAll('.demo-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });

    // Check fit button
    const checkFitBtn = document.getElementById('check-fit');
    if (checkFitBtn) {
      checkFitBtn.addEventListener('click', () => this.checkFit());
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => this.toggleFaq(question));
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleFaq(question);
        }
      });
    });

    // Header sticky behavior
    this.initStickyHeader();

    // Hamburger menu
    this.initHamburgerMenu();

    // AR launch button (mobile)
    const launchArBtn = document.getElementById('launch-ar');
    if (launchArBtn) {
      launchArBtn.addEventListener('click', () => this.launchAR());
    }
  }

  switchTab(clickedTab) {
    const tabName = clickedTab.getAttribute('data-tab');
    
    // Update tab buttons
    document.querySelectorAll('.demo-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    clickedTab.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.demo-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  checkFit() {
    // Get doorway dimensions
    const doorWidth = parseFloat(document.getElementById('door-width').value);
    const doorHeight = parseFloat(document.getElementById('door-height').value);
    const hingeSide = document.getElementById('hinge-side').value;
    const swing = document.getElementById('swing').value;
    const cornerClearance = parseFloat(document.getElementById('corner-clearance').value) || 0;

    // Get item dimensions
    const itemLength = parseFloat(document.getElementById('item-length').value);
    const itemWidth = parseFloat(document.getElementById('item-width').value);
    const itemHeight = parseFloat(document.getElementById('item-height').value);
    const allowTilt = document.getElementById('allow-tilt').checked;
    const unit = document.getElementById('unit').value;

    // Validate inputs
    if (!doorWidth || !doorHeight || !itemLength || !itemWidth || !itemHeight) {
      alert('Please fill in all required dimensions');
      return;
    }

    // Calculate fit
    const result = this.calculateFit(
      doorWidth,
      doorHeight,
      cornerClearance,
      hingeSide,
      swing,
      itemLength,
      itemWidth,
      itemHeight,
      allowTilt,
      unit
    );

    // Display result
    this.displayResult(result);
  }

  calculateFit(doorW, doorH, cornerClearance, hingeSide, swing, itemL, itemW, itemH, allowTilt, unit) {
    // Adjust usable doorway width for corner clearance
    const usableWidth = doorW - cornerClearance;
    const usableHeight = doorH;

    // Item dimensions array for checking orientations
    const dims = [
      [itemL, itemW, itemH],
      [itemL, itemH, itemW],
      [itemW, itemL, itemH],
      [itemW, itemH, itemL],
      [itemH, itemL, itemW],
      [itemH, itemW, itemL]
    ];

    // Check orthogonal orientations (without tilt)
    let orthogonalFit = false;
    let bestOrthogonalFit = null;
    let smallestMargin = Infinity;

    for (const [d1, d2, d3] of dims) {
      // Check if d2 (width) and d3 (height) fit through doorway
      const widthMargin = usableWidth - d2;
      const heightMargin = usableHeight - d3;
      
      if (widthMargin >= 0 && heightMargin >= 0) {
        orthogonalFit = true;
        const totalMargin = widthMargin + heightMargin;
        if (totalMargin < smallestMargin) {
          smallestMargin = totalMargin;
          bestOrthogonalFit = { d1, d2, d3, widthMargin, heightMargin };
        }
      }
    }

    if (orthogonalFit && bestOrthogonalFit) {
      // Determine if it's a tight fit
      const isTight = bestOrthogonalFit.widthMargin < 2 || bestOrthogonalFit.heightMargin < 2;
      
      return {
        status: isTight ? 'tight' : 'pass',
        method: 'standard',
        dimensions: bestOrthogonalFit,
        recommendation: this.getRecommendation('standard', hingeSide, swing, bestOrthogonalFit, unit, isTight),
        doorway: { width: doorW, height: doorH, cornerClearance, usableWidth },
        item: { length: itemL, width: itemW, height: itemH },
        unit
      };
    }

    // Try diagonal tilt if allowed
    if (allowTilt) {
      for (const [d1, d2, d3] of dims) {
        // Calculate diagonal of two smaller dimensions
        const diagonal = Math.sqrt(d2 * d2 + d3 * d3);
        const diagonalMargin = Math.min(usableWidth, usableHeight) - diagonal;
        
        if (diagonalMargin >= -2) { // Allow 2 units tolerance
          const isTight = diagonalMargin < 2 && diagonalMargin >= 0;
          const angle = Math.round(Math.atan(d3 / d2) * 180 / Math.PI);
          
          return {
            status: isTight ? 'tight' : (diagonalMargin < 0 ? 'no-go' : 'pass'),
            method: 'tilt',
            angle: angle,
            dimensions: { d1, d2, d3, diagonal, margin: diagonalMargin },
            recommendation: this.getRecommendation('tilt', hingeSide, swing, { angle, diagonal, margin: diagonalMargin }, unit, isTight || diagonalMargin < 0),
            doorway: { width: doorW, height: doorH, cornerClearance, usableWidth },
            item: { length: itemL, width: itemW, height: itemH },
            unit
          };
        }
      }
    }

    // Calculate how much it doesn't fit
    const shortfall = Math.min(
      ...dims.map(([d1, d2, d3]) => {
        const wDiff = d2 - usableWidth;
        const hDiff = d3 - usableHeight;
        if (wDiff > 0 && hDiff > 0) return Math.min(wDiff, hDiff);
        if (wDiff > 0) return wDiff;
        if (hDiff > 0) return hDiff;
        return Infinity;
      })
    ).toFixed(1);

    return {
      status: 'no-go',
      method: 'none',
      shortfall: shortfall !== 'Infinity' ? shortfall : 'N/A',
      recommendation: this.getRecommendation('no-go', hingeSide, swing, { shortfall }, unit, true),
      doorway: { width: doorW, height: doorH, cornerClearance, usableWidth },
      item: { length: itemL, width: itemW, height: itemH },
      unit
    };
  }

  getRecommendation(method, hingeSide, swing, data, unit, isTight) {
    const unitLabel = unit === 'in' ? 'inches' : unit === 'cm' ? 'centimeters' : unit === 'ft' ? 'feet' : 'millimeters';
    
    if (method === 'standard') {
      if (isTight) {
        return `Tight fit. Proceed carefully through the ${hingeSide} hinge. Consider removing the door for an extra 2-3 ${unit} of clearance at the hinge point.`;
      }
      return `Pass: Navigate straight through the ${hingeSide} hinge, ${swing}ward swing. You have adequate clearance.`;
    }
    
    if (method === 'tilt') {
      const { angle, margin } = data;
      if (margin < 0) {
        return `Very tight: Tilt approximately ${angle}° and rotate through the ${hingeSide} hinge. This is marginal—consider removing the door or checking packaging dimensions.`;
      }
      if (margin < 2) {
        return `Tight fit: Tilt approximately ${angle}° and rotate 45° through the ${hingeSide} hinge, ${swing}ward swing. Remove door for extra clearance if needed.`;
      }
      return `Pass: Tilt ${angle}° and rotate 45° through the ${hingeSide} hinge. This approach provides adequate clearance.`;
    }
    
    if (method === 'no-go') {
      const { shortfall } = data;
      if (shortfall !== 'N/A') {
        return `No-go: Doorway too narrow by approximately ${shortfall} ${unit}. Consider removing feet/packaging, partial disassembly, or removing the door frame trim for extra space.`;
      }
      return `No-go: Item dimensions exceed doorway capacity significantly. Consider alternative delivery path, partial disassembly, or different entry point.`;
    }
    
    return 'Unable to determine fit. Please check your measurements.';
  }

  displayResult(result) {
    const resultContainer = document.getElementById('demo-result');
    
    const statusClass = result.status === 'pass' ? 'pass' : result.status === 'tight' ? 'tight' : 'no-go';
    const statusLabel = result.status === 'pass' ? 'Pass' : result.status === 'tight' ? 'Tight Fit' : 'No-Go';
    const statusIcon = result.status === 'pass' ? '✓' : result.status === 'tight' ? '⚠' : '✕';
    
    resultContainer.innerHTML = `
      <div class="result-card ${statusClass}">
        <div class="result-header">
          <div class="result-icon">${statusIcon}</div>
          <div class="result-status">${statusLabel}</div>
        </div>
        <div class="result-body">
          <h4>Recommendation</h4>
          <p>${result.recommendation}</p>
          
          <div class="result-dimensions">
            <div class="dimension-row">
              <span class="dimension-label">Doorway:</span>
              <span class="dimension-value">${result.doorway.width} × ${result.doorway.height} ${result.unit}</span>
            </div>
            ${result.doorway.cornerClearance > 0 ? `
            <div class="dimension-row">
              <span class="dimension-label">Corner clearance:</span>
              <span class="dimension-value">${result.doorway.cornerClearance} ${result.unit}</span>
            </div>
            <div class="dimension-row">
              <span class="dimension-label">Usable width:</span>
              <span class="dimension-value">${result.doorway.usableWidth.toFixed(1)} ${result.unit}</span>
            </div>
            ` : ''}
            <div class="dimension-row">
              <span class="dimension-label">Item:</span>
              <span class="dimension-value">${result.item.length} × ${result.item.width} × ${result.item.height} ${result.unit}</span>
            </div>
            ${result.method === 'tilt' && result.angle ? `
            <div class="dimension-row">
              <span class="dimension-label">Tilt angle:</span>
              <span class="dimension-value">${result.angle}°</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  toggleFaq(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const answerId = button.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);
    
    // Close all other FAQs
    document.querySelectorAll('.faq-question').forEach(q => {
      if (q !== button) {
        q.setAttribute('aria-expanded', 'false');
        const aid = q.getAttribute('aria-controls');
        const a = document.getElementById(aid);
        if (a) a.style.maxHeight = '0';
      }
    });
    
    // Toggle current FAQ
    if (isExpanded) {
      button.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';
    } else {
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }

  initStickyHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    });
  }

  initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    
    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('mobile-open');
      });
    }
  }

  launchAR() {
    const length = document.getElementById('ar-length').value;
    const width = document.getElementById('ar-width').value;
    const height = document.getElementById('ar-height').value;
    const unit = document.getElementById('ar-unit').value;
    
    if (!length || !width || !height) {
      alert('Please enter all dimensions');
      return;
    }
    
    // In a real implementation, this would generate and open a USDZ/GLB file
    // For now, show a placeholder message
    alert(`AR Preview would open with dimensions: ${length} × ${width} × ${height} ${unit}\n\nThis is a placeholder. In production, this would launch your device's AR viewer with a 3D model at the specified dimensions.`);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DoorwayFitChecker();
  });
} else {
  new DoorwayFitChecker();
}

// Handle smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});
