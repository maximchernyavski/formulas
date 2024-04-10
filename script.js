// Лабораторная работа N1 по дисциплине ЛОИС
// Выполнена студенткой группы 221703 БГУИР Пикановой А.Д.
// Выполнена студентом группы 221703 БГУИР Чернявским М.С.
// Алгоритмы, функции и классы для работы программы.

/** @function initAlphabet
 * @desc Function to initialise alphabet of the abbreviated language of propositional logic.
 * 
 * @returns {string[]} The alphabet of capital Latin letters and constants(1 and 0).
 */
function initAlphabet() {
    const alphabet = [];

    for(let i = 65; i < 91; i += 1) {
        alphabet.push(String.fromCharCode(i));
    };
    alphabet.push('1', '0');
    console.log('Alphabet was initialised');

    return alphabet;
};

const alphabet = new Set(initAlphabet());
const operations = ['!', '∧', '∨', '➔', '~'];
allowAdditionalLanguage = false;

//Setting constants for easy access for all necessarily UI elements.
const displayedOperationsKeyboard = document.getElementById('operations_keyboard');
const operationsKeyboardButton = document.getElementById('operations_keyboard_button');
const additionalOperations = document.getElementById('additional_operations');
const additionalLanguageButton = document.getElementById('additional_language');
const mainField = document.getElementById('main_field');
const submitButton = document.getElementById('submit_button');
const depthSelector = document.getElementById('depth_input');
const outputField = document.getElementById('center_column');


//Event that creates operations with buttons and options for depth selector.
window.addEventListener('load', () => {
    createOperations();
    createOptions();
}, { once: true });

operationsKeyboardButton.addEventListener('click', handleOperationKeyboardClick);
additionalLanguageButton.addEventListener('click', handleAdditionalLanguageClick);
depthSelector.addEventListener('focus', handleDepthSelectorFocus);
depthSelector.addEventListener('change', handleDepthSelectorChange);
submitButton.addEventListener('click', handleSubmitButtonClick);

class FormulaTree{
    maxDepth;
    left = null;
    right = null;

    /** @class FormulaTree
     * @classdesc Class for processing formula as binary tree.
     * @param {*} text Text that will be placed as node formula.
     * @param {number} depth Depth of this node.
     */
    constructor(text, depth = 1) {
        this.formula = text;
        this.depth = depth;
    };

    /** @method findOnDepth
     * @memberof FormulaTree
     * @inner
     * @param {number} depth Depth of formulas, that should be found.
     * @returns {string[]} List of founded subformulas.
     * @desc Recursive method that returns all formulas on the depth of the tree.
     */
    findOnDepth(depth) {
        if(depth < 0 || depth > this.maxDepth) return [];
        if(this.depth === depth) return [this.formula];

        const temp1 = [];
        const temp2 = [];
        if(this.left != null) temp1.push(...this.left.findOnDepth(depth));
        if(this.right != null) temp2.push(...this.right.findOnDepth(depth));
        return [...temp1, ...temp2];
    };

    /** @method findMaxDepth
     * @memberof FormulaTree
     * @inner
     * @returns {number} Maximum depth of tree.
     * @desc Recursive method that returns maximum depth of tree by scoping to the bottom.
     */
    findMaxDepth() {
        let left = 0;
        let right = 0;
        if(this.left === null && this.right === null) return this.depth;
        if(this.left != null) {
            left += this.left.findMaxDepth();
        }
        if(this.right != null) {
            right += this.right.findMaxDepth();
        }
        return left > right ? left : right;
    };

    /** @method setMaxDepth
     * @memberof FormulaTree
     * @inner
     * @desc Method that sets nodes maxDepth.
     */
    setMaxDepth() {
        this.maxDepth = this.findMaxDepth();
    };
};

class Formula{
    formula;
    root = null;

    /** @class Formula
     * @classdesc Class for creating, checking, processing formula and building tree of its subformulas.
     * 
     * @param {*} formula Formula that will be placed as this formula.
     * @property {FormulaTree} root Root of this formula subformulas tree.
     * @desc Constructor sets the formula and creates validation alphabet for object.
     */
    constructor(formula) {
        console.log('Created formula');
        this.formula = formula;
        this.validationAlphabet = new Set([...Array.from(alphabet), ...operations, '(', ')']);
    };

    /** @method validateAlphabet
     * @memberof Formula
     * @inner
     * 
     * @returns {number} The result of the check.
     * @desc Method that returns 0, if formula contains errors, else 1.<br>
     * Method checks if every element of formula is in validation alphabet.
     */
    validateAlphabet() {
        if(this.formula.length === 0) return false;
        let brackets = 0;
        for(let i = 0; i < this.formula.length; i += 1) {
            if(!this.validationAlphabet.has(this.formula[i])) {
                return false;
            }
            if(this.formula[i] === '(') {
                brackets += 1;
            }
            if(this.formula[i] === ')') {
                brackets -= 1;
            }
        }

        return brackets === 0;
    };

    /** @method replaceOperations
     * @memberof Formula
     * @inner
     * @desc Method that replaces handwritten operations with UTF-8 analogs.
     */
    replaceOperations() {
        this.formula = this.formula.replaceAll('->', '➔');
        this.formula = this.formula.replaceAll('/\\', '∧');
        this.formula = this.formula.replaceAll('\\/', '∨');
    };

    /** @method getSubFormula
     * @memberof Formula
     * @inner
     * 
     * @param {number} ind Starting index of search.
     * @param {string} formula Formula that is the source for search.
     * @returns {Array<string, number>} List of founded subformula and index of last element of subformula.
     * 
     * @desc Method that gets subformula between opening and closing brackets.<br>
     * If the first element of the subformula isn't the opening bracket than we should expect the atomary formula
     * or we return empty list, else we should get all elements between opening and closing brackets, however if brackets 
     * ammount is wrong, we also return empty list.
     */
    getSubFormula(ind = 0, formula = this.formula) {
        let temp = '';
        let bracketsSum = 0;
        if(formula[ind] != '(') {
            if(alphabet.has(formula[ind])) return [formula[ind], ind];
            return [];
        }
        while(formula[ind] != ')' || bracketsSum != 0) {
            if(formula[ind] === '(') {
                bracketsSum += 1;
            }
            if(formula[ind] === ')') {
                bracketsSum -= 1;
            }
            temp += formula[ind];
            if(bracketsSum === 0) break;
            if(ind === formula.length-1) return [];
            ind += 1;
        }
        return [temp, ind];
    };

    /** @method buildTree
     * @memberof Formula
     * @inner
     * 
     * @param {string} formula Formula that will be processed.
     * @param {number} depth Current depth.
     * @returns {FormulaTree} The root of builded tree or null.
     * 
     * @desc Recursive method that builds and verifies the formula.<br>
     * For formula we have the limited ammount of formula constructions that are:<br>
     * AF or (...)<br>
     * (!AF) or (!(...))<br>
     * (AF BO AF) or ((...) BO (...)).<br>
     * AF - Atomary Formula, BO - Binary Operation, (...) - Complex Formula.<br>
     * Method checks for every possible situation for founded subformulas, hovewer if we spot the error,
     * we return null.
     */
    buildTree(formula = this.formula, depth = 1) {
        let ind = 0;
        let branch = null;
        // Checks for AF.
        if(formula[ind] != '(') { 
            return (alphabet.has(formula[ind]) && formula.length === 1) ? new FormulaTree(formula[ind], depth) : null;
        }
        let temp = this.getSubFormula(ind, formula); //Getting subformula.
        if(!temp.length) return null; //Checks if subformula is correct.
        const root = new FormulaTree(temp[0], depth);
        ind += 1;
        depth += 1;
        //Checks for (!AF) or (!(...)).
        if(formula[ind] === '!') { 
            if(formula[ind + 1] === '(') {
                let temp2 = this.getSubFormula(ind+1, formula);
                if(operations.includes(formula[temp2[1]+1])) return null;
                branch = this.buildTree(temp2[0], depth); //Checks if subformula is correct formula.
                if(branch === null) return null;
                root.left = branch;
                root.right = null;
                return root;
            }
            if(!alphabet.has(formula[ind + 1])) return null;
            branch = this.buildTree(formula[ind+1], depth);
            if(branch === null) return null;
            root.left = branch;
            return root;
        };
        //Checks for (AF BO AF) or ((...) BO (...)).
        if(operations.includes(formula[temp[1] + 1])) return null;
        temp = this.getSubFormula(ind, formula);
        if(!temp.length) return null;
        ind = temp[1];
        if(!operations.includes(formula[ind + 1]) || formula[ind+1] === '!') return null; //Checking for operation after 1-st operand.
        branch = this.buildTree(temp[0], depth);
        if(branch === null) return null;
        root.left = branch;
        ind += 2;
        temp = this.getSubFormula(ind, formula);
        ind = temp[1];
        if(operations.includes(formula[ind + 1])) return null; //Checking if there is operation after 2-nd operand.
        if(!temp.length) return null;
        branch = this.buildTree(temp[0], depth);
        if(branch === null) return null;
        root.right = branch;

        return root;
    };

    /** @method renewFormula
     * @memberof Formula
     * @inner
     * 
     * @param {string} formula Formula that will be set as new formula.
     * @desc Method that updates fields of formula object and checks if they are correct.<br>
     * We check if formula is correct and if it is, we update formula fields, else null.
     */
    renewFormula(formula) {
        if(!allowAdditionalLanguage){
            let check = Array.from(formula);
            if(check.some(el => {return ['∧', '∨', '➔'].includes(el)})){
                outputField.innerHTML += 'Grammar failure.<br>';
                return this.root = null;
            }
        };
        this.formula = formula;
        this.replaceOperations();
        if(this.validateAlphabet()) {
            this.root = this.buildTree();
        }
        else{
            outputField.innerHTML += 'Grammar failure.<br>';
            return this.root = null;
        }
        if(this.root === null) {
            outputField.innerHTML += 'Formula is wrong.<br>';
            return this.root = null;
        }
        this.root.setMaxDepth();
        outputField.innerHTML += `Entered formula: ${this.formula} <br>`;
    };

    /** @method getOnDepth
     * @memberof Formula
     * @inner
     * 
     * @param {number} depth Depth of subformulas.
     * @desc Method that displays all subformulas of depth.
     */
    getOnDepth(depth) {
        let res = this.root.findOnDepth(depth);
        outputField.innerHTML += `Formulas with depth ${depth}(Ammount of subformulas: ${res.length}): <br>${res.join(',')}<br>`;
    }
};

const formula = new Formula('');

function handleDepthSelectorFocus(e) {
    e.preventDefault();

    for(let i = 1; i < 22; i += 1) {
        if(i <= formula.root.maxDepth) {
            depthSelector.options[i].style.display = 'block';
        }
        else{
            depthSelector.options[i].style.display = 'none';
        }
    }
}

function handleDepthSelectorChange() {
    formula.getOnDepth(Number(depthSelector.value));
}

function handleSubmitButtonClick(e) {
    e.preventDefault();

    formula.renewFormula(mainField.value);
    depthSelector.options[0].selected = 'selected';

    depthSelector.style.display = formula.root === null ? 'none' : 'block';
    console.log('state');
}

function handleAdditionalLanguageClick(){
    additionalOperations.style.display = additionalOperations.style.display === 'none' ? 'block' : 'none';
    allowAdditionalLanguage = !allowAdditionalLanguage;
    additionalLanguageButton.classList.toggle('active');
}

function handleOperationKeyboardClick() {
    displayedOperationsKeyboard.style.display = displayedOperationsKeyboard.style.display === 'none' ? 'block' : 'none';
    operationsKeyboardButton.classList.toggle('active');
}

function createOperations() {
    for(let i = 0; i < operations.length; i += 1) {
        displayedOperationsKeyboard.appendChild(createOperationsButton(operations[i]));
    };
    console.log('Operations generated');
};

function createOperationsButton(symbol) {
    const button = document.createElement('button');
    button.classList.add('operation_button');
    button.appendChild(document.createTextNode(symbol));
    button.addEventListener('click', () => {
        mainField.value = mainField.value.slice(0, mainField.selectionStart) + symbol + mainField.value.slice(mainField.selectionStart, mainField.value.length);
    });

    return button;
};

function createOptions() {
    for(let i = 1; i < 22; i += 1) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        if(i > 10) opt.style.display = 'none';
        depthSelector.appendChild(opt);
    }
};
