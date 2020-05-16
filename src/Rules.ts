import config from './config';
import { isEqual, uniqWith } from 'lodash';

export function parseRules(input: { name: string; if: string[]; then: string[] }[]) {
    const rules = [] as Rule[];
    input.forEach((rule) => {
        const r: Rule = {
            name: rule.name,
            if: [] as Relationship[],
            then: [] as Action[],
        };

        // parse relationships
        rule.if.forEach((condition) => {
            const relationship: Relationship = {
                name: '',
                data: [],
            };
            const conditions = condition
                .split(' ')
                .filter((item) => !config.connectors.includes(item));

            conditions.forEach((c) => {
                if (c[0] === '?') relationship.data.push(c);
                else relationship.name = c;
            });
            r.if.push(relationship);
        });

        // parse actions
        rule.then.forEach((condition) => {
            const action: Action = {
                name: '',
                relationship: {
                    name: '',
                    data: [],
                },
            };

            const conditions = condition
                .split(' ')
                .filter((item) => !config.connectors.includes(item));

            conditions.forEach((c) => {
                if (c[0] === '?') action.relationship.data.push(c);
                else {
                    if (config.operators.includes(c)) action.name = c;
                    else action.relationship.name = c;
                }
            });
            r.then.push(action);
        });
        rules.push(r);
    });
    return rules;
}

export function getBindings(rule: Rule, facts: Relationship[]): { [key: string]: Binding[][] } {
    const bindings: { [key: string]: Binding[][] } = {};

    rule.if.forEach((condition) => {
        const relations = facts.filter((fact) => condition.name === fact.name);
        if (!relations.length) return;

        // Create an object where key is relationship name
        bindings[condition.name] = [];

        relations.forEach((relation) => {
            bindings[condition.name].push([]);

            // Push to the last element of array
            relation.data.forEach((value, index) => {
                // Push the binding (X,Y,Z) and the value
                bindings[condition.name][bindings[condition.name].length - 1].push({
                    [condition.data[index].replace('?', '')]: value,
                });
            });
        });
    });
    return bindings;
}

export function getRuleMatches(bindings: { [key: string]: Binding[][] }) {
    const results = [] as any;
    const keys: string[] = Object.keys(bindings);
    for (let i = 0; i < keys.length - 1; i++) {
        bindings[keys[i]].forEach((firstConditionMatches: Binding[]) => {
            firstConditionMatches.forEach((firstConditionMatch) => {
                bindings[keys[i + 1]].forEach((secondConditionMatches: Binding[]) => {
                    const equal = secondConditionMatches.some((secondConditionMatch) =>
                        isEqual(firstConditionMatch, secondConditionMatch)
                    );
                    if (equal) {
                        // Returns array of unique bindings [ X: 'x', Y: 'y', Z: 'z']
                        results.push(
                            uniqWith(
                                [...firstConditionMatches, ...secondConditionMatches],
                                (a, b) => Object.keys(a)[0] === Object.keys(b)[0]
                            )
                        );
                    }
                });
            });
        });
    }
    return results;
}

export interface Rule {
    name: string;
    if: Relationship[];
    then: Action[];
}

export interface Relationship {
    name: string;
    data: string[];
}

export interface Action {
    name: string;
    relationship: Relationship;
}

export interface Binding {
    [key: string]: string;
}
