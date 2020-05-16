import input from './input/test1';
import { getBindings, getRuleMatches, parseRules } from './Rules';
import { parseFacts } from './Facts';

const rules = parseRules(input.rules);
const facts = parseFacts(input.facts);

rules.forEach((rule) => {
    const bindings = getBindings(rule, facts);
    const results = getRuleMatches(bindings);
    // apply rule action with results[0]
});
