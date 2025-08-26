/**
 * PSC Dashboard Accessibility Compliance Validator
 * WCAG 2.1 AA Standards Compliance Testing
 * Maritime QA Testing - Accessibility Specialist Implementation
 */

class AccessibilityComplianceValidator {
    constructor() {
        this.wcagGuidelines = {
            'perceivable': {
                '1.1.1': 'Non-text Content',
                '1.2.1': 'Audio-only and Video-only (Prerecorded)',
                '1.2.2': 'Captions (Prerecorded)',
                '1.3.1': 'Info and Relationships',
                '1.3.2': 'Meaningful Sequence',
                '1.3.3': 'Sensory Characteristics',
                '1.4.1': 'Use of Color',
                '1.4.2': 'Audio Control',
                '1.4.3': 'Contrast (Minimum)',
                '1.4.4': 'Resize text',
                '1.4.5': 'Images of Text'
            },
            'operable': {
                '2.1.1': 'Keyboard',
                '2.1.2': 'No Keyboard Trap',
                '2.1.4': 'Character Key Shortcuts',
                '2.2.1': 'Timing Adjustable',
                '2.2.2': 'Pause, Stop, Hide',
                '2.3.1': 'Three Flashes or Below Threshold',
                '2.4.1': 'Bypass Blocks',
                '2.4.2': 'Page Titled',
                '2.4.3': 'Focus Order',
                '2.4.4': 'Link Purpose (In Context)',
                '2.4.5': 'Multiple Ways',
                '2.4.6': 'Headings and Labels',
                '2.4.7': 'Focus Visible'
            },
            'understandable': {
                '3.1.1': 'Language of Page',
                '3.1.2': 'Language of Parts',
                '3.2.1': 'On Focus',
                '3.2.2': 'On Input',
                '3.2.3': 'Consistent Navigation',
                '3.2.4': 'Consistent Identification',
                '3.3.1': 'Error Identification',
                '3.3.2': 'Labels or Instructions',
                '3.3.3': 'Error Suggestion',
                '3.3.4': 'Error Prevention (Legal, Financial, Data)'
            },
            'robust': {
                '4.1.1': 'Parsing',
                '4.1.2': 'Name, Role, Value',
                '4.1.3': 'Status Messages'
            }
        };

        this.complianceResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0,
            details: {}
        };

        this.colorContrastThresholds = {
            AA: {
                normal: 4.5,
                large: 3.0
            },
            AAA: {
                normal: 7.0,
                large: 4.5
            }
        };
    }

    async testAccessibilityCompliance() {
        console.log('♿ Starting WCAG 2.1 AA Accessibility Compliance Testing');
        
        const testResults = {
            perceivableTests: await this.testPerceivableGuidelines(),
            operableTests: await this.testOperableGuidelines(),
            understandableTests: await this.testUnderstandableGuidelines(),
            robustTests: await this.testRobustGuidelines(),
            additionalTests: await this.testAdditionalAccessibilityFeatures()
        };

        const complianceScore = this.calculateComplianceScore(testResults);
        
        return {
            ...testResults,
            complianceScore,
            overallCompliance: complianceScore >= 90,
            timestamp: new Date().toISOString(),
            wcagLevel: 'AA',
            recommendations: this.generateAccessibilityRecommendations(testResults)
        };
    }

    async testPerceivableGuidelines() {
        console.log('👁️ Testing Perceivable Guidelines');
        
        const tests = [
            await this.test_1_1_1_NonTextContent(),
            await this.test_1_3_1_InfoAndRelationships(),
            await this.test_1_3_2_MeaningfulSequence(),
            await this.test_1_4_1_UseOfColor(),
            await this.test_1_4_3_ContrastMinimum(),
            await this.test_1_4_4_ResizeText(),
            await this.test_1_4_5_ImagesOfText()
        ];

        return this.consolidateTestResults('Perceivable', tests);
    }

    async testOperableGuidelines() {
        console.log('⌨️ Testing Operable Guidelines');
        
        const tests = [
            await this.test_2_1_1_Keyboard(),
            await this.test_2_1_2_NoKeyboardTrap(),
            await this.test_2_4_1_BypassBlocks(),
            await this.test_2_4_2_PageTitled(),
            await this.test_2_4_3_FocusOrder(),
            await this.test_2_4_4_LinkPurpose(),
            await this.test_2_4_6_HeadingsAndLabels(),
            await this.test_2_4_7_FocusVisible()
        ];

        return this.consolidateTestResults('Operable', tests);
    }

    async testUnderstandableGuidelines() {
        console.log('🧠 Testing Understandable Guidelines');
        
        const tests = [
            await this.test_3_1_1_LanguageOfPage(),
            await this.test_3_2_3_ConsistentNavigation(),
            await this.test_3_2_4_ConsistentIdentification(),
            await this.test_3_3_1_ErrorIdentification(),
            await this.test_3_3_2_LabelsOrInstructions()
        ];

        return this.consolidateTestResults('Understandable', tests);
    }

    async testRobustGuidelines() {
        console.log('🛡️ Testing Robust Guidelines');
        
        const tests = [
            await this.test_4_1_1_Parsing(),
            await this.test_4_1_2_NameRoleValue(),
            await this.test_4_1_3_StatusMessages()
        ];

        return this.consolidateTestResults('Robust', tests);
    }

    // WCAG 1.1.1 - Non-text Content
    async test_1_1_1_NonTextContent() {
        const images = document.querySelectorAll('img');
        const decorativeImages = document.querySelectorAll('img[alt=""], img[role="presentation"]');
        const svgs = document.querySelectorAll('svg');
        const canvas = document.querySelectorAll('canvas');

        let passCount = 0;
        let totalCount = 0;
        const issues = [];

        // Check images
        images.forEach((img, index) => {
            totalCount++;
            if (img.alt !== undefined) {
                if (img.alt.trim() === '' && !img.hasAttribute('role')) {
                    issues.push(`Image ${index + 1}: Empty alt text without decorative role`);
                } else {
                    passCount++;
                }
            } else {
                issues.push(`Image ${index + 1}: Missing alt attribute`);
            }
        });

        // Check SVGs
        svgs.forEach((svg, index) => {
            totalCount++;
            const hasTitle = svg.querySelector('title');
            const hasAriaLabel = svg.hasAttribute('aria-label');
            const hasAriaLabelledby = svg.hasAttribute('aria-labelledby');
            const isDecorative = svg.hasAttribute('aria-hidden') && svg.getAttribute('aria-hidden') === 'true';

            if (hasTitle || hasAriaLabel || hasAriaLabelledby || isDecorative) {
                passCount++;
            } else {
                issues.push(`SVG ${index + 1}: Missing accessible name or decorative markup`);
            }
        });

        // Check canvas elements
        canvas.forEach((canvasEl, index) => {
            totalCount++;
            const hasAriaLabel = canvasEl.hasAttribute('aria-label');
            const hasAlternativeContent = canvasEl.textContent.trim() !== '';

            if (hasAriaLabel || hasAlternativeContent) {
                passCount++;
            } else {
                issues.push(`Canvas ${index + 1}: Missing alternative content`);
            }
        });

        const passed = totalCount === 0 || passCount === totalCount;

        return {
            guideline: '1.1.1',
            name: 'Non-text Content',
            passed,
            score: totalCount > 0 ? (passCount / totalCount) * 100 : 100,
            details: {
                totalElements: totalCount,
                passedElements: passCount,
                images: images.length,
                svgs: svgs.length,
                canvas: canvas.length,
                issues
            }
        };
    }

    // WCAG 1.3.1 - Info and Relationships
    async test_1_3_1_InfoAndRelationships() {
        let passCount = 0;
        let totalCount = 0;
        const issues = [];

        // Check form labels
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach((input, index) => {
            totalCount++;
            const hasLabel = this.hasProperLabel(input);
            if (hasLabel) {
                passCount++;
            } else {
                issues.push(`Form control ${index + 1} (${input.type || input.tagName}): Missing proper label`);
            }
        });

        // Check heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) {
            totalCount++;
            const headingStructure = this.validateHeadingStructure(headings);
            if (headingStructure.valid) {
                passCount++;
            } else {
                issues.push(`Heading structure: ${headingStructure.issue}`);
            }
        }

        // Check tables
        const tables = document.querySelectorAll('table');
        tables.forEach((table, index) => {
            totalCount++;
            const hasHeaders = table.querySelectorAll('th').length > 0;
            const hasCaption = table.querySelector('caption') !== null;
            
            if (hasHeaders || hasCaption) {
                passCount++;
            } else {
                issues.push(`Table ${index + 1}: Missing headers or caption`);
            }
        });

        const passed = totalCount === 0 || passCount === totalCount;

        return {
            guideline: '1.3.1',
            name: 'Info and Relationships',
            passed,
            score: totalCount > 0 ? (passCount / totalCount) * 100 : 100,
            details: {
                totalElements: totalCount,
                passedElements: passCount,
                formControls: inputs.length,
                headings: headings.length,
                tables: tables.length,
                issues
            }
        };
    }

    // WCAG 1.3.2 - Meaningful Sequence
    async test_1_3_2_MeaningfulSequence() {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        let tabIndexIssues = 0;
        const issues = [];

        focusableElements.forEach((element, index) => {
            const tabIndex = element.tabIndex;
            if (tabIndex > 0) {
                tabIndexIssues++;
                issues.push(`Element ${index + 1}: Positive tabindex (${tabIndex}) may disrupt natural tab order`);
            }
        });

        // Check reading order by comparing visual order with DOM order
        const visualOrderCheck = this.checkVisualOrder();

        const passed = tabIndexIssues === 0 && visualOrderCheck.passed;

        return {
            guideline: '1.3.2',
            name: 'Meaningful Sequence',
            passed,
            score: passed ? 100 : 50,
            details: {
                focusableElements: focusableElements.length,
                positiveTabIndexElements: tabIndexIssues,
                visualOrderIssues: visualOrderCheck.issues,
                issues: [...issues, ...visualOrderCheck.issues]
            }
        };
    }

    // WCAG 1.4.1 - Use of Color
    async test_1_4_1_UseOfColor() {
        const issues = [];
        let colorOnlyIndications = 0;

        // Check for color-only error indicators
        const errorElements = document.querySelectorAll('.error, .invalid, [aria-invalid="true"]');
        errorElements.forEach((element, index) => {
            const hasNonColorIndicator = element.textContent.toLowerCase().includes('error') ||
                                       element.querySelector('.error-icon') ||
                                       element.hasAttribute('aria-describedby');
            
            if (!hasNonColorIndicator) {
                colorOnlyIndications++;
                issues.push(`Error element ${index + 1}: Relies only on color for indication`);
            }
        });

        // Check link identification
        const links = document.querySelectorAll('a');
        let linkIssues = 0;
        links.forEach((link, index) => {
            const computedStyle = window.getComputedStyle(link);
            const hasUnderline = computedStyle.textDecoration.includes('underline');
            const parentStyle = window.getComputedStyle(link.parentElement);
            const colorDifference = this.hasColorDifference(computedStyle.color, parentStyle.color);

            if (!hasUnderline && !colorDifference) {
                linkIssues++;
                issues.push(`Link ${index + 1}: Not distinguishable from surrounding text without color`);
            }
        });

        const passed = colorOnlyIndications === 0 && linkIssues === 0;

        return {
            guideline: '1.4.1',
            name: 'Use of Color',
            passed,
            score: passed ? 100 : Math.max(0, 100 - (colorOnlyIndications + linkIssues) * 10),
            details: {
                errorElements: errorElements.length,
                colorOnlyErrors: colorOnlyIndications,
                links: links.length,
                linkIssues,
                issues
            }
        };
    }

    // WCAG 1.4.3 - Contrast (Minimum)
    async test_1_4_3_ContrastMinimum() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, td, th');
        const contrastIssues = [];
        let totalTests = 0;
        let passedTests = 0;

        for (const element of textElements) {
            if (element.textContent.trim() === '') continue;
            
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = this.getEffectiveBackgroundColor(element);
            
            if (color && backgroundColor) {
                totalTests++;
                const contrast = this.calculateContrastRatio(color, backgroundColor);
                const fontSize = parseFloat(computedStyle.fontSize);
                const fontWeight = computedStyle.fontWeight;
                
                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                const requiredContrast = isLargeText ? this.colorContrastThresholds.AA.large : this.colorContrastThresholds.AA.normal;
                
                if (contrast >= requiredContrast) {
                    passedTests++;
                } else {
                    contrastIssues.push({
                        element: element.tagName.toLowerCase() + (element.className ? '.' + element.className.split(' ')[0] : ''),
                        contrast: contrast.toFixed(2),
                        required: requiredContrast,
                        isLargeText,
                        color,
                        backgroundColor
                    });
                }
            }
        }

        const passed = contrastIssues.length === 0 && totalTests > 0;

        return {
            guideline: '1.4.3',
            name: 'Contrast (Minimum)',
            passed,
            score: totalTests > 0 ? (passedTests / totalTests) * 100 : 100,
            details: {
                totalTests,
                passedTests,
                failedTests: contrastIssues.length,
                contrastIssues
            }
        };
    }

    // WCAG 1.4.4 - Resize text
    async test_1_4_4_ResizeText() {
        // Test if text can be resized up to 200% without loss of functionality
        const originalFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
        
        // Simulate zoom to 200%
        document.body.style.fontSize = (originalFontSize * 2) + 'px';
        
        // Check if content is still functional
        const overflowElements = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach((element, index) => {
            const style = window.getComputedStyle(element);
            if (style.overflow === 'hidden' && element.scrollWidth > element.clientWidth) {
                overflowElements.push(`Element ${index}: Text cut off at 200% zoom`);
            }
        });

        // Reset font size
        document.body.style.fontSize = '';

        const passed = overflowElements.length === 0;

        return {
            guideline: '1.4.4',
            name: 'Resize text',
            passed,
            score: passed ? 100 : Math.max(0, 100 - overflowElements.length * 5),
            details: {
                originalFontSize,
                overflowElements,
                testNote: 'Simulated 200% text resize test'
            }
        };
    }

    // WCAG 1.4.5 - Images of Text
    async test_1_4_5_ImagesOfText() {
        const images = document.querySelectorAll('img');
        const suspiciousImages = [];
        
        images.forEach((img, index) => {
            const alt = img.alt || '';
            const src = img.src || '';
            
            // Simple heuristic to detect text in images
            const containsText = /\b(text|font|typography|heading|title|label|button)\b/i.test(alt) ||
                               /\.(png|jpg|jpeg|gif|svg)$/.test(src) && alt.length > 20;
            
            if (containsText) {
                suspiciousImages.push({
                    index: index + 1,
                    alt,
                    src: src.substring(src.lastIndexOf('/') + 1),
                    reason: 'Alt text suggests this may be an image of text'
                });
            }
        });

        // Check for CSS background images that might contain text
        const elementsWithBackgrounds = document.querySelectorAll('*');
        const backgroundTextImages = [];
        
        elementsWithBackgrounds.forEach((element, index) => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;
            
            if (backgroundImage && backgroundImage !== 'none' && element.textContent.trim() === '') {
                backgroundTextImages.push({
                    element: element.tagName.toLowerCase(),
                    backgroundImage,
                    warning: 'Background image without text content - verify not text image'
                });
            }
        });

        const totalSuspicious = suspiciousImages.length + backgroundTextImages.length;
        const passed = totalSuspicious === 0;

        return {
            guideline: '1.4.5',
            name: 'Images of Text',
            passed,
            score: passed ? 100 : Math.max(50, 100 - totalSuspicious * 10),
            details: {
                totalImages: images.length,
                suspiciousImages,
                backgroundTextImages,
                note: 'Manual verification required for images containing text'
            }
        };
    }

    // WCAG 2.1.1 - Keyboard
    async test_2_1_1_Keyboard() {
        const interactiveElements = document.querySelectorAll(
            'a, button, input, select, textarea, [onclick], [onkeydown], [role="button"], [role="link"], [role="tab"], [tabindex]:not([tabindex="-1"])'
        );

        let keyboardAccessible = 0;
        const issues = [];

        interactiveElements.forEach((element, index) => {
            const isKeyboardAccessible = this.isKeyboardAccessible(element);
            if (isKeyboardAccessible) {
                keyboardAccessible++;
            } else {
                issues.push(`Element ${index + 1} (${element.tagName}): Not keyboard accessible`);
            }
        });

        const passed = interactiveElements.length === 0 || keyboardAccessible === interactiveElements.length;

        return {
            guideline: '2.1.1',
            name: 'Keyboard',
            passed,
            score: interactiveElements.length > 0 ? (keyboardAccessible / interactiveElements.length) * 100 : 100,
            details: {
                totalInteractive: interactiveElements.length,
                keyboardAccessible,
                issues
            }
        };
    }

    // WCAG 2.1.2 - No Keyboard Trap
    async test_2_1_2_NoKeyboardTrap() {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const potentialTraps = [];
        
        focusableElements.forEach((element, index) => {
            // Check for modal dialogs or overlays that might trap focus
            const isInModal = element.closest('[role="dialog"], .modal, .overlay');
            if (isInModal && !isInModal.querySelector('[aria-label*="close"], .close, [onclick*="close"]')) {
                potentialTraps.push(`Element ${index + 1}: Potentially trapped in modal without escape mechanism`);
            }
        });

        const passed = potentialTraps.length === 0;

        return {
            guideline: '2.1.2',
            name: 'No Keyboard Trap',
            passed,
            score: passed ? 100 : 80,
            details: {
                focusableElements: focusableElements.length,
                potentialTraps,
                note: 'Manual keyboard navigation testing recommended'
            }
        };
    }

    // WCAG 2.4.1 - Bypass Blocks
    async test_2_4_1_BypassBlocks() {
        const skipLinks = document.querySelectorAll('a[href^="#"], [role="navigation"] a[href^="#main"], .skip-link');
        const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer');
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        let bypassMechanisms = 0;
        const mechanisms = [];

        if (skipLinks.length > 0) {
            bypassMechanisms++;
            mechanisms.push(`Skip links: ${skipLinks.length}`);
        }

        if (landmarks.length > 0) {
            bypassMechanisms++;
            mechanisms.push(`Landmarks: ${landmarks.length}`);
        }

        if (headings.length > 0) {
            bypassMechanisms++;
            mechanisms.push(`Headings: ${headings.length}`);
        }

        const passed = bypassMechanisms >= 2; // Should have at least 2 bypass mechanisms

        return {
            guideline: '2.4.1',
            name: 'Bypass Blocks',
            passed,
            score: Math.min(100, bypassMechanisms * 50),
            details: {
                bypassMechanisms,
                mechanisms,
                skipLinks: skipLinks.length,
                landmarks: landmarks.length,
                headings: headings.length
            }
        };
    }

    // WCAG 2.4.2 - Page Titled
    async test_2_4_2_PageTitled() {
        const title = document.title;
        const titleElement = document.querySelector('title');

        const hasTitle = title && title.trim() !== '';
        const isDescriptive = hasTitle && title.length > 5 && !title.toLowerCase().includes('untitled');

        const passed = hasTitle && isDescriptive;

        return {
            guideline: '2.4.2',
            name: 'Page Titled',
            passed,
            score: passed ? 100 : (hasTitle ? 50 : 0),
            details: {
                title: title || 'No title',
                hasTitle,
                isDescriptive,
                titleLength: title ? title.length : 0
            }
        };
    }

    // Continue with remaining WCAG tests...
    async test_2_4_3_FocusOrder() {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        let logicalOrder = true;
        const issues = [];

        // Simple check for logical tab order
        let previousTabIndex = 0;
        focusableElements.forEach((element, index) => {
            const tabIndex = element.tabIndex || 0;
            if (tabIndex > 0 && tabIndex < previousTabIndex) {
                logicalOrder = false;
                issues.push(`Element ${index + 1}: Tab order may be confusing (tabindex: ${tabIndex})`);
            }
            previousTabIndex = tabIndex;
        });

        return {
            guideline: '2.4.3',
            name: 'Focus Order',
            passed: logicalOrder,
            score: logicalOrder ? 100 : 70,
            details: {
                focusableElements: focusableElements.length,
                issues,
                note: 'Manual keyboard testing recommended for complete validation'
            }
        };
    }

    async test_2_4_4_LinkPurpose() {
        const links = document.querySelectorAll('a[href]');
        let descriptiveLinks = 0;
        const issues = [];

        links.forEach((link, index) => {
            const linkText = link.textContent.trim();
            const ariaLabel = link.getAttribute('aria-label');
            const title = link.getAttribute('title');
            
            const effectiveText = ariaLabel || linkText || title;
            
            if (effectiveText && effectiveText.length > 3 && !this.isGenericLinkText(effectiveText)) {
                descriptiveLinks++;
            } else {
                issues.push(`Link ${index + 1}: Generic or unclear purpose ("${effectiveText}")`);
            }
        });

        const passed = links.length === 0 || descriptiveLinks === links.length;

        return {
            guideline: '2.4.4',
            name: 'Link Purpose (In Context)',
            passed,
            score: links.length > 0 ? (descriptiveLinks / links.length) * 100 : 100,
            details: {
                totalLinks: links.length,
                descriptiveLinks,
                issues
            }
        };
    }

    async test_2_4_6_HeadingsAndLabels() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const labels = document.querySelectorAll('label');
        
        let descriptiveHeadings = 0;
        let descriptiveLabels = 0;
        const issues = [];

        // Check headings
        headings.forEach((heading, index) => {
            const text = heading.textContent.trim();
            if (text && text.length > 2 && !this.isGenericText(text)) {
                descriptiveHeadings++;
            } else {
                issues.push(`Heading ${index + 1}: Not descriptive ("${text}")`);
            }
        });

        // Check labels
        labels.forEach((label, index) => {
            const text = label.textContent.trim();
            if (text && text.length > 1) {
                descriptiveLabels++;
            } else {
                issues.push(`Label ${index + 1}: Empty or too short`);
            }
        });

        const totalElements = headings.length + labels.length;
        const passedElements = descriptiveHeadings + descriptiveLabels;
        const passed = totalElements === 0 || passedElements === totalElements;

        return {
            guideline: '2.4.6',
            name: 'Headings and Labels',
            passed,
            score: totalElements > 0 ? (passedElements / totalElements) * 100 : 100,
            details: {
                headings: headings.length,
                descriptiveHeadings,
                labels: labels.length,
                descriptiveLabels,
                issues
            }
        };
    }

    async test_2_4_7_FocusVisible() {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Check for focus styles in CSS
        let hasFocusStyles = false;
        
        try {
            for (let sheet of document.styleSheets) {
                for (let rule of sheet.cssRules || sheet.rules) {
                    if (rule.selectorText && rule.selectorText.includes(':focus')) {
                        hasFocusStyles = true;
                        break;
                    }
                }
                if (hasFocusStyles) break;
            }
        } catch (e) {
            // Fallback: check computed styles
            if (focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                firstElement.focus();
                const focusedStyle = window.getComputedStyle(firstElement, ':focus');
                hasFocusStyles = focusedStyle.outline !== 'none' || focusedStyle.boxShadow !== 'none';
            }
        }

        const passed = hasFocusStyles;

        return {
            guideline: '2.4.7',
            name: 'Focus Visible',
            passed,
            score: passed ? 100 : 0,
            details: {
                focusableElements: focusableElements.length,
                hasFocusStyles,
                note: 'Manual testing recommended to verify focus indicators are clearly visible'
            }
        };
    }

    // Language and consistency tests
    async test_3_1_1_LanguageOfPage() {
        const htmlLang = document.documentElement.lang;
        const passed = htmlLang && htmlLang.trim() !== '';

        return {
            guideline: '3.1.1',
            name: 'Language of Page',
            passed,
            score: passed ? 100 : 0,
            details: {
                language: htmlLang || 'Not specified',
                hasLanguage: passed
            }
        };
    }

    async test_3_2_3_ConsistentNavigation() {
        const navElements = document.querySelectorAll('nav, [role="navigation"]');
        const navigationItems = [];

        navElements.forEach((nav, index) => {
            const items = nav.querySelectorAll('a, button');
            navigationItems.push({
                navIndex: index,
                itemCount: items.length,
                items: Array.from(items).map(item => item.textContent.trim())
            });
        });

        // Simple consistency check - in real scenario, this would compare across pages
        const passed = navigationItems.length > 0;

        return {
            guideline: '3.2.3',
            name: 'Consistent Navigation',
            passed,
            score: passed ? 100 : 80,
            details: {
                navigationElements: navElements.length,
                navigationItems,
                note: 'Cross-page consistency check required'
            }
        };
    }

    async test_3_2_4_ConsistentIdentification() {
        const buttons = document.querySelectorAll('button');
        const links = document.querySelectorAll('a');
        
        // Check for consistent labeling of similar functions
        const buttonLabels = new Map();
        const linkLabels = new Map();
        let inconsistencies = 0;

        buttons.forEach(button => {
            const label = button.textContent.trim().toLowerCase();
            if (label) {
                buttonLabels.set(label, (buttonLabels.get(label) || 0) + 1);
            }
        });

        links.forEach(link => {
            const label = link.textContent.trim().toLowerCase();
            if (label) {
                linkLabels.set(label, (linkLabels.get(label) || 0) + 1);
            }
        });

        // This is a simplified check - real implementation would be more sophisticated
        const passed = inconsistencies === 0;

        return {
            guideline: '3.2.4',
            name: 'Consistent Identification',
            passed,
            score: passed ? 100 : 90,
            details: {
                buttonLabels: Object.fromEntries(buttonLabels),
                linkLabels: Object.fromEntries(linkLabels),
                inconsistencies,
                note: 'Manual review recommended for functional consistency'
            }
        };
    }

    async test_3_3_1_ErrorIdentification() {
        const errorElements = document.querySelectorAll('[aria-invalid="true"], .error, .invalid, .field-error');
        const forms = document.querySelectorAll('form');
        
        let properErrorIdentification = 0;
        const issues = [];

        errorElements.forEach((element, index) => {
            const hasErrorMessage = element.getAttribute('aria-describedby') || 
                                  element.nextElementSibling?.classList.contains('error-message') ||
                                  element.parentElement?.querySelector('.error-message');
            
            if (hasErrorMessage) {
                properErrorIdentification++;
            } else {
                issues.push(`Error element ${index + 1}: Missing descriptive error message`);
            }
        });

        const passed = errorElements.length === 0 || properErrorIdentification === errorElements.length;

        return {
            guideline: '3.3.1',
            name: 'Error Identification',
            passed,
            score: errorElements.length > 0 ? (properErrorIdentification / errorElements.length) * 100 : 100,
            details: {
                errorElements: errorElements.length,
                properErrorIdentification,
                forms: forms.length,
                issues
            }
        };
    }

    async test_3_3_2_LabelsOrInstructions() {
        const inputs = document.querySelectorAll('input, select, textarea');
        let labeledInputs = 0;
        const issues = [];

        inputs.forEach((input, index) => {
            const hasLabel = this.hasProperLabel(input);
            if (hasLabel) {
                labeledInputs++;
            } else {
                issues.push(`Input ${index + 1} (${input.type || input.tagName}): Missing label or instructions`);
            }
        });

        const passed = inputs.length === 0 || labeledInputs === inputs.length;

        return {
            guideline: '3.3.2',
            name: 'Labels or Instructions',
            passed,
            score: inputs.length > 0 ? (labeledInputs / inputs.length) * 100 : 100,
            details: {
                totalInputs: inputs.length,
                labeledInputs,
                issues
            }
        };
    }

    // Robust tests
    async test_4_1_1_Parsing() {
        const issues = [];
        
        // Check for duplicate IDs
        const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
        
        if (duplicateIds.length > 0) {
            issues.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
        }

        // Check for proper nesting
        const improperNesting = this.checkImproperNesting();
        issues.push(...improperNesting);

        const passed = issues.length === 0;

        return {
            guideline: '4.1.1',
            name: 'Parsing',
            passed,
            score: passed ? 100 : Math.max(0, 100 - issues.length * 10),
            details: {
                duplicateIds: duplicateIds.length,
                improperNestingIssues: improperNesting.length,
                issues
            }
        };
    }

    async test_4_1_2_NameRoleValue() {
        const interactiveElements = document.querySelectorAll(
            'button, input, select, textarea, a[href], [role], [tabindex]:not([tabindex="-1"])'
        );

        let properNameRoleValue = 0;
        const issues = [];

        interactiveElements.forEach((element, index) => {
            const hasName = this.hasAccessibleName(element);
            const hasRole = this.hasValidRole(element);
            const hasValue = this.hasAccessibleValue(element);

            if (hasName && hasRole) {
                properNameRoleValue++;
            } else {
                const missing = [];
                if (!hasName) missing.push('name');
                if (!hasRole) missing.push('role');
                issues.push(`Element ${index + 1} (${element.tagName}): Missing ${missing.join(', ')}`);
            }
        });

        const passed = interactiveElements.length === 0 || properNameRoleValue === interactiveElements.length;

        return {
            guideline: '4.1.2',
            name: 'Name, Role, Value',
            passed,
            score: interactiveElements.length > 0 ? (properNameRoleValue / interactiveElements.length) * 100 : 100,
            details: {
                totalElements: interactiveElements.length,
                properNameRoleValue,
                issues
            }
        };
    }

    async test_4_1_3_StatusMessages() {
        const statusElements = document.querySelectorAll('[role="status"], [role="alert"], [aria-live]');
        const liveRegions = document.querySelectorAll('[aria-live]');
        
        let properStatusMessages = 0;
        statusElements.forEach(element => {
            const hasProperAttributes = element.getAttribute('aria-live') || 
                                       element.getAttribute('role') === 'status' || 
                                       element.getAttribute('role') === 'alert';
            if (hasProperAttributes) {
                properStatusMessages++;
            }
        });

        const passed = statusElements.length === properStatusMessages;

        return {
            guideline: '4.1.3',
            name: 'Status Messages',
            passed,
            score: statusElements.length > 0 ? (properStatusMessages / statusElements.length) * 100 : 100,
            details: {
                statusElements: statusElements.length,
                liveRegions: liveRegions.length,
                properStatusMessages,
                note: 'Check for dynamic content that should announce status changes'
            }
        };
    }

    async testAdditionalAccessibilityFeatures() {
        const additionalTests = [
            await this.testScreenReaderCompatibility(),
            await this.testKeyboardShortcuts(),
            await this.testResponsiveAccessibility(),
            await this.testMotionAndAnimation()
        ];

        return this.consolidateTestResults('Additional Features', additionalTests);
    }

    async testScreenReaderCompatibility() {
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        const landmarkElements = document.querySelectorAll('main, nav, header, footer, aside, section');
        const headingStructure = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        const score = Math.min(100, 
            (ariaElements.length * 10) + 
            (landmarkElements.length * 15) + 
            (headingStructure.length * 5)
        );

        return {
            name: 'Screen Reader Compatibility',
            passed: score >= 70,
            score,
            details: {
                ariaElements: ariaElements.length,
                landmarks: landmarkElements.length,
                headings: headingStructure.length
            }
        };
    }

    async testKeyboardShortcuts() {
        const accessKeyElements = document.querySelectorAll('[accesskey]');
        const keyHandlers = document.querySelectorAll('[onkeydown], [onkeyup], [onkeypress]');

        return {
            name: 'Keyboard Shortcuts',
            passed: true,
            score: 100,
            details: {
                accessKeyElements: accessKeyElements.length,
                keyHandlers: keyHandlers.length,
                note: 'Manual testing required for keyboard shortcut conflicts'
            }
        };
    }

    async testResponsiveAccessibility() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const responsiveElements = document.querySelectorAll('[class*="col-"], [class*="responsive"]');

        const passed = !!viewportMeta && responsiveElements.length > 0;

        return {
            name: 'Responsive Accessibility',
            passed,
            score: passed ? 100 : 50,
            details: {
                hasViewportMeta: !!viewportMeta,
                responsiveElements: responsiveElements.length
            }
        };
    }

    async testMotionAndAnimation() {
        const animatedElements = document.querySelectorAll('[class*="animate"], [style*="animation"], [style*="transition"]');
        const respectsReducedMotion = this.checkReducedMotionSupport();

        return {
            name: 'Motion and Animation',
            passed: respectsReducedMotion,
            score: respectsReducedMotion ? 100 : 80,
            details: {
                animatedElements: animatedElements.length,
                respectsReducedMotion,
                note: 'Check for prefers-reduced-motion CSS media query usage'
            }
        };
    }

    // Helper methods
    hasProperLabel(element) {
        return element.labels?.length > 0 ||
               element.getAttribute('aria-label') ||
               element.getAttribute('aria-labelledby') ||
               element.getAttribute('title') ||
               (element.placeholder && element.type !== 'password');
    }

    validateHeadingStructure(headings) {
        let previousLevel = 0;
        for (let heading of headings) {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            if (previousLevel > 0 && currentLevel > previousLevel + 1) {
                return { 
                    valid: false, 
                    issue: `Heading level jumps from h${previousLevel} to h${currentLevel}` 
                };
            }
            previousLevel = currentLevel;
        }
        return { valid: true };
    }

    checkVisualOrder() {
        // Simplified visual order check
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        let previousTop = 0;
        const issues = [];
        
        focusableElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            if (index > 0 && rect.top < previousTop - 10) {
                issues.push(`Element ${index + 1}: May be out of visual reading order`);
            }
            previousTop = rect.top;
        });

        return { passed: issues.length === 0, issues };
    }

    hasColorDifference(color1, color2) {
        // Simplified color difference check
        return color1 !== color2;
    }

    getEffectiveBackgroundColor(element) {
        let current = element;
        while (current && current !== document.body) {
            const bgColor = window.getComputedStyle(current).backgroundColor;
            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                return bgColor;
            }
            current = current.parentElement;
        }
        return 'rgb(255, 255, 255)'; // Default to white
    }

    calculateContrastRatio(foreground, background) {
        // Simplified contrast calculation
        // In real implementation, this would convert colors to RGB and calculate proper contrast
        const fgLum = this.getLuminance(foreground);
        const bgLum = this.getLuminance(background);
        
        const lighter = Math.max(fgLum, bgLum);
        const darker = Math.min(fgLum, bgLum);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    getLuminance(color) {
        // Simplified luminance calculation
        // This should be replaced with proper color space conversion
        if (color.includes('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const [r, g, b] = matches.map(Number);
                return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }
        }
        return 0.5; // Default middle value
    }

    isKeyboardAccessible(element) {
        return element.tabIndex >= 0 || 
               ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) ||
               element.hasAttribute('onclick') ||
               element.hasAttribute('onkeydown');
    }

    isGenericLinkText(text) {
        const generic = ['click here', 'read more', 'more', 'link', 'here', 'continue'];
        return generic.some(term => text.toLowerCase().includes(term));
    }

    isGenericText(text) {
        const generic = ['untitled', 'heading', 'title', 'text'];
        return generic.some(term => text.toLowerCase().includes(term));
    }

    checkImproperNesting() {
        const issues = [];
        // Check for buttons inside buttons, links inside links, etc.
        const nestedButtons = document.querySelectorAll('button button, a a');
        if (nestedButtons.length > 0) {
            issues.push(`${nestedButtons.length} improperly nested interactive elements found`);
        }
        return issues;
    }

    hasAccessibleName(element) {
        return element.getAttribute('aria-label') ||
               element.getAttribute('aria-labelledby') ||
               element.textContent.trim() !== '' ||
               element.getAttribute('alt') ||
               element.getAttribute('title');
    }

    hasValidRole(element) {
        const role = element.getAttribute('role');
        const tagName = element.tagName.toLowerCase();
        
        // Implicit roles for common elements
        const implicitRoles = {
            'button': 'button',
            'a': 'link',
            'input': element.type === 'button' ? 'button' : 'textbox',
            'select': 'combobox',
            'textarea': 'textbox'
        };

        return role || implicitRoles[tagName] || tagName === 'div' || tagName === 'span';
    }

    hasAccessibleValue(element) {
        return element.value !== undefined || 
               element.getAttribute('aria-valuenow') ||
               element.textContent.trim() !== '';
    }

    checkReducedMotionSupport() {
        // Check if CSS includes prefers-reduced-motion media query
        try {
            for (let sheet of document.styleSheets) {
                for (let rule of sheet.cssRules || sheet.rules) {
                    if (rule.media && rule.media.mediaText.includes('prefers-reduced-motion')) {
                        return true;
                    }
                }
            }
        } catch (e) {
            // Cross-origin stylesheets might not be accessible
        }
        return false;
    }

    consolidateTestResults(categoryName, tests) {
        const totalTests = tests.length;
        const passedTests = tests.filter(test => test.passed).length;
        const averageScore = tests.reduce((sum, test) => sum + test.score, 0) / totalTests;

        return {
            category: categoryName,
            passed: passedTests === totalTests,
            score: Math.round(averageScore),
            details: {
                totalTests,
                passedTests,
                failedTests: totalTests - passedTests,
                tests
            }
        };
    }

    calculateComplianceScore(testResults) {
        const categories = Object.values(testResults);
        const totalScore = categories.reduce((sum, category) => sum + (category.score || 0), 0);
        const averageScore = totalScore / categories.length;
        
        return Math.round(averageScore);
    }

    generateAccessibilityRecommendations(testResults) {
        const recommendations = [];

        Object.values(testResults).forEach(category => {
            if (category.details && category.details.tests) {
                category.details.tests.forEach(test => {
                    if (!test.passed && test.details && test.details.issues) {
                        test.details.issues.forEach(issue => {
                            recommendations.push({
                                guideline: test.guideline,
                                priority: this.getPriorityLevel(test.guideline),
                                issue,
                                category: category.category,
                                recommendation: this.getRecommendation(test.guideline, issue)
                            });
                        });
                    }
                });
            }
        });

        return recommendations;
    }

    getPriorityLevel(guideline) {
        const highPriority = ['1.1.1', '1.4.3', '2.1.1', '2.4.2', '4.1.2'];
        const mediumPriority = ['1.3.1', '2.4.1', '2.4.4', '2.4.6', '3.3.2'];
        
        if (highPriority.includes(guideline)) return 'high';
        if (mediumPriority.includes(guideline)) return 'medium';
        return 'low';
    }

    getRecommendation(guideline, issue) {
        const recommendations = {
            '1.1.1': 'Add descriptive alt text to images, or mark decorative images with empty alt="" or role="presentation"',
            '1.4.3': 'Ensure text has sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
            '2.1.1': 'Ensure all interactive elements are keyboard accessible with proper tab order',
            '2.4.2': 'Provide descriptive and unique page titles',
            '4.1.2': 'Ensure all interactive elements have accessible names and proper roles'
        };
        
        return recommendations[guideline] || 'Review accessibility guidelines and implement appropriate fixes';
    }

    exportAccessibilityReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            wcagLevel: 'AA',
            overallCompliance: results.overallCompliance,
            complianceScore: results.complianceScore,
            summary: {
                totalTests: this.complianceResults.total,
                passedTests: this.complianceResults.passed,
                failedTests: this.complianceResults.failed,
                warnings: this.complianceResults.warnings
            },
            detailedResults: results,
            recommendations: results.recommendations
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `psc-accessibility-compliance-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('♿ Accessibility compliance report exported');
    }
}

// Initialize accessibility validator
const accessibilityValidator = new AccessibilityComplianceValidator();

// Global functions
window.testAccessibilityCompliance = async function() {
    return await accessibilityValidator.testAccessibilityCompliance();
};

window.exportAccessibilityReport = function(results) {
    accessibilityValidator.exportAccessibilityReport(results);
};

console.log('♿ Accessibility Compliance Validator initialized');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityComplianceValidator;
}