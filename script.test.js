const test = require('./test_class');
const Formula = test.Formula;
const FormulaTree = test.FormulaTree;

describe('Formula class', () => {
  describe('validateAlphabet method', () => {
    it('handles invalid characters', () => {
      const formula = new Formula('(a->])');
      expect(formula.validateAlphabet()).toBe(false);

      formula.formula = '(A➔b)';
      expect(formula.validateAlphabet()).toBe(false);
    });

    it('handles wrong ammount of brackets', () => {
      const formula = new Formula('((!A)');
      expect(formula.validateAlphabet()).toBe(false);

      formula.formula = '(A➔b))';
      expect(formula.validateAlphabet()).toBe(false);
    })

    it('handles empty string', () => {
      const formula = new Formula('');
      expect(formula.validateAlphabet()).toBe(false);
    });

    it('handles correct unary formula', () => {
      const formula = new Formula('(!A)');
      expect(formula.validateAlphabet()).toBe(true);
    });

    it('handles correct atomary formula', () => {
      const formula = new Formula('A');
      expect(formula.validateAlphabet()).toBe(true);
    });

    it('handles correct binary formula', () => {
      const formula = new Formula('(A➔B)');
      expect(formula.validateAlphabet()).toBe(true);
    });

    it('handles correct complex binary formula', () => {
      const formula = new Formula('((A➔B)∨(C∧D))');
      expect(formula.validateAlphabet()).toBe(true);
    });
  });

  describe('getSubFormula method', () => {
    it('handles wrong atomary formula', () => {
      const formula = new Formula('a');
      expect(formula.getSubFormula()).toStrictEqual([]);
    });

    it('handles no open bracket', () => {
      const formula = new Formula('!');
      expect(formula.getSubFormula()).toStrictEqual([]);

      formula.formula = ')';
      expect(formula.getSubFormula()).toStrictEqual([]);
    });

    it('handles atomary formula', () => {
      const formula = new Formula('A');
      expect(formula.getSubFormula()).toStrictEqual(['A', 0]);
    });

    it('handles wrong amount of brackets', () => {
      const formula = new Formula('(A➔B');
      expect(formula.getSubFormula()).toStrictEqual([]);

      formula.formula = '((A➔B)∨(C∧D)';
      expect(formula.getSubFormula()).toStrictEqual([]);
    });

    it('handles subformula from the middle', () => {
      const formula = new Formula('((A➔B)∨(C∧D))');
      expect(formula.getSubFormula(7)).toStrictEqual(['(C∧D)', 11]);
    });
  });

  describe('buildTree method', () => {
    it('handle atomary formula', () => {
      const formula = new Formula('A');
      expect(formula.buildTree()).toStrictEqual(new FormulaTree('A', 0));
    });

    it('handles wrong unary formula',  () => {
      const formula = new Formula('(!a)');
      expect(formula.buildTree()).toStrictEqual(null);
    });

    it('handles unary formula', () => {
      const formula = new Formula('(!A)');
      let res = new FormulaTree('(!A)');
      res.left = new FormulaTree('A', 1);
      expect(formula.buildTree()).toStrictEqual(res);
    });

    it('handles formula with wrong amount of brackets', () => {
      const formula = new Formula('(A➔B');
      expect(formula.buildTree()).toStrictEqual(null);

      formula.formula = '((A➔B)∨(C∧D)';
      expect(formula.buildTree()).toStrictEqual(null);

      formula.formula = '((A➔B)∨(C∧D)';
      expect(formula.buildTree()).toStrictEqual(null);

      formula.formula = '(!(A➔B)∨(C∧D))';
      expect(formula.buildTree()).toStrictEqual(null);
    });

    it('handles binary formula', () => {
      const formula = new Formula('(A∧B)');
      formula.root = formula.buildTree();
      expect(formula.root.formula).toStrictEqual('(A∧B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');

      formula.formula = '(A∨B)';
      formula.root = formula.buildTree();
      expect(formula.root.formula).toStrictEqual('(A∨B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');

      formula.formula = '(A➔B)';
      formula.root = formula.buildTree();
      expect(formula.root.formula).toStrictEqual('(A➔B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
      
      formula.formula = '(A~B)';
      formula.root = formula.buildTree();
      expect(formula.root.formula).toStrictEqual('(A~B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
    });

    it('handles wrong complex binary formula', () => {
      const formula = new Formula('((A➔B)~(C∧D)');
      formula.root = formula.buildTree();
      expect(formula.root).toStrictEqual(null);

      formula.formula = '((A➔B~(C∧D))';
      formula.root = formula.buildTree();
      expect(formula.root).toStrictEqual(null);

      formula.formula = '((A➔B)(C∧D))';
      formula.root = formula.buildTree();
      expect(formula.root).toStrictEqual(null);

      formula.formula = '((AB)~(C∧D))';
      formula.root = formula.buildTree();
      expect(formula.root).toStrictEqual(null);

      formula.formula = '((A➔B)~(CD))';
      formula.root = formula.buildTree();
      expect(formula.root).toStrictEqual(null);
    });

    it('handles complex binary formula', () => {
      const formula = new Formula('((A➔B)~(C∧D))')
      formula.root = formula.buildTree();
      expect(formula.root.formula).toStrictEqual('((A➔B)~(C∧D))');
      expect(formula.root.left.formula).toStrictEqual('(A➔B)');
      expect(formula.root.right.formula).toStrictEqual('(C∧D)');
      expect(formula.root.left.left.formula).toStrictEqual('A');
      expect(formula.root.left.right.formula).toStrictEqual('B');
      expect(formula.root.right.left.formula).toStrictEqual('C');
      expect(formula.root.right.right.formula).toStrictEqual('D');
    });
  });

  describe('renewFormula method', () => {
    it('handles not UTF-8 operations', () => {
      const formula = new Formula('');
      formula.renewFormula('(A->B)');
      expect(formula.root.formula).toStrictEqual('(A➔B)');
      expect(formula.root.maxDepth).toBe(1);

      formula.renewFormula('(A\\/B)');
      expect(formula.root.formula).toStrictEqual('(A∨B)');
      expect(formula.root.maxDepth).toBe(1);

      formula.renewFormula('(A/\\B)');
      expect(formula.root.formula).toStrictEqual('(A∧B)');
      expect(formula.root.maxDepth).toBe(1);
    });

    it('handles wrong formula', () => {
      const formula = new Formula('');
      formula.renewFormula('a');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('!a');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('(!a)');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('((A➔B)~(C∧D)');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('((A➔B~(C∧D))');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('((AB)~(C∧D))');
      expect(formula.root).toStrictEqual(null);
    });

    it('handles binary formula', () => {
      const formula = new Formula('(A∧B)');
      formula.renewFormula('(A∧B)');
      expect(formula.root.formula).toStrictEqual('(A∧B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
      expect(formula.root.maxDepth).toBe(1);

      formula.renewFormula('(A∨B)');
      expect(formula.root.formula).toStrictEqual('(A∨B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
      expect(formula.root.maxDepth).toBe(1);

      formula.renewFormula('(A➔B)');
      expect(formula.root.formula).toStrictEqual('(A➔B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
      expect(formula.root.maxDepth).toBe(1);
      
      formula.renewFormula('(A~B)');
      expect(formula.root.formula).toStrictEqual('(A~B)');
      expect(formula.root.left.formula).toStrictEqual('A');
      expect(formula.root.right.formula).toStrictEqual('B');
      expect(formula.root.maxDepth).toBe(1);
    });

    it('handles atomary formula', () => {
      const formula = new Formula('');
      formula.renewFormula('A');
      expect(formula.root.formula).toStrictEqual('A');
      expect(formula.root.maxDepth).toBe(0);
    });

    it('handles unary formula', () => {
      const formula = new Formula('');
      formula.renewFormula('(!A)');
      expect(formula.root.formula).toStrictEqual('(!A)');
      expect(formula.root.maxDepth).toBe(1);
    });

    if('handles wrong unary formula', () => {
      const formula = new Formula('');
      formula.renewFormula('!A');
      expect(formula.root).toStrictEqual(null);

      formula.renewFormula('(!a)');
      expect(formula.root).toStrictEqual(null);
    });
  });

  describe('getOnDepth method', () => {
    it('handles finding on depth', () => {
      const formula = new Formula('');
      formula.renewFormula('(A->B)');
      expect(formula.getOnDepth(0)).toStrictEqual(['(A➔B)']);
      expect(formula.getOnDepth(1)).toStrictEqual(['A', 'B']);

      formula.renewFormula('((A->B)~(C/\\D))');
      expect(formula.getOnDepth(0)).toStrictEqual(['((A➔B)~(C∧D))']);
      expect(formula.getOnDepth(1)).toStrictEqual(['(A➔B)', '(C∧D)']);
      expect(formula.getOnDepth(2)).toStrictEqual(['A', 'B', 'C', 'D']);
    });
  });
});

describe('FormulaTree class', () => {
  describe('findOnDepth method', () => {
    it('hanles only left', () => {
      let root = new FormulaTree('ac');
      root.left = new FormulaTree('a', 1);
      root.left.left = new FormulaTree('c', 2);
      expect(root.findOnDepth(1)).toStrictEqual(['a']);
      expect(root.findOnDepth(2)).toStrictEqual(['c']);

      root = new FormulaTree('abcdrfgh');
      root.left = new FormulaTree('abcdrfg', 1);
      root.left.left = new FormulaTree('abcdrf', 2);
      root.left.left.left = new FormulaTree('abcdr', 3);
      root.left.left.left.left = new FormulaTree('abcd', 4);
      root.left.left.left.left.left = new FormulaTree('abc', 5);
      root.left.left.left.left.left.left = new FormulaTree('ab', 6);
      root.left.left.left.left.left.left.left = new FormulaTree('a', 7);
      expect(root.findOnDepth(0)).toStrictEqual(['abcdrfgh']);
      expect(root.findOnDepth(1)).toStrictEqual(['abcdrfg']);
      expect(root.findOnDepth(2)).toStrictEqual(['abcdrf']);
      expect(root.findOnDepth(3)).toStrictEqual(['abcdr']);
      expect(root.findOnDepth(4)).toStrictEqual(['abcd']);
      expect(root.findOnDepth(5)).toStrictEqual(['abc']);
      expect(root.findOnDepth(6)).toStrictEqual(['ab']);
      expect(root.findOnDepth(7)).toStrictEqual(['a']);
    });

    it('handles only right', () => {
      let root = new FormulaTree('ac');
      root.right = new FormulaTree('a', 1);
      root.right.right = new FormulaTree('c', 2);
      expect(root.findOnDepth(1)).toStrictEqual(['a']);
      expect(root.findOnDepth(2)).toStrictEqual(['c']);

      root = new FormulaTree('abcdrfgh');
      root.right = new FormulaTree('abcdrfg', 1);
      root.right.right = new FormulaTree('abcdrf', 2);
      root.right.right.right = new FormulaTree('abcdr', 3);
      root.right.right.right.right = new FormulaTree('abcd', 4);
      root.right.right.right.right.right = new FormulaTree('abc', 5);
      root.right.right.right.right.right.right = new FormulaTree('ab', 6);
      root.right.right.right.right.right.right.right = new FormulaTree('a', 7);
      expect(root.findOnDepth(0)).toStrictEqual(['abcdrfgh']);
      expect(root.findOnDepth(1)).toStrictEqual(['abcdrfg']);
      expect(root.findOnDepth(2)).toStrictEqual(['abcdrf']);
      expect(root.findOnDepth(3)).toStrictEqual(['abcdr']);
      expect(root.findOnDepth(4)).toStrictEqual(['abcd']);
      expect(root.findOnDepth(5)).toStrictEqual(['abc']);
      expect(root.findOnDepth(6)).toStrictEqual(['ab']);
      expect(root.findOnDepth(7)).toStrictEqual(['a']);
    });

    it('handles incorect depth', () => {
      let root = new FormulaTree('ac');
      root.right = new FormulaTree('a', 1);
      root.right.left = new FormulaTree('c', 2);
      expect(root.findOnDepth(-2)).toStrictEqual([]);
      expect(root.findOnDepth(0)).toStrictEqual(['ac']);
      expect(root.findOnDepth(3)).toStrictEqual([]);

      root = new FormulaTree('abcdrfgh');
      root.right = new FormulaTree('abcdrfg', 1);
      root.right.left = new FormulaTree('abcdrf', 2);
      root.right.right = new FormulaTree('abcdr', 2);
      root.right.right.left = new FormulaTree('abcd', 3);
      root.right.right.right = new FormulaTree('abc', 3);
      root.right.right.right.right = new FormulaTree('ab', 4);
      root.right.right.right.left = new FormulaTree('a', 4);
      expect(root.findOnDepth(2)).toStrictEqual(['abcdrf', 'abcdr']);
      expect(root.findOnDepth(-2)).toStrictEqual([]);
      expect(root.findOnDepth(5)).toStrictEqual([]);
    });
  });

  describe('findMaxDepth method', () => {
    it('handles only left', () => {
      let root = new FormulaTree('ac');
      root.left = new FormulaTree('a', 1);
      root.left.left = new FormulaTree('c', 2);
      expect(root.findMaxDepth()).toBe(2);

      root = new FormulaTree('abcdrfgh');
      root.left = new FormulaTree('abcdrfg', 1);
      root.left.left = new FormulaTree('abcdrf', 2);
      root.left.left.left = new FormulaTree('abcdr', 3);
      root.left.left.left.left = new FormulaTree('abcd', 4);
      root.left.left.left.left.left = new FormulaTree('abc', 5);
      root.left.left.left.left.left.left = new FormulaTree('ab', 6);
      root.left.left.left.left.left.left.left = new FormulaTree('a', 7);
      expect(root.findMaxDepth()).toBe(7);
    });
    it('handles only right', () => {
      let root = new FormulaTree('ac');
      root.right = new FormulaTree('a', 1);
      root.right.right = new FormulaTree('c', 2);
      expect(root.findMaxDepth()).toBe(2);

      root = new FormulaTree('abcdrfgh');
      root.right = new FormulaTree('abcdrfg', 1);
      root.right.right = new FormulaTree('abcdrf', 2);
      root.right.right.right = new FormulaTree('abcdr', 3);
      root.right.right.right.right = new FormulaTree('abcd', 4);
      root.right.right.right.right.right = new FormulaTree('abc', 5);
      root.right.right.right.right.right.right = new FormulaTree('ab', 6);
      root.right.right.right.right.right.right.right = new FormulaTree('a', 7);
      expect(root.findMaxDepth()).toBe(7);
    });
    it('handles tree', () => {
      let root = new FormulaTree('ac');
      root.right = new FormulaTree('a', 1);
      root.right.left = new FormulaTree('c', 2);
      expect(root.findMaxDepth()).toBe(2);

      root = new FormulaTree('abcdrfgh');
      root.right = new FormulaTree('abcdrfg', 1);
      root.right.left = new FormulaTree('abcdrf', 2);
      root.right.right = new FormulaTree('abcdr', 2);
      root.right.right.left = new FormulaTree('abcd', 3);
      root.right.right.right = new FormulaTree('abc', 3);
      root.right.right.right.right = new FormulaTree('ab', 4);
      root.right.right.right.left = new FormulaTree('a', 4);
      expect(root.findMaxDepth()).toBe(4);
    });
    if('handles root only', () => {
      const root = new FormulaTree('asdfgh');
      expect(root.findMaxDepth()).toBe(0);
    });
  });
});