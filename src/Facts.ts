import { Action, Binding, Relationship } from './Rules';
import config from './config';
import { some, isEqual } from 'lodash';

export function parseFacts(input: string[]) {
    const facts = [] as Relationship[];
    input.forEach((fact) => {
        const relationship = {
            data: [] as string[],
        } as Relationship;

        fact.split(' ')
            .filter((item) => !config.connectors.includes(item))
            .forEach((item) => {
                if (config.relations.includes(item)) relationship.name = item;
                else relationship.data.push(item);
            });
        facts.push(relationship);
    });
    return facts;
}

function bind(what: string[], substitution: Binding[]) {
    // Get rid of ?'s
    what = what.map((string) => string.replace('?', ''));
    // Replace 'X' with { X: Eva } and return 'Eva'
    return what.map((key) => substitution.find((item) => key in item)![key]);
}

export function apply(functions: Action[], items: Binding[], stack: any[], facts: Relationship[]) {
    functions.forEach((fn) => {
        facts = eval(fn.name)(fn.relationship.name, bind(fn.relationship.data, items), {
            stack,
            facts,
        });
    });
    return facts;
}

//@ts-ignore no-unused-function;
function pridaj(relationship: string, subjects: string[], { stack, facts }) {
    const newFact = { data: subjects, name: relationship };
    if (!some(facts, newFact) && !some(stack, newFact)) {
        stack.push(newFact);
    }
    return facts;
}

//@ts-ignore no-unused-function;
function sprava(relationship: string, subjects: string[], { facts }) {
    console.log(`${subjects} ma ${relationship}`);
    return facts;
}

//@ts-ignore no-unused-function;
function vymaz(relationship: string, subjects: string[], { facts }: { facts: Relationship[] }) {
    facts = facts.filter((fact) => !isEqual(fact, { data: [...subjects], name: relationship }));
    return facts;
}
