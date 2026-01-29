import { Campaign, Category, Event, News } from "@prisma/client";

export type SerializableCampaign = Omit<Campaign, "targetAmount" | "currentAmount" | "createdAt" | "endDate"> & {
    targetAmount: number;
    currentAmount: number;
    createdAt: string | Date; // Date is serializable if not weird
    endDate: string | Date | null;
    category: string;
};

export type SerializableEvent = Omit<Event, "date" | "createdAt" | "updatedAt"> & {
    date: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
};

export type SerializableNews = Omit<News, "createdAt"> & {
    createdAt: string | Date;
};
