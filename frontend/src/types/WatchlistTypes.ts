export type PickFormValues = {
    userList: string;
    overlap: string;
    numPicks: number;
};

export type PickResponse = {
    title: string;
    poster: string;
    url: string;
    release_year: number;
};

export type PickResponseBrief = {
    title: string;
    url: string;
};
