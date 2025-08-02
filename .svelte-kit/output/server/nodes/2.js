

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.n9Bn7ril.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BIErzTan.js","_app/immutable/chunks/Co02gEPa.js"];
export const stylesheets = [];
export const fonts = [];
