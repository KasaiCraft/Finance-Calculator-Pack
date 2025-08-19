// Page Management
function showDashboard(calculator = 'emi') {
    document.getElementById('landing').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    switchCalculator(calculator);
}

function showLanding() {
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('landing').classList.add('active');
}

// Calculator Switching
function switchCalculator(calculator) {
    // Remove active class from all calculators and nav items
    document.querySelectorAll('.calculator').forEach(calc => calc.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    // Add active class to selected calculator and nav item
    document.getElementById(`${calculator}-calc`).classList.add('active');
    document.querySelector(`[data-calc="${calculator}"]`).classList.add('active');
    
    // Calculate and display results
    switch(calculator) {
        case 'emi': calculateEMI(); break;
        case 'sip': calculateSIP(); break;
        case 'fd': calculateFD(); break;
        case 'savings': calculateSavings(); break;
    }
}

// Add event listeners for navigation
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            switchCalculator(this.getAttribute('data-calc'));
        });
    });
    
    // Initial calculations
    calculateEMI();
    calculateSIP();
    calculateFD();
    calculateSavings();
});

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
}

// Chart Management
let charts = {};

function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
    }
}

// EMI Calculator
function calculateEMI() {
    const principal = parseFloat(document.getElementById('emi-amount').value) || 500000;
    const annualRate = parseFloat(document.getElementById('emi-rate').value) || 8.5;
    const tenure = parseFloat(document.getElementById('emi-tenure').value) || 20;
    const tenureType = document.getElementById('emi-tenure-type').value;
    
    let months = tenureType === 'years' ? tenure * 12 : tenure;
    const monthlyRate = annualRate / 12 / 100;
    
    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    
    // Update results
    document.getElementById('emi-result').textContent = formatCurrency(emi);
    document.getElementById('emi-total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('emi-total-payment').textContent = formatCurrency(totalPayment);
    
    // Create chart
    createEMIChart(principal, totalInterest);
}

function createEMIChart(principal, interest) {
    destroyChart('emi-chart');
    
    const ctx = document.getElementById('emi-chart').getContext('2d');
    charts['emi-chart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#2563eb', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// SIP Calculator
function calculateSIP() {
    const monthlyInvestment = parseFloat(document.getElementById('sip-amount').value) || 5000;
    const annualReturn = parseFloat(document.getElementById('sip-rate').value) || 12;
    const years = parseFloat(document.getElementById('sip-period').value) || 10;
    
    const months = years * 12;
    const monthlyReturn = annualReturn / 12 / 100;
    
    // SIP Formula: M * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyInvestment * 
                       (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * 
                        (1 + monthlyReturn));
    
    const totalInvested = monthlyInvestment * months;
    const wealthGain = futureValue - totalInvested;
    
    // Update results
    document.getElementById('sip-final-value').textContent = formatCurrency(futureValue);
    document.getElementById('sip-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('sip-gain').textContent = formatCurrency(wealthGain);
    
    // Create chart
    createSIPChart(years, monthlyInvestment, monthlyReturn);
}

function createSIPChart(years, monthlyInvestment, monthlyReturn) {
    destroyChart('sip-chart');
    
    const labels = [];
    const investedData = [];
    const valueData = [];
    
    for (let year = 1; year <= years; year++) {
        labels.push(`Year ${year}`);
        
        const months = year * 12;
        const invested = monthlyInvestment * months;
        const value = monthlyInvestment * 
                     (((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) * 
                      (1 + monthlyReturn));
        
        investedData.push(invested);
        valueData.push(value);
    }
    
    const ctx = document.getElementById('sip-chart').getContext('2d');
    charts['sip-chart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Amount Invested',
                    data: investedData,
                    borderColor: '#64748b',
                    backgroundColor: '#64748b20',
                    fill: false
                },
                {
                    label: 'Future Value',
                    data: valueData,
                    borderColor: '#059669',
                    backgroundColor: '#05966920',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// FD Calculator
function calculateFD() {
    const principal = parseFloat(document.getElementById('fd-principal').value) || 100000;
    const annualRate = parseFloat(document.getElementById('fd-rate').value) || 6.5;
    const years = parseFloat(document.getElementById('fd-period').value) || 5;
    
    // Compound Interest Formula: P * (1 + r/n)^(n*t)
    // For quarterly compounding: n = 4
    const rate = annualRate / 100;
    const maturityValue = principal * Math.pow(1 + rate / 4, 4 * years);
    const interestEarned = maturityValue - principal;
    
    // Update results
    document.getElementById('fd-maturity').textContent = formatCurrency(maturityValue);
    document.getElementById('fd-interest').textContent = formatCurrency(interestEarned);
    document.getElementById('fd-principal-display').textContent = formatCurrency(principal);
    
    // Create chart
    createFDChart(principal, interestEarned);
}

function createFDChart(principal, interest) {
    destroyChart('fd-chart');
    
    const ctx = document.getElementById('fd-chart').getContext('2d');
    charts['fd-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Principal', 'Interest Earned'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#2563eb', '#059669'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// Savings Goal Calculator
function calculateSavings() {
    const targetAmount = parseFloat(document.getElementById('savings-target').value) || 1000000;
    const years = parseFloat(document.getElementById('savings-period').value) || 10;
    const annualReturn = parseFloat(document.getElementById('savings-rate').value) || 8;
    
    const months = years * 12;
    const monthlyReturn = annualReturn / 12 / 100;
    
    // PMT Formula: FV * r / [((1 + r)^n - 1) * (1 + r)]
    const monthlyPayment = (targetAmount * monthlyReturn) / 
                          (((Math.pow(1 + monthlyReturn, months) - 1)) * (1 + monthlyReturn));
    
    const totalInvested = monthlyPayment * months;
    const interestEarned = targetAmount - totalInvested;
    
    // Update results
    document.getElementById('savings-monthly').textContent = formatCurrency(monthlyPayment);
    document.getElementById('savings-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('savings-interest').textContent = formatCurrency(interestEarned);
    
    // Create chart
    createSavingsChart(totalInvested, interestEarned);
}

function createSavingsChart(invested, interest) {
    destroyChart('savings-chart');
    
    const ctx = document.getElementById('savings-chart').getContext('2d');
    charts['savings-chart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Amount Invested', 'Interest Earned'],
            datasets: [{
                data: [invested, interest],
                backgroundColor: ['#2563eb', '#059669'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Add event listeners for real-time calculations
document.addEventListener('DOMContentLoaded', function() {
    // EMI inputs
    ['emi-amount', 'emi-rate', 'emi-tenure', 'emi-tenure-type'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateEMI);
        document.getElementById(id).addEventListener('change', calculateEMI);
    });
    
    // SIP inputs
    ['sip-amount', 'sip-rate', 'sip-period'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateSIP);
    });
    
    // FD inputs
    ['fd-principal', 'fd-rate', 'fd-period'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateFD);
    });
    
    // Savings inputs
    ['savings-target', 'savings-period', 'savings-rate'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateSavings);
    });
});

