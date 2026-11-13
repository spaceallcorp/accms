export interface Painel {
    id?: string;
    title: string;
    organizacao?: string;
    author?: string;
    content: string;
    createdAt: Date | any;
    updatedAt?: Date | any;
    imageUrl: string;
    painelUrl?: string;
}

