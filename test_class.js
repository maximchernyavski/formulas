// Лабораторная работа N1 по дисциплине ЛОИС
// Выполнена студенткой группы 221703 БГУИР Пикановой А.Д.
// Выполнена студентом группы 221703 БГУИР Чернявским М.С.
// Классы отделенные от интерфейса для тестирования.

function initAlphabet() {
  const alphabet = [];

  for(let i = 65; i < 91; i += 1) {
      alphabet.push(String.fromCharCode(i));
  };
  alphabet.push('1', '0');

  return alphabet;
};

const alphabet = new Set(initAlphabet());
const operations = ['!', '∧', '∨', '➔', '~'];

class FormulaTree{
  maxDepth;
  left = null;
  right = null;

  constructor(text, depth = 1) {
      this.formula = text;
      this.depth = depth;
  };

  findOnDepth(depth) {
      if(depth < 0 || depth > this.maxDepth) return [];  
      if(this.depth === depth) return [this.formula];

      const temp1 = [];
      const temp2 = [];
      if(this.left != null) temp1.push(...this.left.findOnDepth(depth));
      if(this.right != null) temp2.push(...this.right.findOnDepth(depth));
      return [...temp1, ...temp2];
  };

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

  setMaxDepth() {
      this.maxDepth = this.findMaxDepth();
  };
};

class Formula{
    formula;
    root = null;

    constructor(formula) {
        this.formula = formula;
        this.validationAlphabet = new Set([...Array.from(alphabet), ...operations, '(', ')']);
    };

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

    replaceOperations() {
        this.formula = this.formula.replaceAll('->', '➔');
        this.formula = this.formula.replaceAll('/\\', '∧');
        this.formula = this.formula.replaceAll('\\/', '∨');
    };

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

    buildTree(formula = this.formula, depth = 1) {
        let ind = 0;
        let branch = null;

        if(formula[ind] != '(') { 
            return (alphabet.has(formula[ind]) && formula.length === 1) ? new FormulaTree(formula[ind], depth) : null;
        }
        let temp = this.getSubFormula(ind, formula); 
        if(!temp.length || formula[temp[1] + 1]) return null; 
        const root = new FormulaTree(temp[0], depth);
        ind += 1;
        depth += 1;
        
        if(formula[ind] === '!') { 
            if(formula[ind + 1] === '(') {
                let temp2 = this.getSubFormula(ind+1, formula);
                if(operations.includes(formula[temp2[1]+1])) return null;
                branch = this.buildTree(temp2[0], depth); 
                if(branch === null) return null;
                root.left = branch;
                return root;
            }
            if(!alphabet.has(formula[ind + 1])) return null;
            branch = this.buildTree(formula[ind+1], depth);
            if(branch === null) return null;
            root.left = branch;
            return root;
        };
     
        if(operations.includes(formula[temp[1] + 1])) return null;
        temp = this.getSubFormula(ind, formula);
        if(!temp.length) return null;
        ind = temp[1];
        if(!operations.includes(formula[ind + 1]) || formula[ind+1] === '!') return null; 
        branch = this.buildTree(temp[0], depth);
        if(branch === null) return null;
        root.left = branch;
        ind += 2;
        temp = this.getSubFormula(ind, formula);
        ind = temp[1];
        if(operations.includes(formula[ind + 1])) return null; 
        if(!temp.length || !(formula[temp[1] + 1] === ')' && temp[1] + 1 === formula.length - 1)) return null;
        branch = this.buildTree(temp[0], depth);
        if(branch === null) return null;
        root.right = branch;

        return root;
    };

  renewFormula(formula) {
      this.formula = formula;
      this.replaceOperations();
      if(this.validateAlphabet()) {
          this.root = this.buildTree();
      }
      else{
          return this.root = null;
      }
      if(this.root === null) {
          return this.root;
      }
      this.root.setMaxDepth();
  };

  getOnDepth(depth) {
      let res = this.root.findOnDepth(depth);
      return res;
  }
};

module.exports = {Formula, FormulaTree};