import config from './config';
import { flatten, uniq, groupBy, filter, some } from 'lodash';

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

export function getBindings(rule: Rule, facts: Relationship[]): Binding[][][] {
    const bindings: Binding[][][] = [];

    rule.if.forEach((condition) => {
        let relations: Relationship[];

        if (condition.name !== '<>') {
            relations = facts.filter((fact) => condition.name === fact.name);
        } else {
            // Get all subjects
            let subjects: string[] = [];
            facts.forEach((fact) => {
                fact.data.forEach((current) => {
                    if (!subjects.includes(current)) {
                        subjects.push(current);
                    }
                });
            });

            // Map subjects into pairs
            relations = [];
            for (let i = 0; i < subjects.length - 1; i++) {
                for (let j = i + 1; j < subjects.length; j++) {
                    relations.push({ data: [subjects[i], subjects[j]], name: '<>' });
                    relations.push({ data: [subjects[j], subjects[i]], name: '<>' });
                }
            }
        }

        if (!relations.length) return;

        // Create an object where key is relationship name
        bindings.push([]);

        relations.forEach((relation) => {
            bindings[bindings.length - 1].push([]);

            // Push to the last element of array
            relation.data.forEach((value, index) => {
                // Push the binding (X,Y,Z) and the value
                bindings[bindings.length - 1][bindings[bindings.length - 1].length - 1].push({
                    [condition.data[index].replace('?', '')]: value,
                });
            });
        });
    });
    return bindings;
}

export function getRuleMatches(bindings: Binding[][][]): Binding[][] {
    let results: Binding[] = [];
    for (let i = 0; i < bindings.length - 1; i++) {
        // Get keys of first array
        let keys: string[] = uniq(flatten(flatten(bindings[i]).map((item) => Object.keys(item))));
        // Get keys of second array
        keys = keys.concat(
            uniq(flatten(flatten(bindings[i + 1]).map((item) => Object.keys(item))))
        );

        // Get its common row
        const common: string = uniq(
            flatten(
                filter(
                    groupBy(keys, function (n) {
                        return n;
                    }),
                    function (n) {
                        return n.length > 1;
                    }
                )
            )
        )[0];

        // Merge it on its common key
        let result: Binding[] = [];
        bindings[i].forEach((item) => {
            const commonValue = Object.assign(item[0], item[1])[common];
            bindings[i + 1].forEach((second) => {
                if (Object.assign(second[0], second[1])[common] === commonValue) {
                    result.push({
                        ...Object.assign(item[0], item[1]),
                        ...Object.assign(second[0], second[1]),
                    });
                }
            });
        });

        if (!results.length) {
            results = result;
        } else {
            results = results.filter((value: Binding) => some(result, value));
        }
    }

    return results.map((item) =>
        Object.entries(item).map((binding) => ({ [binding[0]]: binding[1] }))
    );
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
