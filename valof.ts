// @ts-ignore
type EExp = ESymbol | EFunction | EApplication | EAdd | ENumber;
type ESymbol = string;
// @ts-ignore
type EFunction = ["lambda", [string], EExp];
// @ts-ignore
type EApplication = [EExp, EExp];
// @ts-ignore
type EAdd = ["add", EExp, EExp];
type ENumber = number
type LookupTable = (sym: ESymbol) => any;

/**
 * Predicates
 */
function isEExp(e: EExp): e is EExp {
    return isESymbol(e)
        || isENumber(e)
        || isEAdd(e)
        || isEFunction(e)
        || isEApplication(e);
}

function isESymbol(e: EExp): e is ESymbol {
    return typeof e === "string";
}

function isEFunction(e: EExp): e is EFunction {
    return Array.isArray(e)
        && e.length === 3
        && e[0] === "lambda"
        && Array.isArray(e[1])
        && isEExp(e[2]);
}

function isEApplication(e: EExp): e is EApplication {
    return Array.isArray(e)
        && e.length === 2
        && isEExp(e[0])
        && isEExp(e[1]);
}

function isENumber(e: EExp): e is ENumber {
    return typeof e === "number";
}

function isEAdd(e: EExp): e is EAdd {
    return Array.isArray(e)
        && e.length === 3
        && e[0] === "add"
        && isEExp(e[1])
        && isEExp(e[2]);
}

/**
 * An interpreter
 * @function valof
 */
const valof = (exp: EExp, env: LookupTable) => {
    if (isESymbol(exp)) {
        return env(exp);
    } else if (isENumber(exp)) {
        return exp;
    } else if (isEAdd(exp)) {
        const [_, n1, n2]: EAdd = exp;
        return valof(n1, env) + valof(n2, env);
    } else if (isEFunction(exp)) {
        const [_, [x], body]: EFunction = exp;
        return (a) => valof(body, (y) => y === x ? a : env(y));
    } else if (isEApplication(exp)) {
        const [operator, operand]: EApplication = exp;
        return valof(operator, env)(valof(operand, env));
    }
};

// simple addition
console.log(valof(["add", 2, 3], () => undefined));

// create an add1 function
const add1 = valof(["lambda", ["x"], ["add", 1, "x"]], () => undefined);
console.log(add1(5));

// function application
const addTest = [["lambda", ["x"], ["add", "x", 5]], 5];
console.log(valof(addTest, () => undefined));
