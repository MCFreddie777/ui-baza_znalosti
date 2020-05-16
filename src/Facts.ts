import { Relationship } from './Rules';
import config from './config';

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
