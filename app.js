var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id) {
            data.allItems[type] = data.allItems[type].filter(function(current) {
                return current.id !== id;
            });
            console.log(data.allItems);
        },
        calculateBudget: function() {

            //  calculate budget and total expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //  calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //  calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        printData: function() {
            return data.allItems;
        }
    };
})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {
        var numSplit, dec, int, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = parseInt(numSplit[0]);
        dec = numSplit[1];
        int = int.toLocaleString()
 
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    }

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function(obj, type) {

            var html, newHtml, element;

            //  Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                // html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                html = `<div class="item clearfix" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            } else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                // html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                html = `<div class="item clearfix" id="exp-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            }
            
            //  Replace placeholder text with some actual data
            // var newHtml = html.replace('%id%', obj.id);
            // newHtml = newHtml.replace('%description%', obj.description);
            // newHtml = newHtml.replace('%value%', obj.value);

            //  Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },
        deleteListItem: function(itemID) {
            var el = document.getElementById(itemID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp);
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + " %";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '';
            }
            
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 1) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
                
            });
        },
        displayDate: function() {
            var now = new Date();
            // var month = now.getMonth();
            // var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = now.toDateString();
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');  
        },  
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if(event.keyCode == 13 || event.which == 13) {
                event.preventDefault();
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function() {

        //  Calculate the budget
        budgetCtrl.calculateBudget();

        //  Return the budget
        var budget = budgetCtrl.getBudget();

        //  Display the budget on UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function() {
        //  Calculate percentages
        budgetCtrl.calculatePercentages();

        //  Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        //  Add UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {

        //  Get the field input data
        var input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //  Add item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //  Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            //  Clear the fields
            UICtrl.clearFields();

            //  Calculate and update the budget
            updateBudget();

            //  Calculate and update percentages
            updatePercentages();
        } 
    }

    var ctrlDeleteItem = function(event) {
        
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            var splitID = itemID.split('-');
            var type = splitID[0];
            var id = parseInt(splitID[1]);

            //  Delete item from data structrue 
            budgetCtrl.deleteItem(type, id);

            //  Delete item from UI 
            UICtrl.deleteListItem(itemID);

            //  Update and show new budget
            updateBudget();

            //  Update percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            console.log('Application has started !');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayDate();
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();















