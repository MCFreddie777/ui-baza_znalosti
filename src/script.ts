import input from './input/test1';
import { getBindings, getRuleMatches, parseRules } from './Rules';
import { apply, parseFacts } from './Facts';

const rules = parseRules(input.rules);
let facts = parseFacts(input.facts);

const stack = [] as any;
do {
    rules.forEach((rule) => {
        const bindings = getBindings(rule, facts);
        const results = getRuleMatches(bindings);
        results.forEach((result) => {
            facts = apply(rule.then, result, stack, facts);
        });
    });
    facts.push(stack.shift());
} while (stack.length);

console.log('Facts: ', facts);
