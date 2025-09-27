const incomeInput = document.getElementById('incomeInput');
const saveIncomeBtn = document.getElementById('saveIncomeBtn');
const netBalanceSpan = document.getElementById('netBalance');

const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const addExpenseBtn = document.getElementById('addExpenseBtn');

const expenseTableBody = document.querySelector('#expenseTable tbody');

const pieChartCanvas = document.getElementById('pieChart').getContext('2d');
const barChartCanvas = document.getElementById('barChart').getContext('2d');

let pieChart, barChart;
let netBalance = 0;
let expenses = [];

function updateBalance() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    netBalance = parseFloat(localStorage.getItem('income') || 0) - totalExpenses;
    netBalanceSpan.textContent = netBalance.toFixed(2);
}

function renderExpenses() {
    expenseTableBody.innerHTML = '';
    expenses.forEach((expense, index) => {
        const tr = document.createElement('tr');

        const descTd = document.createElement('td');
        descTd.textContent = expense.description;
        
        const catTd = document.createElement('td');
        catTd.textContent = expense.category;

        const amountTd = document.createElement('td');
        amountTd.className = 'expense-amount';
        amountTd.textContent = `-$${expense.amount.toFixed(2)}`;
        
        const dateTd = document.createElement('td');
        dateTd.textContent = expense.date;

        const actionTd = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteExpense(index);
        actionTd.appendChild(deleteBtn);
        
        tr.appendChild(descTd);
        tr.appendChild(catTd);
        tr.appendChild(amountTd);
        tr.appendChild(dateTd);
        tr.appendChild(actionTd);
        
        expenseTableBody.prepend(tr);
    });
    updateCharts();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveData();
}

function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateBalance();
    renderExpenses();
}

function loadData() {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
        expenses = JSON.parse(storedExpenses);
    }
    const storedIncome = localStorage.getItem('income');
    if (storedIncome) {
        incomeInput.value = storedIncome;
    }
    updateBalance();
    renderExpenses();
}

// Chart Functions
function updateCharts() {
    const expensesByCategory = {};
    const monthlyExpenses = {};

    expenses.forEach(expense => {
        if (expensesByCategory[expense.category]) {
            expensesByCategory[expense.category] += expense.amount;
        } else {
            expensesByCategory[expense.category] = expense.amount;
        }
        
        const dateObj = new Date(expense.date);
        const month = `${dateObj.getFullYear()}-${dateObj.toLocaleString('default', { month: 'short' })}`;
        if (monthlyExpenses[month]) {
            monthlyExpenses[month] += expense.amount;
        } else {
            monthlyExpenses[month] = expense.amount;
        }
    });

    const pieData = {
        labels: Object.keys(expensesByCategory),
        datasets: [{
            data: Object.values(expensesByCategory),
            backgroundColor: ['#6C63FF', '#8A2BE2', '#3EE1AF', '#FF6B6B', '#FFD93D'],

        }]
    };
    if (pieChart) {
        pieChart.destroy();
    }
    pieChart = new Chart(pieChartCanvas, {
        type: 'pie',
        data: pieData,
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    const barGradient = barChartCanvas.createLinearGradient(0, 0, 0, 400);
    barGradient.addColorStop(0, '#6C63FF'); 
    barGradient.addColorStop(1, '#3EE1AF'); 

    const barData = {
        labels: Object.keys(monthlyExpenses),
        datasets: [{
            label: 'Monthly Spending',
            data: Object.values(monthlyExpenses),
            backgroundColor: barGradient,
            borderColor: '#2563eb',
            borderWidth: 1
        }]
    };
    if (barChart) {
        barChart.destroy();
    }
    barChart = new Chart(barChartCanvas, {
        type: 'bar',
        data: barData,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            } 
        }
    });
}


// 4. Event Listeners
saveIncomeBtn.addEventListener('click', () => {
    localStorage.setItem('income', parseFloat(incomeInput.value) || 0);
    updateBalance();
});

addExpenseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const date = dateInput.value;

    if (description && amount > 0 && category && date) {
        const newExpense = {
            description,
            amount,
            category,
            date
        };
        expenses.push(newExpense);
        saveData();
        
        descriptionInput.value = '';
        amountInput.value = '';
        categorySelect.value = '';
        dateInput.value = '';
    } else {
        alert('Please fill out all fields correctly.');
    }
});

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment'];
categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
});

window.onload = loadData;

