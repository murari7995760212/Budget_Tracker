// Load data from localStorage
let budget = parseFloat(localStorage.getItem('budget')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let adminPassword = localStorage.getItem('adminPassword') || '';

const form = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const report = document.getElementById('report');
const budgetDisplay = document.getElementById('budgetDisplay');
const adminControls = document.getElementById('adminControls');

// Display current budget
budgetDisplay.textContent = `Current Budget: ₹${budget}`;

// Set Admin Password
function setAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (!password) {
        alert("Enter a valid password!");
        return;
    }
    adminPassword = password;
    localStorage.setItem('adminPassword', password);
    alert("Admin access granted.");
    adminControls.style.display = 'block';
}

// Set Monthly Budget (Admin Only)
function setBudget() {
    const enteredPassword = prompt("Enter Admin Password to Set Budget:");
    if (enteredPassword !== adminPassword) {
        alert("Unauthorized access! Only admin can set the budget.");
        return;
    }

    const newBudget = parseFloat(document.getElementById('budgetInput').value);
    if (isNaN(newBudget) || newBudget <= 0) {
        alert("Please enter a valid budget!");
        return;
    }

    budget = newBudget;
    localStorage.setItem('budget', budget);
    budgetDisplay.textContent = `Current Budget: ₹${budget}`;
    displayExpenses();
}

// Add new expense
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const item = document.getElementById('item').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const spender = document.getElementById('spender').value;

    if (!item || isNaN(amount) || amount <= 0) {
        alert("Enter valid item and amount!");
        return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString();

    const expense = { item, amount, spender, timestamp };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    budget -= amount;
    localStorage.setItem('budget', budget);
    budgetDisplay.textContent = `Current Budget: ₹${budget}`;

    form.reset();
    displayExpenses();
});

// Display all expenses
function displayExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach((exp, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${exp.spender} bought ${exp.item} for ₹${exp.amount} (${exp.timestamp})
            <button onclick="deleteExpense(${index})">❌</button>`;
        expenseList.appendChild(li);
    });
}

// Delete expense (Admin Only)
function deleteExpense(index) {
    const enteredPassword = prompt("Enter Admin Password to Delete:");
    if (enteredPassword !== adminPassword) {
        alert("Unauthorized access! Only admin can delete expenses.");
        return;
    }

    const deletedAmount = expenses[index].amount;
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    budget += deletedAmount;
    localStorage.setItem('budget', budget);
    budgetDisplay.textContent = `Current Budget: ₹${budget}`;
    displayExpenses();
}

// Generate and Print Reports (Admin Only)
function printReport(days) {
    const enteredPassword = prompt("Enter Admin Password to Print Report:");
    if (enteredPassword !== adminPassword) {
        alert("Unauthorized access! Only admin can print reports.");
        return;
    }

    const now = new Date();
    const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);

    const filteredExpenses = expenses.filter(exp => new Date(exp.timestamp) >= cutoff);

    // Open print window
    const printWindow = window.open('', '', 'width=800,height=600');

    // Generate print content
    printWindow.document.write(`
        <html>
            <head>
                <title>Expense Report</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    h1 { font-size: 20px; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin: 8px 0; }
                    .green { color: green; font-weight: bold; }
                    .red { color: red; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>${days === 1 ? 'Daily' : days === 7 ? 'Weekly' : 'Monthly'} Report</h1>
                <p>Date & Time: ${now.toLocaleString()}</p>
                <ul>
    `);

    let totalSpent = 0;
    filteredExpenses.forEach(exp => {
        totalSpent += exp.amount;
        printWindow.document.write(`
            <li>${exp.spender} - ${exp.item} - ₹${exp.amount} (${exp.timestamp})</li>
        `);
    });

    // Summary section
    printWindow.document.write(`
                </ul>
                <p class="green">Total Spent: ₹${totalSpent}</p>
                <p class="red">Balance Left: ₹${budget}</p>
                <p>© 2024 Murari Dundra. All rights reserved.</p>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}

// Attach print functions for daily, weekly, and monthly reports
function generateReport(days) {
    printReport(days);
}

displayExpenses();
