export interface User {
    id: string;
    name: string;
    color: string;
    cursor?: {
        line: number;
        column: number;
    };
}

export interface Room {
    id: string;
    users: User[];
    code: string;
    language: string;
}

export interface CodeChange {
    type: 'insert' | 'delete' | 'replace';
    position: number;
    content: string;
    userId: string;
}

export interface CompilerResult {
    output: string;
    error: string;
    executionTime: number;
}

export interface Language {
    id: string;
    name: string;
    extension: string;
    judge0Id: number;
    defaultCode: string;
}