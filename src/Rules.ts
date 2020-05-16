import config from './config';

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
