import input from './input/test1';
import { parseRules } from './Rules';
import { parseFacts } from './Facts';

const rules = parseRules(input.rules);
const facts = parseFacts(input.facts);
