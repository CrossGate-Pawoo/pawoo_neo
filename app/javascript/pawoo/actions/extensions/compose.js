export const COMPOSE_TAG_INSERT = 'PAWOO_EXTENSION_COMPOSE_TAG_INSERT';

export function insertTagCompose(tag) {
    return {
        type: COMPOSE_TAG_INSERT,
        tag,
    };
}