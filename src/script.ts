import input from './input/test1';
import { getBindings, getRuleMatches, parseRules } from './Rules';
import { apply, parseFacts } from './Facts';

const rules = parseRules(input.rules);
let facts = parseFacts(input.facts);
const messages: string[] = [];

const stack = [] as any;
do {
    if (stack.length) {
        facts.push(stack.shift());
    }
    rules.forEach((rule) => {
        const bindings = getBindings(rule, facts);
        const results = getRuleMatches(bindings);
        results.forEach((result) => {
            apply(rule.then, result, { messages, stack, facts });
        });
    });
} while (stack.length);

console.log('Facts: ', facts);
