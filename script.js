class CreditCardPredictor {
    constructor() {
        this.form = document.getElementById('creditForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.predictionResult = document.getElementById('predictionResult');
        this.alertBox = document.getElementById('alertBox');
        this.alertIcon = document.getElementById('alertIcon');
        this.alertMessage = document.getElementById('alertMessage');
        
        this.formFields = [
            'gender', 'age', 'maritalStatus', 'bankCustomer', 'yearsEmployed',
            'priorDefault', 'currentlyEmployed', 'creditScore', 'driversLicense',
            'zipCode', 'income', 'industry', 'ethnicity', 'citizenshipStatus'
        ];
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Add real-time validation
        this.formFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('input', () => this.clearError(fieldName));
                field.addEventListener('change', () => this.clearError(fieldName));
            }
        });
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = this.getFormData();
        await this.submitPrediction(formData);
    }
    
    validateForm() {
        let isValid = true;
        const errors = {};
        
        // Get form data
        const formData = this.getFormData();
        
        // Required field validation
        this.formFields.forEach(fieldName => {
            if (!formData[fieldName] || formData[fieldName].trim() === '') {
                errors[fieldName] = `${this.getFieldLabel(fieldName)} is required`;
                isValid = false;
            }
        });
        
        // Specific validations
        if (formData.age) {
            const age = parseInt(formData.age);
            if (age < 18 || age > 100) {
                errors.age = 'Age must be between 18 and 100';
                isValid = false;
            }
        }
        
        if (formData.yearsEmployed) {
            const years = parseFloat(formData.yearsEmployed);
            if (years < 0) {
                errors.yearsEmployed = 'Years employed cannot be negative';
                isValid = false;
            }
        }
        
        if (formData.creditScore) {
            const score = parseInt(formData.creditScore);
            if (score < 300 || score > 850) {
                errors.creditScore = 'Credit score must be between 300 and 850';
                isValid = false;
            }
        }
        
        if (formData.income) {
            const income = parseFloat(formData.income);
            if (income < 0) {
                errors.income = 'Income cannot be negative';
                isValid = false;
            }
        }
        
        if (formData.zipCode) {
            const zipRegex = /^\d{5}(-\d{4})?$/;
            if (!zipRegex.test(formData.zipCode)) {
                errors.zipCode = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
                isValid = false;
            }
        }
        
        // Display errors
        this.displayErrors(errors);
        
        return isValid;
    }
    
    getFormData() {
        const formData = {};
        this.formFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                formData[fieldName] = field.value;
            }
        });
        return formData;
    }
    
    getFieldLabel(fieldName) {
        const field = document.getElementById(fieldName);
        const label = document.querySelector(`label[for="${fieldName}"]`);
        return label ? label.textContent.replace(' *', '') : fieldName;
    }
    
    displayErrors(errors) {
        // Clear all previous errors
        this.formFields.forEach(fieldName => {
            this.clearError(fieldName);
        });
        
        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            this.showError(fieldName, errors[fieldName]);
        });
    }
    
    showError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (field && errorElement) {
            field.classList.add('error');
            errorElement.textContent = message;
        }
    }
    
    clearError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.textContent = '';
        }
    }
    
    async submitPrediction(formData) {
        this.setLoadingState(true);
        
        try {
            // Check if we're submitting to Flask server or using mock data
            const response = await this.sendToServer(formData);
            
            if (response.success) {
                this.displayResult(response.prediction, response.confidence);
            } else {
                this.displayResult('Error', 0, response.message || 'An error occurred while processing your application.');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            this.displayResult('Error', 0, 'Unable to connect to the server. Please try again later.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async sendToServer(formData) {
        // Try to send to Flask server first
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Server response not ok');
            }
        } catch (error) {
            console.log('Flask server not available, using mock prediction:', error);
            
            // Fallback to client-side mock prediction
            return this.getMockPrediction(formData);
        }
    }
    
    getMockPrediction(formData) {
        // Simulate server processing time
        return new Promise((resolve) => {
            setTimeout(() => {
                const creditScore = parseInt(formData.creditScore);
                const income = parseFloat(formData.income);
                const yearsEmployed = parseFloat(formData.yearsEmployed);
                const priorDefault = formData.priorDefault;
                
                let approved = false;
                let confidence = 0;
                
                // Simple scoring algorithm
                let score = 0;
                
                // Credit score weight (40%)
                if (creditScore >= 750) score += 40;
                else if (creditScore >= 700) score += 35;
                else if (creditScore >= 650) score += 25;
                else if (creditScore >= 600) score += 15;
                else score += 5;
                
                // Income weight (25%)
                if (income >= 75000) score += 25;
                else if (income >= 50000) score += 20;
                else if (income >= 35000) score += 15;
                else if (income >= 25000) score += 10;
                else score += 5;
                
                // Employment history weight (20%)
                if (yearsEmployed >= 5) score += 20;
                else if (yearsEmployed >= 3) score += 15;
                else if (yearsEmployed >= 2) score += 10;
                else if (yearsEmployed >= 1) score += 8;
                else score += 3;
                
                // Prior default weight (15%)
                if (priorDefault === 'No') score += 15;
                else score += 0;
                
                // Current employment (bonus)
                if (formData.currentlyEmployed === 'Yes') score += 5;
                
                // Bank customer (bonus)
                if (formData.bankCustomer === 'Yes') score += 3;
                
                // Driver's license (bonus)
                if (formData.driversLicense === 'Yes') score += 2;
                
                confidence = Math.min(score, 100);
                approved = score >= 65;
                
                resolve({
                    success: true,
                    prediction: approved ? 'Approved' : 'Denied',
                    confidence: confidence,
                    score: score
                });
            }, 2000); // 2 second delay to simulate processing
        });
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitText.classList.add('hidden');
            this.loadingSpinner.classList.remove('hidden');
        } else {
            this.submitBtn.disabled = false;
            this.submitText.classList.remove('hidden');
            this.loadingSpinner.classList.add('hidden');
        }
    }
    
    displayResult(prediction, confidence = 0, customMessage = null) {
        // Hide previous result
        this.predictionResult.classList.remove('show');
        
        setTimeout(() => {
            let message, iconHtml, alertClass;
            
            if (prediction === 'Approved') {
                message = customMessage || `Congratulations! Your application is likely to be approved with ${confidence}% confidence.`;
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>';
                alertClass = 'success';
            } else if (prediction === 'Denied') {
                message = customMessage || `Unfortunately, your application may be denied. Current approval probability: ${confidence}%.`;
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                alertClass = 'error';
            } else {
                message = customMessage || 'An error occurred while processing your application. Please try again.';
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><triangle-alert></triangle-alert></svg>';
                alertClass = 'error';
            }
            
            this.alertBox.className = `alert ${alertClass}`;
            this.alertIcon.innerHTML = iconHtml;
            this.alertMessage.textContent = message;
            
            this.predictionResult.classList.remove('hidden');
            
            // Smooth show animation
            setTimeout(() => {
                this.predictionResult.classList.add('show');
            }, 10);
            
            // Scroll to result
            this.predictionResult.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreditCardPredictor();
});

// Enhanced form experience
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth focus transitions
    const inputs = document.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // Add progress indication
    const formFields = document.querySelectorAll('.form-input, .form-select');
    let completedFields = 0;
    
    const updateProgress = () => {
        completedFields = 0;
        formFields.forEach(field => {
            if (field.value.trim() !== '') {
                completedFields++;
            }
        });
        
        const progress = (completedFields / formFields.length) * 100;
        
        // You can add a progress bar here if desired
        console.log(`Form completion: ${progress.toFixed(1)}%`);
    };
    
    formFields.forEach(field => {
        field.addEventListener('input', updateProgress);
        field.addEventListener('change', updateProgress);
    });
});

// Utility function for form data serialization (useful for Flask integration)
function serializeFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

// Utility function to reset form
function resetForm() {
    const form = document.getElementById('creditForm');
    const predictionResult = document.getElementById('predictionResult');
    
    form.reset();
    predictionResult.classList.add('hidden');
    predictionResult.classList.remove('show');
    
    // Clear all error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    // Remove error classes
    const errorFields = document.querySelectorAll('.form-input.error, .form-select.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
}