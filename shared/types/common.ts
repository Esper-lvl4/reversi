export type SomeObject = {[key: string]: unknown};

export type StringObject = {[key: string]: string};

export type RecursiveStringObject = {[key: string]: string | StringObject};
