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