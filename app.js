<<<<<<< HEAD
// BUDGET CONTROLLER

let budgetController = (() => {

	class Expense {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		}

		calcPercentage(totalIncome) {
			this.percentage = (totalIncome) ? Math.round(this.value / totalIncome * 100) : -1;
		}

		getPercentage() { return this.percentage };
	}

	class Income {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}
	}

	let calculateTotal = (type) => {
		let sum = 0;
		data.allItems[type].forEach(element => {
			sum += element.value;
		});
		data.totals[type] = sum;
	}

	let data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			let newItem, ID;

			// Create new ID
			ID = (data.allItems[type].length > 0) ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;
			
			// Create new item of [type]
			newItem = (type === "inc") ? new Income(ID, des, val) : new Expense(ID, des, val);
			
			// Add item to data structure
			data.allItems[type].push(newItem);
			// data.totals[type] += newItem.value;
			
			return newItem;
		},

		deleteItem: (type, id) => {
			let ids, index;
			
			ids = data.allItems[type].map((current) => {
				return current.id;
			});
			
			index = ids.indexOf(id);

			if (index !== -1)	data.allItems[type].splice(index, 1);
		},

		calculateBudget: () => {

			// Calculate total income and expenses
			calculateTotal("exp");
			calculateTotal("inc");

			// Calculate the budget
			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of income spent
			data.percentage = (data.totals.inc) ? Math.round(data.totals.exp / data.totals.inc * 100) : -1;
		},

		calculatePercentages: () => {

			data.allItems.exp.forEach(cur => {
				cur.calcPercentage(data.totals.inc);
			});

		},

		getPercentages: () => {
			let allPerc = data.allItems.exp.map(cur => {
				return cur.getPercentage();
			});
			return allPerc;
		},

		getBudget: () => {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalExp: data.totals.exp,
				totalInc: data.totals.inc
			};
		},

		testing: () => {
			calculateTotal("inc");
			calculateTotal("exp");
			return data;
		}
	}

})();

// UI CONTROLLER

let UIController = (() => {

	let DOMStrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercentageLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};

	let formatNumber = (number, type) => {
		let numSplit, int, dec;

		/* 
		+ or - before the number
		2 decimal points
		a comma separating the thousands
		*/

		numSplit = Math.abs(number)
			.toFixed(2)
			.split('.');

		int = numSplit[0].length > 3 ? numSplit[0].substr(0, numSplit[0].length - 3) + "," + numSplit[0].substr(numSplit[0].length - 3) : numSplit[0];
		dec = numSplit[1];

		return `${type === "exp" ? "-" : "+"} ${int}.${dec}`;
	};

	let nodeListForEach = (list, callback) => {
		for (let i = 0; i < list.length; i++) callback(list[i], i);
	};

	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // "inc" or "exp"
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},

		addListItem: (obj, type) => {
			let html, newHtml, element;
			
			// Create HTML string with placeholder text

			if (type === "inc") {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === "exp") {
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace the placeholder text with actual data
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
			newHtml = newHtml.replace("%description%", obj.description);

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		deleteListItem: (selectorID) => {
			let el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: () => {
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.map(field => { field.value = ""; });
			fieldsArr[0].focus();
		},

		displayBudget: (obj) => {
			let type = obj.budget >= 0 ? "inc" : "exp";

			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
			document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
			document.querySelector(DOMStrings.percentageLabel).textContent = (obj.percentage > 0) ? obj.percentage + "%" : "---";
		},

		displayPercentages: (percentages) => {
			let fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
			
			nodeListForEach(fields, (current, index) => {
				current.textContent = (percentages[index] > 0) ? percentages[index] + '%' : '---';
			});
		},

		displayMonth: () => {
			let now, months;
			months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			now = new Date();
			document.querySelector(DOMStrings.dateLabel).textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
		},

		changedType: () => {

			let fields = document.querySelectorAll(
				DOMStrings.inputType + "," +
				DOMStrings.inputDescription + "," +
				DOMStrings.inputValue
			);

			nodeListForEach(fields, cur => {
				cur.classList.toggle("red-focus");
			});

			document.querySelector(DOMStrings.inputBtn).classList.toggle("red");

		},

		getDOMStrings: () => {
			return DOMStrings;
		}
	};

})();

// GLOBAL APP CONTROLLER

let controller = (function(budgetCtrl, UICtrl) {

	let setupEventListeners = () => {
		let DOM = UICtrl.getDOMStrings();
		
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
		document.addEventListener("keypress", () => {
			if (event.key === "Enter" || event.which === 13) ctrlAddItem();
		});

		document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
	};

	let updateBudget = () => {

		// 1. Calculate budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		let budget = budgetCtrl.getBudget();

		// 3. Display budget on the UI
		UICtrl.displayBudget(budget);

	};

	let updatePercentages = () => {
		
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. Read them from the budget controller
		let percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	let ctrlAddItem = () => {
		// Declare variables
		let input, newItem;
		
		// 1. Get input data
		input = UICtrl.getInput();

		if (input.description && !isNaN(input.value) && input.value > 0) {
			// 2. Add to budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
	
			// 3. Add to UI Controller
			UICtrl.addListItem(newItem, input.type);
			
			// 4. Clear the fields
			UICtrl.clearFields();
	
			// 5. Calculate and update budget
			updateBudget();

			// 6. Calculate and update percentages
			updatePercentages();
		}
	}

	let ctrlDeleteItem = (event) => {
		let itemID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID)	{
			let splitID, type, ID;
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate and update percentages
			updatePercentages();
		}
	}

	return {
		init: () => {
			console.log("Application has started.");
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalExp: 0,
				totalInc: 0
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController);

controller.init();
=======
/*
This is more advanced stuff, and I want you to first get 100% familiar with what I showed you before. Code a couple of projects, maybe some bigger ones, whithout using object oriented JS, so that you will find the limitaions that it has when the code grows bigger and bigger.

*/


/////////////////////////////////////////////////////////////////////
// Function constructor for an expense. We choose to create objects like this because we will have multiple expenses, so we will create many objects. We put methods in its prototype so all objects created through this constructor will inherit these methods, instead of having the methods attached to each individual object. We will read and mutate all its properties using methods, to further encapsulate the data
function Expense(id, description, value, paymentStatus) {
    this.id = id; // For deleting items
    this.description = description;
    this.value = value;
    this.paymentStatus = paymentStatus;
    this.percentage = -1;
}

Expense.prototype = {
    calculatePercentage: function(total) {
        if(total > 0) {
            this.percentage = Math.round(this.value / total * 100);
        } else {
            this.percentage = '--';
        }
        
        return this.percentage;
        
        /* Let's return a function here to demonstrate closures and first-class functions. Usually we would just return Math.round(this.value / total) * 100
        return function(value) {
            return Math.round(value / total) * 100
        }
        */
    }
}





/////////////////////////////////////////////////////////////////////
// Function constructor for an income. We don't need methods here because we can borrow them from the Expenses, since they are similar in terms of properties
function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
}





/////////////////////////////////////////////////////////////////////
// Function that return an object containing properties and methods for controlling all expenses
function expenseController() { //Later add Constructor argument to this
    
    return {
        allItems: [],
        total: 0,

        // Not using the same names here on purpose, do it's less confusing
        // We return the newItem so that we can use it in the controller (more specifically, to pass it to the UIController which displays it in the UI)
        addItem: function(Constructor, des, val, paymentStatus) {
            var newID, newItem;
            
            // This is necessary because deletions will change the order, so we always want the next id to be the last +1
            if (this.allItems.length > 0) {
                newID = this.allItems[this.allItems.length - 1].id + 1;
            } else {
                newID = 0;
            }
            
            // We will be able to use this also for the income, which does not have a payment status, because it does not matter to JS if we pass too many arguments
            newItem = new Constructor(newID, des, val, paymentStatus);
            this.allItems.push(newItem);
            return newItem;
        },
        // Later when we need to borrow the functions, add Constructor as an argument and replace Expense with it
        
        //Do some currying (partial application) with the addItem function: one for each Type
        

        deleteItem: function(id) {
            // We cannot simple do this.allItems[id] because ID are not in order because when an item gets deleted, we can have like 0 1 3 4 7

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
            var ids = this.allItems.map(function(current, index) {
                return current.id;
            })

            var index = ids.indexOf(id);

            if(index >= 0) {
                this.allItems.splice(index, 1); // Don't confuse with slice
            }
        },

        calculateTotal: function() {
            var sum = 0;
            this.allItems.forEach(function(current) {
                sum += current.value;
            });
            this.total = sum;
        },

        getTotal: function() {
            return this.total;
        },
        
        calculatePercentages: function(totalIncome) {
            this.allItems.forEach(function(current) {
                current.percentage = current.calculatePercentage(totalIncome);
            });
        },
        
        getPercentages: function() {
            var all = [];
            this.allItems.map(function(current) {
                all.push(current.percentage);
            });
            return all;
        }
    };
}




/////////////////////////////////////////////////////////////////////
// Function that returns an object containing properties for controlling all incomes. Methods will be borrowed from the expenseController
function incomeController() {
    
    return {
        allItems: [],
        total: 0
    };
} 





/////////////////////////////////////////////////////////////////////
// Function that returns an object containing properties and methods for manipulating the UI
function UIController() {
    
    return {
        DOMSelectors: {}, // Will be filled by the controller
        
        setDOMSelectors: function(DOM) {
            this.DOMSelectors = DOM;
        },
        
        displayMonth: function() {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var month = new Date().getMonth();
            
            document.querySelector(this.DOMSelectors.monthLabel).textContent = months[month];
        },
        
        getInput: function() {
            return {
                type: document.querySelector(this.DOMSelectors.inputType).value,
                description: document.querySelector(this.DOMSelectors.inputDescription).value,
                value: parseFloat(document.querySelector(this.DOMSelectors.inputValue).value),
                paymentStatus: document.querySelector(this.DOMSelectors.inputPaymentSatus).value
            };
        },
        
        clearFields: function() {
            // Just for showing sake: selecting many at once, convert to array using call and Array prototype (because it returns a list) and then iterate over that array with .forEach
            var fields = document.querySelectorAll(
                this.DOMSelectors.inputDescription + ', ' + this.DOMSelectors.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
            fieldsArr.forEach(function(current) {
                current.value = "";
            })
            
            // Put focus on description field
            fields[0].focus();
        },
        
        addListItem: function(obj, type) {
            var el, html;
            if (type === "expense") {
                el = this.DOMSelectors.expensesContainer;
                html = 
                    '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                html = html.replace('%percentage%', obj.percentage); // We replace this right here because it's uique to expenses
            } else {
                el = this.DOMSelectors.incomeContainer;
                html = 
                    '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.description);
            html = html.replace('%value%', this.formatNumber(obj.value, type));
            
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
            document.querySelector(el).insertAdjacentHTML('beforeend', html);
            
            // Add unpaid class
            if(obj.paymentStatus === 'unpaid') {
                document.querySelector('#' + type + '-' + obj.id).classList.add('unpaid')
            }
        },

        deleteListItem: function(selectorID) {
            // The only way we have is remove child, so we first need to move up to the parent and then delete the child
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },

        displayTotals: function(budget, incomeTotal, expensesTotal, percentage) {
            var type;
            budget >= 0 ? type = 'income' : type = 'expense';
            
            document.querySelector(this.DOMSelectors.budgetLabel).textContent = this.formatNumber(budget, type);
            document.querySelector(this.DOMSelectors.incomeLabel).textContent = this.formatNumber(incomeTotal, 'income');
            document.querySelector(this.DOMSelectors.expensesLabel).textContent = this.formatNumber(expensesTotal, 'expense');
            document.querySelector(this.DOMSelectors.expensesPercLabel).textContent = percentage + '%';
        },
        
        displayExpensePercentages: function(percentages) {
            // Better solution to loop over querySelectorAll results:
            //https://toddmotto.com/ditch-the-array-foreach-call-nodelist-hack/
            
            var fields = document.querySelectorAll(this.DOMSelectors.expensesPercentages);
            
            for (var i = 0; i < fields.length; i++) {
                fields[i].textContent = percentages[i] + '%';
            }
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
                this.DOMSelectors.inputType + ', ' +
                this.DOMSelectors.inputDescription + ', ' +
                this.DOMSelectors.inputValue + ', ' + 
                this.DOMSelectors.inputPaymentSatus);
            
            // Another way of looping over elements
            for (var i = 0; i < fields.length; i++) {
                fields[i].classList.toggle('red-focus');
            }
            
            document.querySelector(this.DOMSelectors.inputPaymentSatus).classList.toggle('hidden');
            document.querySelector(this.DOMSelectors.inputBtn).classList.toggle('red');
        },
        
        formatNumber: function(num, type) {
            // We want: a) + or - in front of number, b) exactly 2 decimal points, c) comma separating thousands
            
            var sign, numSplit, int, intL, decimal;
            num = Math.abs(num);
            num = num.toString();
            numSplit = num.split('.');
            
            // Integer part
            int = numSplit[0];
            intL = int.length;
            if (intL > 3) {
                int = int.substr(0, intL - 3) + ',' + int.substr(intL - 3, intL);
            }
            
            // Decimal part
            numSplit.length === 2 ? decimal = numSplit[1] : decimal = '00';
            if (decimal.length > 2) {
                decimal = decimal.substr(0,2);
            } else if (decimal.length === 1) {
                decimal = decimal + '0';
            }
            
            // Sign
            type === 'expense' ? sign = '-' : sign = '+';
            
            // Output
            return sign + ' ' + int + '.' + decimal;
        }
    };
}





/////////////////////////////////////////////////////////////////////
// Function that returns an object containing properties and methods for controlling the app. We do it with the function, instead of just having a plain object, because this way we can pass in the other controllers (or modules), making each of these controllers more isolated. So they don't knpw about the other names, they are all indepemndent from each other. This also shows us how a closure works: we call 'controller' with the other controllers as arguments, and then return an object containing a couple of functions that use these controllers, even AFTER the original controller function has stopped running. We still have access to the values that were passed into the function, and that is the closure. We closed in on these variables.
function controller(incCtrl, expCtrl, UICtrl, Inc, Exp) {
    return {
        DOMSelectors: {
            monthLabel:          '.budget__title--month',
            budgetLabel:         '.budget__value',
            incomeLabel:         '.budget__income--value',
            expensesLabel:       '.budget__expenses--value',
            expensesPercLabel:   '.budget__expenses--percentage',
            inputType:           '.add__type',
            inputDescription:    '.add__description',
            inputValue:          '.add__value',
            inputPaymentSatus:   '.add__payment-status',
            inputBtn:            '.add__btn',
            container:           '.container',
            incomeContainer:     '.income__list',
            expensesContainer:   '.expenses__list',
            expensesPercentages: '.item__percentage',
            deleteBtn:           '.item__delete'
        },

        init: function() {
            this.handleType();
            this.handleInputBtn();
            this.handleInputPressEnter()
            this.handleDelete();
            UICtrl.setDOMSelectors(this.DOMSelectors);
            UICtrl.displayMonth();
            UICtrl.displayTotals(0, 0, 0, '--');
        },
        
        // Only add this later
        handleType: function() {
            document.querySelector(this.DOMSelectors.inputType).addEventListener('change', function() {
                UICtrl.changedType()
            });
        },
        
        handleInputBtn: function() {
            var newItem, self = this;
            document.querySelector(this.DOMSelectors.inputBtn).addEventListener('click', function() {
                // 1. Get field input data
                var input = UICtrl.getInput();
                
                if (input.description !== "" && input.value !== "" && self.isNumeric(input.value)) {
                    
                    // 2. Add item to corresponding object controller
                    if (input.type === "expense") {
                        newItem = expCtrl.addItem(Exp, input.description, input.value, input.paymentStatus);
                        
                    } else if (input.type === "income") {
                        // Method borrowing, be setting the 'this' var to the object that want to borrow the method. We will simply not pass the payment status, which will then be set as undefined, and ignored by the function constructor.
                        newItem = expCtrl.addItem.call(incCtrl, Inc, input.description, input.value)
                    }
                    
                    // 3. Add the new item to the UI
                    UICtrl.addListItem(newItem, input.type);
                    
                    // 4. Update and show the new totals
                    self.updateTotals();
                    
                    // 5. Update and show all expense percentages
                    self.updateExpensePercentages();
                    
                    // 6. Clear the fields
                    UICtrl.clearFields();
                }
            });
        },
        
        handleInputPressEnter: function() {
            // We need this because the this keyword in a function inside a function points to the global object, not the this keyword that was defined before. So we store it in a separate variable, and self is a convention, or this
            var self = this; 
            document.addEventListener('keypress', function(event) {
                if (event.which === 13 || event.keyCode === 13) {
                    // We fake a click here because what we want to happen here is the exact same thing as what happens when we hit the input button
                    document.querySelector(self.DOMSelectors.inputBtn).click();
                }
            });
        },  
        
        handleDelete: function() {
            var newItem, self = this;
            document.querySelector(this.DOMSelectors.container).addEventListener('click', function(event) {
                var clickID, splitID, type, id
                //Leave the parent node out first. Not the cleanest solution, as we're relying very much on the DOM structure, basically hard coding it here. We could use a while loop instead
                clickID = event.target.parentNode.parentNode.parentNode.parentNode.id;
                
                // We can do this because there are no other IDs
                if (clickID) {
                    splitID = clickID.split('-');
                    type = splitID[0];
                    id = parseInt(splitID[1]);
                    
                    // 1. Delete item from model
                    if (type === 'expense') {
                        expCtrl.deleteItem(id);
                    } else {
                        expCtrl.deleteItem.call(incCtrl, id);
                    }
                    
                    // 2. Delete item from UI
                    UICtrl.deleteListItem(clickID);
                    
                    // 3. Update and show the new totals
                    self.updateTotals();
                    
                    // 4. Update and show all expense percentages
                    self.updateExpensePercentages();
                }
            });
        },
        
        updateTotals: function() {
            // We calculate the sums of all incomes and expenses, calculate the difference and call the function to update the UI with all the data
            expCtrl.calculateTotal();
            expCtrl.calculateTotal.call(incCtrl);
            budget = this.calculateBudget();
            
            UICtrl.displayTotals(budget.budget, expCtrl.getTotal.call(incCtrl), expCtrl.getTotal(), budget.percentage);
        },
        
        calculateBudget: function() {
            var budget, percentage;
            
            budget = expCtrl.getTotal.call(incCtrl) - expCtrl.getTotal();
            
            if(expCtrl.getTotal.call(incCtrl) > 0) {
                percentage = Math.round(expCtrl.getTotal() / expCtrl.getTotal.call(incCtrl) * 100);
            } else {
                percentage = '--';
            }

            return {
                budget: budget,
                percentage: percentage
            };
        },
        
        updateExpensePercentages: function() {
            // We calculate the percentages of each income, passing the total income, then retreieve these percentages, and finally display them on th UI
            expCtrl.calculatePercentages(expCtrl.getTotal.call(incCtrl));
            var perc = expCtrl.getPercentages();
            UICtrl.displayExpensePercentages(perc);
        },
        
        // Sometimes we don't know anything, so we google it, devs do this all the time "javascript validate numbers"
        // http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    };
}







/////////////////////////////////////////////////////////////////////

var exp = expenseController(Expense);
var inc = incomeController(Income);
var UI = UIController();
var ctrl = controller(inc, exp, UI, Income, Expense);

ctrl.init()




/*
var e1 = new Expense(0, 'Dining', 45);
var in1 = new Income(0, 'Salary', 1900);

e1.getValue() // 45
e1.getValue.call(in1) // 1900
Expense.prototype.getValue.call(in1) // 1900
*/

/*
My goal with this is not to make you copy the code and then make your own similar applications. What I want, is you to learn how to program, and how to think as a programmer, how to use these tools to solve the particular problems that you might have to solve in your case. So while this code and this small simple architecure is good for this project, it might not be in your case. But that's okay, because, once again, this project is just to show you how to use the tools JavaScript gives us.

So once again, this is a very simple app. If you have a more complex app you wanna build, you're probably going to use some grameowrk or library like Angular or React. And that's fine, but you still will have to understand JavaScript, and that's what this course and this project is for.


*/
>>>>>>> 0670e321fc038ce29aa0807a979e549b83888306
